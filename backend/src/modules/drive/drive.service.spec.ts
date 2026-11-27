import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevel } from '@prisma/client';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtPayload } from '../auth';
import { CreateDriveCardDto } from './dto/create-drive-card.dto';
import { UpdateDriveCardDto } from './dto/update-drive-card.dto';
import { DriveService } from './drive.service';

describe('DriveService', () => {
  let driveService: DriveService;
  let prismaService: {
    driveCard: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditService: {
    log: jest.Mock;
  };

  const director: JwtPayload = {
    sub: '33333333-3333-4333-8333-333333333333',
    email: 'projetos@asciiej.com.br',
    systemRole: AccessLevel.DIRETOR,
    roleTitle: 'Diretor de Projetos',
    department: 'PROJETOS',
  };

  const createDto: CreateDriveCardDto = {
    title: 'Atas das Reuniões Gerais',
    description: 'Atas e listas de presença das RGs de 2026/2.',
    driveUrl: 'https://drive.google.com/drive/folders/ascii-atas-rg',
    category: 'PRESIDENCIA',
  };

  const existingCard = {
    id: '55555555-5555-4555-8555-555555555553',
    ...createDto,
    createdById: '11111111-1111-4111-8111-111111111111',
    createdAt: new Date('2026-11-20T10:00:00.000Z'),
    updatedAt: new Date('2026-11-20T10:00:00.000Z'),
  };

  beforeEach(async () => {
    prismaService = {
      driveCard: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriveService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    driveService = module.get<DriveService>(DriveService);
  });

  describe('findAll', () => {
    beforeEach(() => {
      prismaService.driveCard.findMany.mockResolvedValue([existingCard]);
    });

    it('should list all cards when no filter is given', async () => {
      const result = await driveService.findAll({});

      expect(result).toEqual([existingCard]);
      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('should search title and description case-insensitively', async () => {
      await driveService.findAll({ search: '  ata  ' });

      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'ata', mode: 'insensitive' } },
              { description: { contains: 'ata', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter by category', async () => {
      await driveService.findAll({ category: 'FINANCEIRO' });

      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { category: 'FINANCEIRO' } }),
      );
    });

    it('should combine search and category', async () => {
      await driveService.findAll({ search: 'contrato', category: 'FINANCEIRO' });

      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: 'FINANCEIRO',
            OR: [
              { title: { contains: 'contrato', mode: 'insensitive' } },
              { description: { contains: 'contrato', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should ignore blank search', async () => {
      await driveService.findAll({ search: '   ' });

      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('should order cards from newest to oldest', async () => {
      await driveService.findAll({});

      expect(prismaService.driveCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should never load sensitive author fields', async () => {
      await driveService.findAll({});

      const [findManyArgs] = prismaService.driveCard.findMany.mock.calls[0];
      expect([undefined, { select: { id: true, name: true } }]).toContainEqual(
        findManyArgs.include?.createdBy,
      );
    });
  });

  describe('create', () => {
    it('should set createdById from the authenticated requester', async () => {
      prismaService.driveCard.create.mockResolvedValue({
        ...existingCard,
        createdById: director.sub,
      });

      await driveService.create(createDto, director);

      expect(prismaService.driveCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { ...createDto, createdById: director.sub },
        }),
      );
    });

    it('should ignore a createdById smuggled into the payload', async () => {
      prismaService.driveCard.create.mockResolvedValue({
        ...existingCard,
        createdById: director.sub,
      });
      const smuggledDto = {
        ...createDto,
        createdById: '99999999-9999-4999-8999-999999999999',
      } as CreateDriveCardDto;

      await driveService.create(smuggledDto, director);

      const [createArgs] = prismaService.driveCard.create.mock.calls[0];
      expect(createArgs.data.createdById).toBe(director.sub);
    });

    it('should return the created card and log CREATE_DRIVE_CARD audit with module DRIVE', async () => {
      const createdCard = { ...existingCard, createdById: director.sub };
      prismaService.driveCard.create.mockResolvedValue(createdCard);

      const result = await driveService.create(createDto, director);

      expect(result).toEqual(createdCard);
      expect(auditService.log).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: director.sub,
        module: 'DRIVE',
        action: 'CREATE_DRIVE_CARD',
        details: expect.stringContaining(createdCard.title),
      });
    });

    it('should not log audit when the database write fails', async () => {
      prismaService.driveCard.create.mockRejectedValue(new Error('database unavailable'));

      await expect(driveService.create(createDto, director)).rejects.toThrow(
        'database unavailable',
      );
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when updating a missing card', async () => {
      prismaService.driveCard.findUnique.mockResolvedValue(null);

      await expect(
        driveService.update(existingCard.id, { title: 'Novo título' }, director),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.driveCard.update).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('should update only provided fields and keep createdBy', async () => {
      prismaService.driveCard.findUnique.mockResolvedValue(existingCard);
      prismaService.driveCard.update.mockResolvedValue({ ...existingCard, title: 'Novo título' });
      const smuggledDto = {
        title: 'Novo título',
        createdById: director.sub,
      } as UpdateDriveCardDto;

      await driveService.update(existingCard.id, smuggledDto, director);

      expect(prismaService.driveCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: existingCard.id },
          data: { title: 'Novo título' },
        }),
      );
      const [updateArgs] = prismaService.driveCard.update.mock.calls[0];
      expect(updateArgs.data.createdById).toBeUndefined();
    });

    it('should return the updated card and log UPDATE_DRIVE_CARD audit with module DRIVE', async () => {
      const updatedCard = { ...existingCard, title: 'Novo título' };
      prismaService.driveCard.findUnique.mockResolvedValue(existingCard);
      prismaService.driveCard.update.mockResolvedValue(updatedCard);

      const result = await driveService.update(existingCard.id, { title: 'Novo título' }, director);

      expect(result).toEqual(updatedCard);
      expect(auditService.log).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: director.sub,
        module: 'DRIVE',
        action: 'UPDATE_DRIVE_CARD',
        details: expect.stringContaining('Novo título'),
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when removing a missing card', async () => {
      prismaService.driveCard.findUnique.mockResolvedValue(null);

      await expect(driveService.remove(existingCard.id, director)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.driveCard.delete).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('should delete the card and log DELETE_DRIVE_CARD audit with module DRIVE', async () => {
      prismaService.driveCard.findUnique.mockResolvedValue(existingCard);
      prismaService.driveCard.delete.mockResolvedValue(existingCard);

      await driveService.remove(existingCard.id, director);

      expect(prismaService.driveCard.delete).toHaveBeenCalledWith({
        where: { id: existingCard.id },
      });
      expect(auditService.log).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: director.sub,
        module: 'DRIVE',
        action: 'DELETE_DRIVE_CARD',
        details: expect.stringContaining(existingCard.title),
      });
    });
  });
});
