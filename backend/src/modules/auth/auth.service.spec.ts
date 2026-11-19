import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: {
    member: {
      findUnique: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  const plainPassword = 'Ascii@2026';
  const hashedPassword = bcrypt.hashSync(plainPassword, 4);

  const activeDirectorFinance = {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Lucas Mendes',
    email: 'financeiro@ascii.org.br',
    passwordHash: hashedPassword,
    avatarUrl: 'https://example.com/avatar.png',
    roleTitle: 'Diretor Financeiro',
    accessLevel: AccessLevel.DIRETOR,
    department: 'FINANCEIRO',
    course: 'Sistemas de Informação',
    semester: '6º Período',
    squadName: 'Gestão & Finanças',
    skills: ['Fluxo de Caixa', 'DRE'],
    isActive: true,
    createdAt: new Date('2026-11-18T10:00:00.000Z'),
    updatedAt: new Date('2026-11-18T10:00:00.000Z'),
  };

  beforeEach(async () => {
    prismaService = {
      member: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return accessToken and public user without passwordHash on valid credentials', async () => {
      prismaService.member.findUnique.mockResolvedValue(activeDirectorFinance);
      jwtService.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await authService.login({
        email: activeDirectorFinance.email,
        password: plainPassword,
      });

      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        user: {
          id: activeDirectorFinance.id,
          name: activeDirectorFinance.name,
          email: activeDirectorFinance.email,
          roleTitle: activeDirectorFinance.roleTitle,
          systemRole: activeDirectorFinance.accessLevel,
          department: activeDirectorFinance.department,
          avatarUrl: activeDirectorFinance.avatarUrl,
        },
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should sign JWT using the Squad 1 integration contract payload', async () => {
      prismaService.member.findUnique.mockResolvedValue(activeDirectorFinance);
      jwtService.signAsync.mockResolvedValue('signed-jwt-token');

      await authService.login({
        email: activeDirectorFinance.email,
        password: plainPassword,
      });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: activeDirectorFinance.id,
        email: activeDirectorFinance.email,
        systemRole: activeDirectorFinance.accessLevel,
        roleTitle: activeDirectorFinance.roleTitle,
        department: activeDirectorFinance.department,
      });
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'naoexiste@ascii.org.br',
          password: plainPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      prismaService.member.findUnique.mockResolvedValue(activeDirectorFinance);

      await expect(
        authService.login({
          email: activeDirectorFinance.email,
          password: 'SenhaIncorreta123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when member is inactive', async () => {
      prismaService.member.findUnique.mockResolvedValue({
        ...activeDirectorFinance,
        isActive: false,
      });

      await expect(
        authService.login({
          email: activeDirectorFinance.email,
          password: plainPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return public user data and role flags for PRESIDENCIA without passwordHash', async () => {
      const president = {
        ...activeDirectorFinance,
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Ana Carolina Souza',
        email: 'presidencia@ascii.org.br',
        roleTitle: 'Presidente',
        accessLevel: AccessLevel.PRESIDENCIA,
        department: 'PRESIDENCIA',
      };
      prismaService.member.findUnique.mockResolvedValue(president);

      const result = await authService.getMe(president.id);

      expect(result).toEqual({
        id: president.id,
        name: president.name,
        email: president.email,
        roleTitle: president.roleTitle,
        systemRole: AccessLevel.PRESIDENCIA,
        department: president.department,
        avatarUrl: president.avatarUrl,
        isPresidencia: true,
        isDirector: true,
        canAccessFinance: true,
        isMember: false,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return canAccessFinance true for DIRETOR in FINANCEIRO', async () => {
      prismaService.member.findUnique.mockResolvedValue(activeDirectorFinance);

      const result = await authService.getMe(activeDirectorFinance.id);

      expect(result.isPresidencia).toBe(false);
      expect(result.isDirector).toBe(true);
      expect(result.canAccessFinance).toBe(true);
      expect(result.isMember).toBe(false);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return canAccessFinance false for DIRETOR outside FINANCEIRO', async () => {
      const projectsDirector = {
        ...activeDirectorFinance,
        id: '33333333-3333-4333-8333-333333333333',
        email: 'projetos@ascii.org.br',
        roleTitle: 'Diretor de Projetos',
        accessLevel: AccessLevel.DIRETOR,
        department: 'PROJETOS',
      };
      prismaService.member.findUnique.mockResolvedValue(projectsDirector);

      const result = await authService.getMe(projectsDirector.id);

      expect(result.isPresidencia).toBe(false);
      expect(result.isDirector).toBe(true);
      expect(result.canAccessFinance).toBe(false);
      expect(result.isMember).toBe(false);
    });

    it('should return isMember true and management flags false for MEMBRO', async () => {
      const member = {
        ...activeDirectorFinance,
        id: '44444444-4444-4444-8444-444444444444',
        email: 'membro@ascii.org.br',
        roleTitle: 'Desenvolvedor',
        accessLevel: AccessLevel.MEMBRO,
        department: 'PROJETOS',
      };
      prismaService.member.findUnique.mockResolvedValue(member);

      const result = await authService.getMe(member.id);

      expect(result.isPresidencia).toBe(false);
      expect(result.isDirector).toBe(false);
      expect(result.canAccessFinance).toBe(false);
      expect(result.isMember).toBe(true);
    });

    it('should throw UnauthorizedException when member does not exist or is inactive', async () => {
      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(authService.getMe('non-existent-id')).rejects.toThrow(UnauthorizedException);

      prismaService.member.findUnique.mockResolvedValue({
        ...activeDirectorFinance,
        isActive: false,
      });

      await expect(authService.getMe(activeDirectorFinance.id)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
