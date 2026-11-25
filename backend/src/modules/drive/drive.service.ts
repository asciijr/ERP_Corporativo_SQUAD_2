import { Injectable, NotFoundException } from '@nestjs/common';
import { DriveCard, Prisma } from '@prisma/client';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtPayload } from '../auth';
import { DRIVE_AUDIT_MODULE } from './drive.constants';
import { CreateDriveCardDto } from './dto/create-drive-card.dto';
import { ListDriveCardsQueryDto } from './dto/list-drive-cards-query.dto';
import { UpdateDriveCardDto } from './dto/update-drive-card.dto';

/** Só o id e o nome do autor: nunca e-mail, CPF, telefone ou hash de senha. */
const driveCardInclude = {
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.DriveCardInclude;

export type DriveCardWithAuthor = Prisma.DriveCardGetPayload<{
  include: typeof driveCardInclude;
}>;

@Injectable()
export class DriveService {
  // Sem @Optional() no AuditService: o DoD do card exige log em toda mutação,
  // então o módulo deve falhar ao subir se a auditoria não estiver disponível.
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: ListDriveCardsQueryDto): Promise<DriveCardWithAuthor[]> {
    const where: Prisma.DriveCardWhereInput = {};
    const search = query.search?.trim();

    if (query.category) {
      where.category = query.category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.driveCard.findMany({
      where,
      include: driveCardInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateDriveCardDto, requester: JwtPayload): Promise<DriveCardWithAuthor> {
    // Campos copiados um a um: o autor vem sempre do JWT, nunca do corpo.
    const created = await this.prisma.driveCard.create({
      data: {
        title: dto.title,
        description: dto.description,
        driveUrl: dto.driveUrl,
        category: dto.category,
        createdById: requester.sub,
      },
      include: driveCardInclude,
    });

    await this.auditService.log({
      authorId: requester.sub,
      module: DRIVE_AUDIT_MODULE,
      action: 'CREATE_DRIVE_CARD',
      details: `Card "${created.title}" criado na categoria ${created.category}`,
    });

    return created;
  }

  async update(
    id: string,
    dto: UpdateDriveCardDto,
    requester: JwtPayload,
  ): Promise<DriveCardWithAuthor> {
    await this.findExistingOrThrow(id);

    const data: Prisma.DriveCardUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.driveUrl !== undefined) data.driveUrl = dto.driveUrl;
    if (dto.category !== undefined) data.category = dto.category;

    const updated = await this.prisma.driveCard.update({
      where: { id },
      data,
      include: driveCardInclude,
    });

    await this.auditService.log({
      authorId: requester.sub,
      module: DRIVE_AUDIT_MODULE,
      action: 'UPDATE_DRIVE_CARD',
      details: `Card "${updated.title}" atualizado (campos: ${Object.keys(data).join(', ') || 'nenhum'})`,
    });

    return updated;
  }

  async remove(id: string, requester: JwtPayload): Promise<void> {
    const existing = await this.findExistingOrThrow(id);

    await this.prisma.driveCard.delete({ where: { id } });

    await this.auditService.log({
      authorId: requester.sub,
      module: DRIVE_AUDIT_MODULE,
      action: 'DELETE_DRIVE_CARD',
      details: `Card "${existing.title}" removido da categoria ${existing.category}`,
    });
  }

  private async findExistingOrThrow(id: string): Promise<DriveCard> {
    const card = await this.prisma.driveCard.findUnique({ where: { id } });

    if (!card) {
      throw new NotFoundException('Card do Drive não encontrado.');
    }

    return card;
  }
}
