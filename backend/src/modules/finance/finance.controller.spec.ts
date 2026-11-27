import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AccessLevel, TransactionType } from '@prisma/client';
import { AuthenticatedRequest, FinanceGuard, JwtAuthGuard, JwtPayload } from '../auth';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

type GuardClass = new (...args: never[]) => CanActivate;

const seedProfiles: Record<string, JwtPayload> = {
  presidencia: {
    sub: '11111111-1111-4111-8111-111111111111',
    email: 'presidencia@asciiej.com.br',
    systemRole: AccessLevel.PRESIDENCIA,
    roleTitle: 'Presidente',
    department: 'PRESIDENCIA',
  },
  financeiro: {
    sub: '22222222-2222-4222-8222-222222222222',
    email: 'financeiro@asciiej.com.br',
    systemRole: AccessLevel.DIRETOR,
    roleTitle: 'Diretor',
    department: 'FINANCEIRO',
  },
  projetos: {
    sub: '33333333-3333-4333-8333-333333333333',
    email: 'projetos@asciiej.com.br',
    systemRole: AccessLevel.DIRETOR,
    roleTitle: 'Diretor',
    department: 'PROJETOS',
  },
  membro: {
    sub: '44444444-4444-4444-8444-444444444444',
    email: 'membro@asciiej.com.br',
    systemRole: AccessLevel.MEMBRO,
    roleTitle: 'Desenvolvedor',
    department: 'PROJETOS',
  },
};

function contextFor(user: JwtPayload): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const routeHandlers: Array<keyof FinanceController> = ['create', 'findAll', 'getSummary', 'remove'];

describe('FinanceController', () => {
  describe('security', () => {
    const classGuards: GuardClass[] = Reflect.getMetadata(GUARDS_METADATA, FinanceController) ?? [];

    it('should protect the whole controller with JwtAuthGuard followed by FinanceGuard', () => {
      expect(classGuards).toEqual([JwtAuthGuard, FinanceGuard]);
    });

    it.each(routeHandlers)('route %s should not override the class-level guards', (handler) => {
      const methodGuards = Reflect.getMetadata(
        GUARDS_METADATA,
        FinanceController.prototype[handler],
      );
      expect(methodGuards).toBeUndefined();
    });

    const financeGuard = new FinanceGuard();

    it.each(['presidencia', 'financeiro'])('should allow %s@', (profile) => {
      expect(financeGuard.canActivate(contextFor(seedProfiles[profile]))).toBe(true);
    });

    it.each(['projetos', 'membro'])('should block %s@ with 403 Forbidden', (profile) => {
      expect(() => financeGuard.canActivate(contextFor(seedProfiles[profile]))).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('handlers', () => {
    let controller: FinanceController;
    let financeService: {
      createTransaction: jest.Mock;
      findAll: jest.Mock;
      getSummary: jest.Mock;
      removeTransaction: jest.Mock;
    };
    const request = { user: seedProfiles.financeiro } as AuthenticatedRequest;

    beforeEach(() => {
      financeService = {
        createTransaction: jest.fn(),
        findAll: jest.fn(),
        getSummary: jest.fn(),
        removeTransaction: jest.fn(),
      };
      controller = new FinanceController(financeService as unknown as FinanceService);
    });

    it('should use the authenticated user id as authorId on create', async () => {
      const dto = {
        type: TransactionType.EXPENSE,
        amount: 10,
        category: 'Eventos',
        description: 'Coffee break',
        transactionDate: '2026-11-20',
      };

      await controller.create(request, dto);

      expect(financeService.createTransaction).toHaveBeenCalledWith(
        seedProfiles.financeiro.sub,
        dto,
      );
    });

    it('should use the authenticated user id as authorId on remove', async () => {
      await controller.remove(request, 'abc');

      expect(financeService.removeTransaction).toHaveBeenCalledWith(
        seedProfiles.financeiro.sub,
        'abc',
      );
    });
  });
});
