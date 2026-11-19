import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateAuditLogInput {
  authorId: string;
  module: string;
  action: string;
  details?: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  authorId: string;
  module: string;
  action: string;
  details: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
    roleTitle: string;
    department: string;
  };
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput): Promise<AuditLogEntry> {
    return this.prisma.auditLog.create({
      data: {
        authorId: input.authorId,
        module: input.module,
        action: input.action,
        details: input.details ?? null,
      },
    });
  }

  async findAll(moduleFilter?: string): Promise<AuditLogEntry[]> {
    const trimmedFilter = moduleFilter?.trim();
    return this.prisma.auditLog.findMany({
      where: trimmedFilter
        ? {
            module: {
              equals: trimmedFilter,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            roleTitle: true,
            department: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
