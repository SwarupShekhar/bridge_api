import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { BridgeProxyService } from './bridge-proxy.service';
import { ClerkAuthService } from './clerk-auth.service';

interface AddMinutesDto {
  minutes: number;
}

@Controller('sessions/bridge')
export class SessionsController {
  private readonly logger = new Logger(SessionsController.name);

  constructor(
    private readonly bridgeProxyService: BridgeProxyService,
    private readonly clerkAuthService: ClerkAuthService,
  ) {}

  @Post('streak')
  @HttpCode(HttpStatus.OK)
  async incrementStreak(
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received streak increment request for user ${clerkId}`);

    try {
      await this.bridgeProxyService.incrementStreak(clerkId);
      
      return {
        status: 'success',
        message: `Streak incremented for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error incrementing streak for user ${clerkId}:`, error);
      throw error;
    }
  }

  @Post('minutes')
  @HttpCode(HttpStatus.OK)
  async addPracticeMinutes(
    @Body() body: AddMinutesDto,
    @Headers('authorization') authHeader: string,
  ): Promise<{ status: string; message: string }> {
    const clerkId = await this.clerkAuthService.verifyTokenAndGetUserId(authHeader);
    
    this.logger.log(`Received practice minutes request for user ${clerkId}: ${body.minutes} minutes`);

    try {
      await this.bridgeProxyService.addPracticeMinutes(clerkId, body.minutes);
      
      return {
        status: 'success',
        message: `Added ${body.minutes} practice minutes for user ${clerkId}`,
      };
    } catch (error) {
      this.logger.error(`Error adding practice minutes for user ${clerkId}:`, error);
      throw error;
    }
  }
}
