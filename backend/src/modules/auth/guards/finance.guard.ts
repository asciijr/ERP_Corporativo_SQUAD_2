import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessLevel } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/jwt-payload.interface';

@Injectable()
export class FinanceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const hasFinanceAccess =
      user?.systemRole === AccessLevel.PRESIDENCIA ||
      (user?.systemRole === AccessLevel.DIRETOR && user.department === 'FINANCEIRO');

    if (!hasFinanceAccess) {
      throw new ForbiddenException(
        'Acesso negado: permissão restrita à Presidência ou Diretoria Financeira.',
      );
    }

    return true;
  }
}
