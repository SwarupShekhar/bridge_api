import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthService {
  private readonly logger = new Logger(ClerkAuthService.name);

  constructor() {
    // In production, you should set these environment variables
    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.warn('CLERK_SECRET_KEY environment variable not set. JWT verification will be skipped.');
    }
  }

  async verifyTokenAndGetUserId(authHeader: string): Promise<string> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid or missing authorization header');
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Skip verification if no secret key is configured (development mode)
    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.warn('Clerk secret key not configured, using simplified token extraction');
      return this.extractClerkIdFromToken(token);
    }

    try {
      // Verify the JWT token with Clerk
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const clerkId = payload.sub;
      
      if (!clerkId) {
        throw new Error('No clerkId found in verified token');
      }

      this.logger.log(`Successfully verified token for user ${clerkId}`);
      return clerkId;
    } catch (error) {
      this.logger.error('Failed to verify Clerk token:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractClerkIdFromToken(token: string): string {
    try {
      // This is a simplified extraction - only for development
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const clerkId = decoded.sub;
      
      if (!clerkId) {
        throw new Error('No clerkId found in token');
      }
      
      this.logger.log(`Extracted clerkId from token (development mode): ${clerkId}`);
      return clerkId;
    } catch (error) {
      this.logger.error('Failed to extract clerkId from token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
