import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BridgeProxyController } from './bridge-proxy.controller';
import { SessionsController } from './sessions.controller';
import { BridgeProxyService } from './bridge-proxy.service';
import { ClerkAuthService } from './clerk-auth.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [BridgeProxyController, SessionsController],
  providers: [BridgeProxyService, ClerkAuthService],
  exports: [BridgeProxyService],
})
export class BridgeProxyModule {}
