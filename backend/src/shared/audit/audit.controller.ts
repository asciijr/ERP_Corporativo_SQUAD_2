import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditDirectorGuard, AuditJwtGuard } from './audit-access.guard';
import { AuditLogEntry, AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(AuditJwtGuard, AuditDirectorGuard)
  @ApiOperation({
    summary: 'Listar logs de auditoria transversal (restrito à Presidência e Diretoria)',
  })
  @ApiQuery({ name: 'module', required: false, description: 'Filtrar logs por módulo' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria retornados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Acesso restrito à Presidência e Diretoria.' })
  async findAll(@Query('module') moduleFilter?: string): Promise<AuditLogEntry[]> {
    return this.auditService.findAll(moduleFilter);
  }
}
