import { AccessLevel } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  systemRole: AccessLevel;
  roleTitle: string;
  department: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  systemRole: AccessLevel;
  department: string;
  avatarUrl: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface AuthMeResponse extends AuthenticatedUser {
  isPresidencia: boolean;
  isDirector: boolean;
  canAccessFinance: boolean;
  isMember: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
