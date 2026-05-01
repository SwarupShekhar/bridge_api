import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async getHealth() {
    const dbConnected = await this.prisma.healthCheck();
    
    return {
      status: dbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'bridge-api',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'unhealthy'
      }
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'Bridge API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
