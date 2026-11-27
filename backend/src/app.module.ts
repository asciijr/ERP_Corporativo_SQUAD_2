import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FinanceModule } from './modules/finance/finance.module';
import { MembersModule } from './modules/members/members.module';
import { TrainingOkrsModule } from './modules/training-okrs';
import { AuditModule } from './shared/audit/audit.module';
import { DatabaseModule } from './shared/database/database.module';

@Module({
 feat/14-api-checklist-playbook
  imports: [DatabaseModule, AuditModule, AuthModule, MembersModule, TrainingOkrsModule],

  imports: [DatabaseModule, AuditModule, AuthModule, MembersModule, FinanceModule],
 develop
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
