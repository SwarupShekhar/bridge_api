import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ClerkWebhookService } from './clerk-webhook.service';

interface ClerkWebhookEvent {
  type: string;
  data: any;
}

@Controller('webhooks')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(private readonly clerkWebhookService: ClerkWebhookService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(@Body() event: ClerkWebhookEvent): Promise<{ status: string }> {
    this.logger.log(`Received Clerk webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'user.created':
          await this.clerkWebhookService.handleUserCreated(event as any);
          break;
        
        default:
          this.logger.log(`Ignoring unhandled event type: ${event.type}`);
          break;
      }

      return { status: 'processed' };
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}:`, error);
      throw error;
    }
  }
}
