import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessLevel } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PresidenciaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.systemRole !== AccessLevel.PRESIDENCIA) {
      throw new ForbiddenException('Acesso negado: permissão exclusiva da Presidência.');
    }

    return true;
  }
}
