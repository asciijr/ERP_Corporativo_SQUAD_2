import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService, HealthStatus } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verifica o estado de saúde da API' })
  @ApiResponse({ status: 200, description: 'API operacional' })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
