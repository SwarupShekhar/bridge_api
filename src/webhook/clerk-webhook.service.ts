import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SharedUsersService } from '../shared-users/shared-users.service';
import { firstValueFrom } from 'rxjs';

interface ClerkUserCreatedEvent {
  type: 'user.created';
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
    }>;
    first_name?: string;
    last_name?: string;
  };
}

@Injectable()
export class ClerkWebhookService {
  private readonly logger = new Logger(ClerkWebhookService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly sharedUsersService: SharedUsersService,
  ) {}

  async handleUserCreated(event: ClerkUserCreatedEvent): Promise<void> {
    const internalSecret = process.env.INTERNAL_SECRET;
    if (!internalSecret) {
      this.logger.error('CRITICAL: INTERNAL_SECRET is not defined in environment variables');
      return;
    }

    try {
      // Extract user data from Clerk payload
      const clerkId = event.data.id;
      const email = event.data.email_addresses[0]?.email_address;
      const fullName = `${event.data.first_name || ''} ${event.data.last_name || ''}`.trim() || 'Unknown User';

      if (!email) {
        this.logger.error(`No email found for user ${clerkId}`);
        return;
      }

      this.logger.log(`Processing user.created event for ${clerkId} (${email})`);

      // First, create or ensure the existence of the anchor record in our Bridge DB
      await this.sharedUsersService.createSharedUser({
        clerkId,
        email,
        fullName,
      });

      this.logger.log(`Ensured shared user record for ${clerkId}`);

      // Prepare the payload for both services
      const provisionPayload = {
        clerkId,
        email,
        fullName,
      };

      const headers = {
        'Content-Type': 'application/json',
        'x-internal-secret': internalSecret,
      };

      // Call both internal endpoints in parallel using Promise.allSettled
      // This is now safer and idempotent since SharedUsersService handles the cumulative logic
      const [englivoResult, engrResult] = await Promise.allSettled([
        firstValueFrom(
          this.httpService.post(
            `${process.env.ENGLIVO_INTERNAL_URL}/api/internal/provision`,
            provisionPayload,
            { headers },
          ),
        ),
        firstValueFrom(
          this.httpService.post(
            `${process.env.ENGR_INTERNAL_URL}/internal/provision`,
            provisionPayload,
            { headers },
          ),
        ),
      ]);

      // Determine provisioning status
      const englivoProvisioned = englivoResult.status === 'fulfilled';
      const engrProvisioned = engrResult.status === 'fulfilled';

      // Log results with clean error reporting (only response data or message)
      if (englivoProvisioned) {
        this.logger.log(`Successfully provisioned user ${clerkId} in Englivo`);
      } else {
        const error = (englivoResult as PromiseRejectedResult).reason;
        this.logger.error(
          `Failed to provision user ${clerkId} in Englivo: ${JSON.stringify(error?.response?.data || error?.message || error)}`,
        );
      }

      if (engrProvisioned) {
        this.logger.log(`Successfully provisioned user ${clerkId} in EngR`);
      } else {
        const error = (engrResult as PromiseRejectedResult).reason;
        this.logger.error(
          `Failed to provision user ${clerkId} in EngR: ${JSON.stringify(error?.response?.data || error?.message || error)}`,
        );
      }

      // Update provisioning status in our database (Cumulative Logic)
      // Only updates if statuses are currently false
      await this.sharedUsersService.updateProvisioningStatus({
        clerkId,
        englivoProvisioned,
        engrProvisioned,
      });

      this.logger.log(
        `Updated provisioning status for ${clerkId}: Englivo=${englivoProvisioned}, EngR=${engrProvisioned}`,
      );

    } catch (error) {
      this.logger.error(`Error processing user.created event:`, error);
      throw error;
    }
  }
}
