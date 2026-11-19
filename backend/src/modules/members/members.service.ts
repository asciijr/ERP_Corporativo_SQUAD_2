import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AccessLevel, Member } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtPayload } from '../auth';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

export interface PublicMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleTitle: string;
  accessLevel: AccessLevel;
  department: string;
  course: string | null;
  semester: string | null;
  squadName: string | null;
  skills: string[];
  playbookProgress: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DetailedMember extends PublicMember {
  ufuEmail: string | null;
  birthDate: string | null;
  phone: string | null;
  cpf: string | null;
  ufuRegistration: string | null;
}

type MemberWithChecklists = Member & {
  checklists?: Array<{ completed: boolean }>;
};

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async findAll(activeOnly?: boolean): Promise<PublicMember[]> {
    const members = await this.prisma.member.findMany({
      where: {
        ...(typeof activeOnly === 'boolean' ? { isActive: activeOnly } : {}),
        accessLevel: { not: AccessLevel.PRESIDENCIA },
        NOT: [{ roleTitle: { equals: 'Admin', mode: 'insensitive' } }],
      },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return members.map((member) => this.toPublicMember(member));
  }

  async findAllActive(): Promise<PublicMember[]> {
    return this.findAll(true);
  }

  async findById(id: string): Promise<PublicMember> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    return this.toPublicMember(member);
  }

  async findDetailById(id: string, requester?: JwtPayload): Promise<PublicMember | DetailedMember> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    const canViewSensitiveFields =
      requester?.systemRole === AccessLevel.PRESIDENCIA ||
      requester?.systemRole === AccessLevel.DIRETOR ||
      requester?.sub === member.id;

    if (canViewSensitiveFields) {
      return this.toDetailedMember(member);
    }

    return this.toPublicMember(member);
  }

  async create(createDto: CreateMemberDto, requester: JwtPayload): Promise<PublicMember> {
    const email = createDto.email.trim().toLowerCase();
    const ufuEmail = createDto.ufuEmail?.trim().toLowerCase() || null;
    const cpf = createDto.cpf ? createDto.cpf.replace(/\D/g, '') : null;
    const ufuRegistration = createDto.ufuRegistration?.trim() || null;

    if (
      createDto.accessLevel &&
      createDto.accessLevel !== AccessLevel.MEMBRO &&
      requester.systemRole !== AccessLevel.PRESIDENCIA
    ) {
      throw new ForbiddenException(
        'Apenas a Presidência pode cadastrar membros com nível de Diretoria ou Presidência.',
      );
    }

    const orFilters: Array<Record<string, string>> = [{ email }];
    if (ufuEmail) {
      orFilters.push({ ufuEmail });
    }
    if (cpf) {
      orFilters.push({ cpf });
    }
    if (ufuRegistration) {
      orFilters.push({ ufuRegistration });
    }

    const existing = await this.prisma.member.findFirst({
      where: { OR: orFilters },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe um membro cadastrado com o mesmo e-mail, CPF ou matrícula UFU.',
      );
    }

    const passwordHash = await bcrypt.hash(createDto.password, 10);

    const created = await this.prisma.member.create({
      data: {
        name: createDto.name.trim(),
        email,
        ufuEmail,
        passwordHash,
        roleTitle: createDto.roleTitle.trim(),
        department: createDto.department.trim(),
        accessLevel: createDto.accessLevel ?? AccessLevel.MEMBRO,
        course: createDto.course ?? null,
        semester: createDto.semester ?? null,
        squadName: createDto.squadName ?? null,
        skills: createDto.skills ?? [],
        avatarUrl: createDto.avatarUrl ?? null,
        birthDate: createDto.birthDate ?? null,
        phone: createDto.phone ? createDto.phone.replace(/\D/g, '') : null,
        cpf,
        ufuRegistration,
        isActive: createDto.isActive ?? true,
      },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
    });

    if (this.auditService) {
      await this.auditService.log({
        authorId: requester.sub,
        module: 'MEMBERS',
        action: 'CREATE_MEMBER',
        details: `Membro ${created.email} criado com cargo ${created.roleTitle}`,
      });
    }

    return this.toPublicMember(created);
  }

  async updateOwnProfile(memberId: string, updateDto: UpdateMyProfileDto): Promise<DetailedMember> {
    const existing = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!existing) {
      throw new NotFoundException('Membro não encontrado.');
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        ...(updateDto.name !== undefined ? { name: updateDto.name.trim() } : {}),
        ...(updateDto.avatarUrl !== undefined ? { avatarUrl: updateDto.avatarUrl } : {}),
        ...(updateDto.phone !== undefined ? { phone: updateDto.phone.replace(/\D/g, '') } : {}),
        ...(updateDto.course !== undefined ? { course: updateDto.course } : {}),
        ...(updateDto.semester !== undefined ? { semester: updateDto.semester } : {}),
        ...(updateDto.skills !== undefined ? { skills: updateDto.skills } : {}),
      },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
    });

    if (this.auditService) {
      await this.auditService.log({
        authorId: memberId,
        module: 'MEMBERS',
        action: 'UPDATE_OWN_PROFILE',
        details: `Perfil próprio atualizado por ${updated.email}`,
      });
    }

    return this.toDetailedMember(updated);
  }

  async updateMemberRole(
    id: string,
    updateDto: UpdateMemberDto,
    requester: JwtPayload,
  ): Promise<DetailedMember> {
    const existing = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Membro não encontrado.');
    }

    if (
      updateDto.accessLevel !== undefined &&
      updateDto.accessLevel !== existing.accessLevel &&
      requester.systemRole !== AccessLevel.PRESIDENCIA
    ) {
      throw new ForbiddenException(
        'Apenas a Presidência pode alterar o nível de acesso no sistema.',
      );
    }

    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        ...(updateDto.roleTitle !== undefined ? { roleTitle: updateDto.roleTitle.trim() } : {}),
        ...(updateDto.department !== undefined ? { department: updateDto.department.trim() } : {}),
        ...(updateDto.squadName !== undefined ? { squadName: updateDto.squadName } : {}),
        ...(updateDto.isActive !== undefined ? { isActive: updateDto.isActive } : {}),
        ...(updateDto.accessLevel !== undefined && requester.systemRole === AccessLevel.PRESIDENCIA
          ? { accessLevel: updateDto.accessLevel }
          : {}),
        ...(updateDto.course !== undefined ? { course: updateDto.course } : {}),
        ...(updateDto.semester !== undefined ? { semester: updateDto.semester } : {}),
        ...(updateDto.skills !== undefined ? { skills: updateDto.skills } : {}),
      },
      include: {
        checklists: {
          select: { completed: true },
        },
      },
    });

    if (this.auditService) {
      await this.auditService.log({
        authorId: requester.sub,
        module: 'MEMBERS',
        action: 'UPDATE_MEMBER_ROLE',
        details: `Atribuições de ${updated.email} atualizadas (cargo: ${updated.roleTitle}, diretoria: ${updated.department}, nível: ${updated.accessLevel})`,
      });
    }

    return this.toDetailedMember(updated);
  }

  private computePlaybookProgress(checklists?: Array<{ completed: boolean }>): number {
    if (!Array.isArray(checklists) || checklists.length === 0) {
      return 0;
    }
    const completedCount = checklists.filter((item) => item.completed).length;
    return Math.round((completedCount / checklists.length) * 100);
  }

  private toPublicMember(member: MemberWithChecklists): PublicMember {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl,
      roleTitle: member.roleTitle,
      accessLevel: member.accessLevel,
      department: member.department,
      course: member.course,
      semester: member.semester,
      squadName: member.squadName,
      skills: member.skills,
      playbookProgress: this.computePlaybookProgress(member.checklists),
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  private toDetailedMember(member: MemberWithChecklists): DetailedMember {
    return {
      ...this.toPublicMember(member),
      ufuEmail: member.ufuEmail ?? null,
      birthDate: member.birthDate ?? null,
      phone: member.phone ?? null,
      cpf: member.cpf ?? null,
      ufuRegistration: member.ufuRegistration ?? null,
    };
  }
}
