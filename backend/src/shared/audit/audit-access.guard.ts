import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessLevel } from '@prisma/client';

interface RequestWithJwtUser {
  user?: {
    sub: string;
    email: string;
    systemRole: AccessLevel;
    roleTitle: string;
    department: string;
  };
}

@Injectable()
export class AuditJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Token JWT ausente, inválido ou expirado.');
    }
    return user;
  }
}

@Injectable()
export class AuditDirectorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithJwtUser>();
    const user = request.user;

    const isAllowed =
      user?.systemRole === AccessLevel.PRESIDENCIA || user?.systemRole === AccessLevel.DIRETOR;

    if (!isAllowed) {
      throw new ForbiddenException('Acesso negado: permissão restrita à Presidência e Diretoria.');
    }

    return true;
  }
}
