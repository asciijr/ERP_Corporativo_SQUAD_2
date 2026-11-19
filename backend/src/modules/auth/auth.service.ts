import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthenticatedUser,
  AuthMeResponse,
  JwtPayload,
  LoginResponse,
  RegisterResponse,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();
    const member = await this.prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (!member || !member.isActive) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, member.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload: JwtPayload = {
      sub: member.id,
      email: member.email,
      systemRole: member.accessLevel,
      roleTitle: member.roleTitle,
      department: member.department,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthenticatedUser(member),
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const email = registerDto.email.trim().toLowerCase();
    const ufuEmail = registerDto.ufuEmail.trim().toLowerCase();
    const cpf = registerDto.cpf.replace(/\D/g, '');
    const phone = registerDto.phone.replace(/\D/g, '');
    const ufuRegistration = registerDto.ufuRegistration.trim();

    if (!email.endsWith('@asciiej.com.br')) {
      throw new BadRequestException(
        'O e-mail corporativo deve pertencer ao domínio @asciiej.com.br.',
      );
    }

    if (!ufuEmail.endsWith('@ufu.br')) {
      throw new BadRequestException(
        'O e-mail institucional da UFU deve pertencer ao domínio @ufu.br.',
      );
    }

    if (cpf.length !== 11) {
      throw new BadRequestException('Informe um CPF válido com exatamente 11 dígitos.');
    }

    if (phone.length < 10 || phone.length > 11) {
      throw new BadRequestException('Informe um telefone válido com DDD.');
    }

    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [{ email }, { ufuEmail }, { cpf }, { ufuRegistration }],
      },
    });

    if (existingMember) {
      throw new ConflictException(
        'E-mail corporativo, e-mail UFU, CPF ou matrícula UFU já estão cadastrados.',
      );
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const createdMember = await this.prisma.member.create({
      data: {
        name: registerDto.name.trim(),
        email,
        ufuEmail,
        passwordHash,
        birthDate: registerDto.birthDate.trim(),
        phone,
        cpf,
        ufuRegistration,
        course: registerDto.course,
        roleTitle: 'Trainee',
        accessLevel: AccessLevel.MEMBRO,
        department: 'A DEFINIR',
        skills: [],
        isActive: true,
      },
    });

    if (this.auditService) {
      await this.auditService.log({
        authorId: createdMember.id,
        module: 'AUTH',
        action: 'REGISTER_MEMBER',
        details: `Autocadastro corporativo realizado para ${createdMember.email}`,
      });
    }

    const payload: JwtPayload = {
      sub: createdMember.id,
      email: createdMember.email,
      systemRole: createdMember.accessLevel,
      roleTitle: createdMember.roleTitle,
      department: createdMember.department,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      accessLevel: createdMember.accessLevel,
      user: this.toAuthenticatedUser(createdMember),
    };
  }

  async getMe(memberId: string): Promise<AuthMeResponse> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || !member.isActive) {
      throw new UnauthorizedException('Utilizador não encontrado ou inativo.');
    }

    const publicUser = this.toAuthenticatedUser(member);
    const isPresidencia = member.accessLevel === AccessLevel.PRESIDENCIA;
    const isDirector =
      member.accessLevel === AccessLevel.PRESIDENCIA || member.accessLevel === AccessLevel.DIRETOR;
    const canAccessFinance =
      member.accessLevel === AccessLevel.PRESIDENCIA ||
      (member.accessLevel === AccessLevel.DIRETOR && member.department === 'FINANCEIRO');
    const isMember = member.accessLevel === AccessLevel.MEMBRO;

    return {
      ...publicUser,
      isPresidencia,
      isDirector,
      canAccessFinance,
      isMember,
    };
  }

  private toAuthenticatedUser(member: {
    id: string;
    name: string;
    email: string;
    roleTitle: string;
    accessLevel: AccessLevel;
    department: string;
    avatarUrl: string | null;
  }): AuthenticatedUser {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      roleTitle: member.roleTitle,
      systemRole: member.accessLevel,
      department: member.department,
      avatarUrl: member.avatarUrl,
    };
  }
}
