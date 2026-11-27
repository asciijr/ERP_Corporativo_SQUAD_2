import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [AuthModule],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingOkrsModule {}
