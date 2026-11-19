import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { DirectorGuard } from './director.guard';
import { FinanceGuard } from './finance.guard';
import { PresidenciaGuard } from './presidencia.guard';

function createMockExecutionContext(user?: JwtPayload): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

function createUser(systemRole: JwtPayload['systemRole'], department: string): JwtPayload {
  return {
    sub: '11111111-1111-4111-8111-111111111111',
    email: 'member@ascii.org.br',
    systemRole,
    roleTitle: 'Cargo',
    department,
  };
}

describe('Access Guards', () => {
  describe('PresidenciaGuard', () => {
    const guard = new PresidenciaGuard();

    it('should allow PRESIDENCIA', () => {
      const context = createMockExecutionContext(createUser('PRESIDENCIA', 'PRESIDENCIA'));

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block DIRETOR with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(createUser('DIRETOR', 'FINANCEIRO'));

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should block MEMBRO with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(createUser('MEMBRO', 'PROJETOS'));

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should block missing user with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('DirectorGuard', () => {
    const guard = new DirectorGuard();

    it('should allow PRESIDENCIA', () => {
      const context = createMockExecutionContext(createUser('PRESIDENCIA', 'PRESIDENCIA'));

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow DIRETOR', () => {
      const context = createMockExecutionContext(createUser('DIRETOR', 'PROJETOS'));

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block MEMBRO with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(createUser('MEMBRO', 'PROJETOS'));

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should block missing user with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('FinanceGuard', () => {
    const guard = new FinanceGuard();

    it('should allow PRESIDENCIA', () => {
      const context = createMockExecutionContext(createUser('PRESIDENCIA', 'PRESIDENCIA'));

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow DIRETOR with department FINANCEIRO', () => {
      const context = createMockExecutionContext(createUser('DIRETOR', 'FINANCEIRO'));

      expect(guard.canActivate(context)).toBe(true);
    });

    it.each(['PROJETOS', 'GP', 'COMERCIAL'])(
      'should block DIRETOR from %s with ForbiddenException (HTTP 403)',
      (department) => {
        const context = createMockExecutionContext(createUser('DIRETOR', department));

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      },
    );

    it('should block MEMBRO with ForbiddenException (HTTP 403)', () => {
      const contextProjects = createMockExecutionContext(createUser('MEMBRO', 'PROJETOS'));
      const contextFinance = createMockExecutionContext(createUser('MEMBRO', 'FINANCEIRO'));

      expect(() => guard.canActivate(contextProjects)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(contextFinance)).toThrow(ForbiddenException);
    });

    it('should block missing user with ForbiddenException (HTTP 403)', () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
