import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessLevel, PlaybookItem, PlaybookScope } from '@prisma/client';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtPayload } from '../auth';
import { CreatePlaybookItemDto } from './dto/create-playbook-item.dto';
import { ToggleChecklistDto } from './dto/toggle-checklist.dto';
import { UpdatePlaybookItemDto } from './dto/update-playbook-item.dto';

export interface IndividualPlaybookItemView {
  id: string;
  title: string;
  description: string;
  scope: PlaybookScope;
  orderIndex: number;
  completed: boolean;
  completedAt: Date | null;
}

export interface SquadPlaybookItemView {
  id: string;
  title: string;
  description: string;
  scope: PlaybookScope;
  targetSquad: string | null;
  orderIndex: number;
  isCompleted: boolean;
  completed: boolean;
}

export interface PlaybookOverviewResponse {
  individual: {
    items: IndividualPlaybookItemView[];
    totalItems: number;
    completedItems: number;
    progressPercentage: number;
  };
  squad: {
    squadName: string | null;
    items: SquadPlaybookItemView[];
    totalItems: number;
    completedItems: number;
    progressPercentage: number;
  };
}

export interface ToggleChecklistResponse {
  playbookItemId: string;
  scope: PlaybookScope;
  completed: boolean;
  completedAt: Date | null;
  progressPercentage: number;
}

export interface DeletePlaybookItemResponse {
  deleted: true;
  id: string;
}

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPlaybook(memberId: string, squadQuery?: string): Promise<PlaybookOverviewResponse> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, squadName: true },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    const [rawIndividualItems, memberChecklists] = await Promise.all([
      this.prisma.playbookItem.findMany({
        where: { scope: PlaybookScope.INDIVIDUAL },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.memberChecklist.findMany({
        where: { memberId },
        select: { playbookItemId: true, completed: true, completedAt: true },
      }),
    ]);

    const checklistByItemId = new Map(
      memberChecklists.map((entry) => [entry.playbookItemId, entry]),
    );

    const individualItems: IndividualPlaybookItemView[] = rawIndividualItems.map((item) => {
      const entry = checklistByItemId.get(item.id);
      const completed = entry?.completed ?? false;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        scope: item.scope,
        orderIndex: item.orderIndex,
        completed,
        completedAt: completed ? (entry?.completedAt ?? null) : null,
      };
    });

    const individualCompletedCount = individualItems.filter((item) => item.completed).length;

    const resolvedSquad = squadQuery?.trim() || member.squadName?.trim() || null;

    const rawSquadItems = resolvedSquad
      ? await this.prisma.playbookItem.findMany({
          where: {
            scope: PlaybookScope.SQUAD,
            targetSquad: { equals: resolvedSquad, mode: 'insensitive' },
          },
          orderBy: { orderIndex: 'asc' },
        })
      : [];

    const squadItems: SquadPlaybookItemView[] = rawSquadItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      scope: item.scope,
      targetSquad: item.targetSquad,
      orderIndex: item.orderIndex,
      isCompleted: item.isCompleted,
      completed: item.isCompleted,
    }));

    const squadCompletedCount = squadItems.filter((item) => item.isCompleted).length;

    return {
      individual: {
        items: individualItems,
        totalItems: individualItems.length,
        completedItems: individualCompletedCount,
        progressPercentage: this.calculatePercentage(
          individualCompletedCount,
          individualItems.length,
        ),
      },
      squad: {
        squadName: resolvedSquad,
        items: squadItems,
        totalItems: squadItems.length,
        completedItems: squadCompletedCount,
        progressPercentage: this.calculatePercentage(squadCompletedCount, squadItems.length),
      },
    };
  }

  async getIndividualProgressByMemberId(memberId: string): Promise<number> {
    const totalItems = await this.prisma.playbookItem.count({
      where: { scope: PlaybookScope.INDIVIDUAL },
    });

    if (totalItems === 0) {
      return 0;
    }

    const completedItems = await this.prisma.memberChecklist.count({
      where: {
        memberId,
        completed: true,
        playbookItem: { scope: PlaybookScope.INDIVIDUAL },
      },
    });

    return this.calculatePercentage(completedItems, totalItems);
  }

  async toggleChecklist(
    requester: JwtPayload,
    dto: ToggleChecklistDto,
  ): Promise<ToggleChecklistResponse> {
    const item = await this.prisma.playbookItem.findUnique({
      where: { id: dto.playbookItemId },
    });

    if (!item) {
      throw new NotFoundException('Item do Playbook não encontrado.');
    }

    if (item.scope === PlaybookScope.INDIVIDUAL) {
      const existing = await this.prisma.memberChecklist.findUnique({
        where: {
          memberId_playbookItemId: {
            memberId: requester.sub,
            playbookItemId: item.id,
          },
        },
      });

      const nextCompleted = dto.completed ?? !(existing?.completed ?? false);
      const nextCompletedAt = nextCompleted ? new Date() : null;

      // Usa upsert na chave composta para evitar registros duplicados ao alternar o mesmo item.
      const saved = await this.prisma.memberChecklist.upsert({
        where: {
          memberId_playbookItemId: {
            memberId: requester.sub,
            playbookItemId: item.id,
          },
        },
        update: {
          completed: nextCompleted,
          completedAt: nextCompletedAt,
        },
        create: {
          memberId: requester.sub,
          playbookItemId: item.id,
          completed: nextCompleted,
          completedAt: nextCompletedAt,
        },
      });

      const progressPercentage = await this.getIndividualProgressByMemberId(requester.sub);

      return {
        playbookItemId: item.id,
        scope: item.scope,
        completed: saved.completed,
        completedAt: saved.completedAt,
        progressPercentage,
      };
    }

    const isManager =
      requester.systemRole === AccessLevel.PRESIDENCIA ||
      requester.systemRole === AccessLevel.DIRETOR;

    if (!isManager) {
      const member = await this.prisma.member.findUnique({
        where: { id: requester.sub },
        select: { id: true, squadName: true },
      });

      if (!member) {
        throw new NotFoundException('Membro não encontrado.');
      }

      const sameSquad =
        Boolean(member.squadName) &&
        Boolean(item.targetSquad) &&
        member.squadName!.trim().toLowerCase() === item.targetSquad!.trim().toLowerCase();

      if (!sameSquad) {
        throw new ForbiddenException(
          'Você só pode atualizar itens do checklist do seu próprio Squad.',
        );
      }
    }

    const nextCompleted = dto.completed ?? !item.isCompleted;

    const updated = await this.prisma.playbookItem.update({
      where: { id: item.id },
      data: { isCompleted: nextCompleted },
    });

    await this.auditService.log({
      authorId: requester.sub,
      module: 'TRAINING',
      action: 'TOGGLE_SQUAD_PLAYBOOK_ITEM',
      details: `Item de Squad "${updated.title}" (${updated.targetSquad ?? 'N/A'}) marcado como ${updated.isCompleted ? 'concluído' : 'pendente'}`,
    });

    const progressPercentage = await this.getSquadProgress(updated.targetSquad);

    return {
      playbookItemId: updated.id,
      scope: updated.scope,
      completed: updated.isCompleted,
      completedAt: null,
      progressPercentage,
    };
  }

  async createItem(dto: CreatePlaybookItemDto, requester: JwtPayload): Promise<PlaybookItem> {
    const targetSquad = this.resolveTargetSquad(dto.scope, dto.targetSquad);

    const created = await this.prisma.playbookItem.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        scope: dto.scope,
        targetSquad,
        orderIndex: dto.orderIndex,
      },
    });

    await this.auditService.log({
      authorId: requester.sub,
      module: 'TRAINING',
      action: 'CREATE_PLAYBOOK_ITEM',
      details: `Item "${created.title}" criado no escopo ${created.scope}${created.targetSquad ? ` (${created.targetSquad})` : ''}`,
    });

    return created;
  }

  async updateItem(
    id: string,
    dto: UpdatePlaybookItemDto,
    requester: JwtPayload,
  ): Promise<PlaybookItem> {
    const existing = await this.prisma.playbookItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Item do Playbook não encontrado.');
    }

    const nextScope = dto.scope ?? existing.scope;
    const rawTargetSquad = dto.targetSquad !== undefined ? dto.targetSquad : existing.targetSquad;
    const targetSquad = this.resolveTargetSquad(nextScope, rawTargetSquad);

    const updated = await this.prisma.playbookItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.scope !== undefined ? { scope: dto.scope } : {}),
        targetSquad,
        ...(dto.orderIndex !== undefined ? { orderIndex: dto.orderIndex } : {}),
        ...(dto.isCompleted !== undefined ? { isCompleted: dto.isCompleted } : {}),
      },
    });

    await this.auditService.log({
      authorId: requester.sub,
      module: 'TRAINING',
      action: 'UPDATE_PLAYBOOK_ITEM',
      details: `Item "${updated.title}" (${id}) atualizado no escopo ${updated.scope}`,
    });

    return updated;
  }

  async removeItem(id: string, requester: JwtPayload): Promise<DeletePlaybookItemResponse> {
    const existing = await this.prisma.playbookItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Item do Playbook não encontrado.');
    }

    // MemberChecklist não possui onDelete: Cascade no schema.prisma; removemos os filhos antes na transação.
    await this.prisma.$transaction([
      this.prisma.memberChecklist.deleteMany({ where: { playbookItemId: id } }),
      this.prisma.playbookItem.delete({ where: { id } }),
    ]);

    await this.auditService.log({
      authorId: requester.sub,
      module: 'TRAINING',
      action: 'DELETE_PLAYBOOK_ITEM',
      details: `Item "${existing.title}" (${id}) removido do Playbook`,
    });

    return { deleted: true, id };
  }

  private async getSquadProgress(squadName: string | null): Promise<number> {
    if (!squadName) {
      return 0;
    }

    const squadItems = await this.prisma.playbookItem.findMany({
      where: {
        scope: PlaybookScope.SQUAD,
        targetSquad: { equals: squadName, mode: 'insensitive' },
      },
      select: { isCompleted: true },
    });

    const completedCount = squadItems.filter((item) => item.isCompleted).length;
    return this.calculatePercentage(completedCount, squadItems.length);
  }

  private resolveTargetSquad(scope: PlaybookScope, targetSquad?: string | null): string | null {
    if (scope === PlaybookScope.INDIVIDUAL) {
      return null;
    }

    const normalized = targetSquad?.trim() ?? '';
    if (!normalized) {
      throw new BadRequestException(
        'Itens de escopo SQUAD exigem o preenchimento do campo targetSquad.',
      );
    }

    return normalized;
  }

  private calculatePercentage(completedCount: number, totalCount: number): number {
    if (totalCount <= 0) {
      return 0;
    }

    return Math.round((completedCount / totalCount) * 100);
  }
}
