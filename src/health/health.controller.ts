import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bridge-api',
      version: process.env.npm_package_version || '1.0.0',
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
