import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AccessLevel } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/jwt-payload.interface';

@Injectable()
export class DirectorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const isAllowed =
      user?.systemRole === AccessLevel.PRESIDENCIA || user?.systemRole === AccessLevel.DIRETOR;

    if (!isAllowed) {
      throw new ForbiddenException('Acesso negado: permissão restrita à Diretoria.');
    }

    return true;
  }
}
