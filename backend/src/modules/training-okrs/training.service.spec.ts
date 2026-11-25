import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevel, PlaybookScope } from '@prisma/client';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { DirectorGuard, JwtAuthGuard, JwtPayload } from '../auth';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

describe('TrainingService', () => {
  let trainingService: TrainingService;
  let prismaService: {
    member: {
      findUnique: jest.Mock;
    };
    playbookItem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    memberChecklist: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditService: {
    log: jest.Mock;
  };

  const memberRequester: JwtPayload = {
    sub: '44444444-4444-4444-8444-444444444444',
    email: 'membro@asciiej.com.br',
    systemRole: AccessLevel.MEMBRO,
    roleTitle: 'Assessor',
    department: 'PROJETOS',
  };

  const directorRequester: JwtPayload = {
    sub: '33333333-3333-4333-8333-333333333333',
    email: 'projetos@asciiej.com.br',
    systemRole: AccessLevel.DIRETOR,
    roleTitle: 'Diretor',
    department: 'PROJETOS',
  };

  const individualItem1 = {
    id: '66666666-6666-4666-8666-666666666661',
    title: 'Configurar Ambiente Docker-First do ERP',
    description: 'Subir containers locais e validar testes.',
    scope: PlaybookScope.INDIVIDUAL,
    targetSquad: null,
    orderIndex: 1,
    isCompleted: false,
  };

  const individualItem2 = {
    id: '66666666-6666-4666-8666-666666666663',
    title: 'Ler Guia de Engenharia ASCII',
    description: 'Revisar Monólito Modular e TDD.',
    scope: PlaybookScope.INDIVIDUAL,
    targetSquad: null,
    orderIndex: 2,
    isCompleted: false,
  };

  const squad2Item = {
    id: '66666666-6666-4666-8666-666666666662',
    title: 'Revisão de Arquitetura e Contratos Squad 2',
    description: 'Validar fronteiras entre módulos.',
    scope: PlaybookScope.SQUAD,
    targetSquad: 'Squad 2',
    orderIndex: 1,
    isCompleted: false,
  };

  const squad1Item = {
    id: '66666666-6666-4666-8666-666666666664',
    title: 'Entrega de Contratos Squad 1',
    description: 'Alinhar módulo operacional.',
    scope: PlaybookScope.SQUAD,
    targetSquad: 'Squad 1',
    orderIndex: 1,
    isCompleted: true,
  };

  beforeEach(async () => {
    prismaService = {
      member: {
        findUnique: jest.fn(),
      },
      playbookItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      memberChecklist: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((operations: Array<Promise<unknown>>) => Promise.all(operations)),
    };

    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    trainingService = module.get<TrainingService>(TrainingService);
  });

  describe('getPlaybook', () => {
    it('should return 0% (never NaN) when there are 0 individual and 0 squad items', async () => {
      prismaService.member.findUnique.mockResolvedValue({
        id: memberRequester.sub,
        squadName: 'Squad 2',
      });
      prismaService.playbookItem.findMany.mockResolvedValue([]);
      prismaService.memberChecklist.findMany.mockResolvedValue([]);

      const result = await trainingService.getPlaybook(memberRequester.sub);

      expect(result.individual).toEqual({
        items: [],
        totalItems: 0,
        completedItems: 0,
        progressPercentage: 0,
      });
      expect(Number.isNaN(result.individual.progressPercentage)).toBe(false);
      expect(result.squad).toEqual({
        squadName: 'Squad 2',
        items: [],
        totalItems: 0,
        completedItems: 0,
        progressPercentage: 0,
      });
      expect(Number.isNaN(result.squad.progressPercentage)).toBe(false);
    });

    it('should calculate exact partial and complete percentages and filter by member squadName', async () => {
      const completedDate = new Date('2026-11-18T12:00:00.000Z');
      prismaService.member.findUnique.mockResolvedValue({
        id: memberRequester.sub,
        squadName: 'Squad 2',
      });
      prismaService.playbookItem.findMany
        .mockResolvedValueOnce([individualItem1, individualItem2])
        .mockResolvedValueOnce([{ ...squad2Item, isCompleted: true }]);
      prismaService.memberChecklist.findMany.mockResolvedValue([
        {
          playbookItemId: individualItem1.id,
          completed: true,
          completedAt: completedDate,
        },
      ]);

      const result = await trainingService.getPlaybook(memberRequester.sub);

      expect(result.individual.totalItems).toBe(2);
      expect(result.individual.completedItems).toBe(1);
      expect(result.individual.progressPercentage).toBe(50);
      expect(result.individual.items[0].completed).toBe(true);
      expect(result.individual.items[0].completedAt).toEqual(completedDate);
      expect(result.individual.items[1].completed).toBe(false);
      expect(result.individual.items[1].completedAt).toBeNull();

      expect(result.squad.squadName).toBe('Squad 2');
      expect(result.squad.progressPercentage).toBe(100);
      expect(prismaService.playbookItem.findMany).toHaveBeenLastCalledWith({
        where: {
          scope: PlaybookScope.SQUAD,
          targetSquad: { equals: 'Squad 2', mode: 'insensitive' },
        },
        orderBy: { orderIndex: 'asc' },
      });
    });

    it('should override member squadName when ?squad= query param is provided', async () => {
      prismaService.member.findUnique.mockResolvedValue({
        id: memberRequester.sub,
        squadName: 'Squad 2',
      });
      prismaService.playbookItem.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([squad1Item]);
      prismaService.memberChecklist.findMany.mockResolvedValue([]);

      const result = await trainingService.getPlaybook(memberRequester.sub, 'Squad 1');

      expect(result.squad.squadName).toBe('Squad 1');
      expect(result.squad.items).toHaveLength(1);
      expect(result.squad.progressPercentage).toBe(100);
      expect(prismaService.playbookItem.findMany).toHaveBeenLastCalledWith({
        where: {
          scope: PlaybookScope.SQUAD,
          targetSquad: { equals: 'Squad 1', mode: 'insensitive' },
        },
        orderBy: { orderIndex: 'asc' },
      });
    });

    it('should throw NotFoundException when member does not exist', async () => {
      prismaService.member.findUnique.mockResolvedValue(null);

      await expect(trainingService.getPlaybook('unknown-member')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getIndividualProgressByMemberId', () => {
    it('should return 0 when there are 0 individual items', async () => {
      prismaService.playbookItem.count.mockResolvedValue(0);

      const progress = await trainingService.getIndividualProgressByMemberId(memberRequester.sub);

      expect(progress).toBe(0);
      expect(prismaService.memberChecklist.count).not.toHaveBeenCalled();
    });

    it('should return rounded percentage of completed individual items', async () => {
      prismaService.playbookItem.count.mockResolvedValue(3);
      prismaService.memberChecklist.count.mockResolvedValue(1);

      const progress = await trainingService.getIndividualProgressByMemberId(memberRequester.sub);

      expect(progress).toBe(33);
    });
  });

  describe('toggleChecklist', () => {
    it('should upsert MemberChecklist for the authenticated user on first mark and recalculate progress', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(individualItem1);
      prismaService.memberChecklist.findUnique.mockResolvedValue(null);
      prismaService.memberChecklist.upsert.mockImplementation(
        async (args: { create: { completed: boolean; completedAt: Date | null } }) => ({
          id: 'check-1',
          memberId: memberRequester.sub,
          playbookItemId: individualItem1.id,
          completed: args.create.completed,
          completedAt: args.create.completedAt,
        }),
      );
      prismaService.playbookItem.count.mockResolvedValue(2);
      prismaService.memberChecklist.count.mockResolvedValue(1);

      const result = await trainingService.toggleChecklist(memberRequester, {
        playbookItemId: individualItem1.id,
      });

      expect(prismaService.memberChecklist.upsert).toHaveBeenCalledWith({
        where: {
          memberId_playbookItemId: {
            memberId: memberRequester.sub,
            playbookItemId: individualItem1.id,
          },
        },
        update: {
          completed: true,
          completedAt: expect.any(Date),
        },
        create: {
          memberId: memberRequester.sub,
          playbookItemId: individualItem1.id,
          completed: true,
          completedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({
        playbookItemId: individualItem1.id,
        scope: PlaybookScope.INDIVIDUAL,
        completed: true,
        completedAt: expect.any(Date),
        progressPercentage: 50,
      });
    });

    it('should invert an already completed individual item to false and clear completedAt', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(individualItem1);
      prismaService.memberChecklist.findUnique.mockResolvedValue({
        id: 'check-1',
        memberId: memberRequester.sub,
        playbookItemId: individualItem1.id,
        completed: true,
        completedAt: new Date('2026-11-18T12:00:00.000Z'),
      });
      prismaService.memberChecklist.upsert.mockResolvedValue({
        id: 'check-1',
        memberId: memberRequester.sub,
        playbookItemId: individualItem1.id,
        completed: false,
        completedAt: null,
      });
      prismaService.playbookItem.count.mockResolvedValue(2);
      prismaService.memberChecklist.count.mockResolvedValue(0);

      const result = await trainingService.toggleChecklist(memberRequester, {
        playbookItemId: individualItem1.id,
      });

      expect(result.completed).toBe(false);
      expect(result.completedAt).toBeNull();
      expect(result.progressPercentage).toBe(0);
    });

    it('should allow MEMBRO to toggle a SQUAD item from their own squad and log audit', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(squad2Item);
      prismaService.member.findUnique.mockResolvedValue({
        id: memberRequester.sub,
        squadName: 'Squad 2',
      });
      prismaService.playbookItem.update.mockResolvedValue({
        ...squad2Item,
        isCompleted: true,
      });
      prismaService.playbookItem.findMany.mockResolvedValue([{ isCompleted: true }]);

      const result = await trainingService.toggleChecklist(memberRequester, {
        playbookItemId: squad2Item.id,
        completed: true,
      });

      expect(result).toEqual({
        playbookItemId: squad2Item.id,
        scope: PlaybookScope.SQUAD,
        completed: true,
        completedAt: null,
        progressPercentage: 100,
      });
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: memberRequester.sub,
        module: 'TRAINING',
        action: 'TOGGLE_SQUAD_PLAYBOOK_ITEM',
        details: expect.stringContaining(squad2Item.title),
      });
    });

    it('should throw ForbiddenException (403) when MEMBRO tries to toggle a SQUAD item from another squad', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(squad1Item);
      prismaService.member.findUnique.mockResolvedValue({
        id: memberRequester.sub,
        squadName: 'Squad 2',
      });

      await expect(
        trainingService.toggleChecklist(memberRequester, {
          playbookItemId: squad1Item.id,
          completed: false,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.playbookItem.update).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when playbook item does not exist', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(null);

      await expect(
        trainingService.toggleChecklist(memberRequester, {
          playbookItemId: 'non-existent-item',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createItem', () => {
    it('should create item and record AuditLog with module TRAINING', async () => {
      prismaService.playbookItem.create.mockResolvedValue(squad2Item);

      const result = await trainingService.createItem(
        {
          title: squad2Item.title,
          description: squad2Item.description,
          scope: PlaybookScope.SQUAD,
          targetSquad: 'Squad 2',
          orderIndex: 1,
        },
        directorRequester,
      );

      expect(result).toEqual(squad2Item);
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: directorRequester.sub,
        module: 'TRAINING',
        action: 'CREATE_PLAYBOOK_ITEM',
        details: expect.stringContaining(squad2Item.title),
      });
    });

    it('should throw BadRequestException when creating SQUAD item without targetSquad', async () => {
      await expect(
        trainingService.createItem(
          {
            title: 'Marco sem squad',
            description: 'Faltou informar o squad.',
            scope: PlaybookScope.SQUAD,
            targetSquad: '   ',
            orderIndex: 1,
          },
          directorRequester,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.playbookItem.create).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update item and record AuditLog with module TRAINING', async () => {
      const updated = { ...individualItem1, title: 'Configurar Docker v2' };
      prismaService.playbookItem.findUnique.mockResolvedValue(individualItem1);
      prismaService.playbookItem.update.mockResolvedValue(updated);

      const result = await trainingService.updateItem(
        individualItem1.id,
        { title: 'Configurar Docker v2' },
        directorRequester,
      );

      expect(result).toEqual(updated);
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: directorRequester.sub,
        module: 'TRAINING',
        action: 'UPDATE_PLAYBOOK_ITEM',
        details: expect.stringContaining(individualItem1.id),
      });
    });

    it('should throw NotFoundException when updating a non-existent item', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(null);

      await expect(
        trainingService.updateItem('missing-id', { title: 'Novo' }, directorRequester),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should delete MemberChecklist children before PlaybookItem in a transaction and record AuditLog', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(individualItem1);
      prismaService.memberChecklist.deleteMany.mockResolvedValue({ count: 1 });
      prismaService.playbookItem.delete.mockResolvedValue(individualItem1);

      const result = await trainingService.removeItem(individualItem1.id, directorRequester);

      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaService.memberChecklist.deleteMany).toHaveBeenCalledWith({
        where: { playbookItemId: individualItem1.id },
      });
      expect(prismaService.playbookItem.delete).toHaveBeenCalledWith({
        where: { id: individualItem1.id },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        authorId: directorRequester.sub,
        module: 'TRAINING',
        action: 'DELETE_PLAYBOOK_ITEM',
        details: expect.stringContaining(individualItem1.id),
      });
      expect(result).toEqual({ deleted: true, id: individualItem1.id });
    });

    it('should throw NotFoundException when removing a non-existent item', async () => {
      prismaService.playbookItem.findUnique.mockResolvedValue(null);

      await expect(trainingService.removeItem('missing-id', directorRequester)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('TrainingController management route guards (403 for MEMBRO)', () => {
    it('should protect createItem, updateItem and removeItem with JwtAuthGuard and DirectorGuard', () => {
      const createGuards = Reflect.getMetadata(
        GUARDS_METADATA,
        TrainingController.prototype.createItem,
      );
      const updateGuards = Reflect.getMetadata(
        GUARDS_METADATA,
        TrainingController.prototype.updateItem,
      );
      const removeGuards = Reflect.getMetadata(
        GUARDS_METADATA,
        TrainingController.prototype.removeItem,
      );

      expect(createGuards).toEqual([JwtAuthGuard, DirectorGuard]);
      expect(updateGuards).toEqual([JwtAuthGuard, DirectorGuard]);
      expect(removeGuards).toEqual([JwtAuthGuard, DirectorGuard]);
    });

    it('should block MEMBRO with ForbiddenException (403) in DirectorGuard', () => {
      const directorGuard = new DirectorGuard();
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: memberRequester }),
        }),
      } as unknown as ExecutionContext;

      expect(() => directorGuard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
