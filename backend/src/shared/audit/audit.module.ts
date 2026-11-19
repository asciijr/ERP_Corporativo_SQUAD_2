import { Global, Module } from '@nestjs/common';
import { AuditDirectorGuard, AuditJwtGuard } from './audit-access.guard';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditJwtGuard, AuditDirectorGuard],
  exports: [AuditService],
})
export class AuditModule {}
