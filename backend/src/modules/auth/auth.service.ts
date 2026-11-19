import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import {
  AuthenticatedUser,
  AuthMeResponse,
  JwtPayload,
  LoginResponse,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const member = await this.prisma.member.findUnique({
      where: { email: loginDto.email },
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
