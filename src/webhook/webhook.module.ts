import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { ClerkWebhookService } from './clerk-webhook.service';
import { SharedUsersModule } from '../shared-users/shared-users.module';

@Module({
  imports: [HttpModule, SharedUsersModule],
  controllers: [ClerkWebhookController],
  providers: [ClerkWebhookService],
})
export class WebhookModule {}
