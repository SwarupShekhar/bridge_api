import { Controller, Patch, Body, Headers, HttpCode, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { SyncService } from './sync.service';

interface UpdateCefrDto {
  clerkId: string;
  cefrLevel: string;
  fluencyScore: number;
  source: 'englivo' | 'engr';
}

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Patch('cefr')
  @HttpCode(HttpStatus.OK)
  async updateCefr(
    @Body() body: UpdateCefrDto,
    @Headers('x-internal-secret') internalSecret: string,
  ): Promise<{ status: string; message: string }> {
    // Validate internal secret
    if (internalSecret !== process.env.INTERNAL_SECRET) {
      this.logger.warn('Invalid internal secret provided');
      throw new UnauthorizedException('Invalid internal secret');
    }

    this.logger.log(`Received CEFR update request for user ${body.clerkId} from ${body.source}`);

    try {
      const updatedUser = await this.syncService.syncCefr(body);
      
      return {
        status: 'success',
        message: `CEFR level updated to ${body.cefrLevel} for user ${body.clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error updating CEFR for user ${body.clerkId}:`, error);
      throw error;
    }
  }
}
