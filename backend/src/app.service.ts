import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return { status: 'ok' };
  }
}
