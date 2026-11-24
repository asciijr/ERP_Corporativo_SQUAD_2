import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FinanceModule } from './modules/finance/finance.module';
import { MembersModule } from './modules/members/members.module';
import { AuditModule } from './shared/audit/audit.module';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule, MembersModule, FinanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
