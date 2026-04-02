import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  Request,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto, AddMinutesDto } from "./user.dto";

@Controller("user")
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  private validateInternalSecret(internalSecret: string) {
    const expectedSecret = process.env.INTERNAL_SECRET;
    this.logger.debug(`Received secret: "${internalSecret}"`);
    this.logger.debug(`Expected secret: "${expectedSecret}"`);
    
    if (internalSecret !== expectedSecret) {
      this.logger.warn("Invalid internal secret provided");
      throw new UnauthorizedException("Invalid internal secret");
    }
  }

  private getUserAgent(@Request() req: any): string {
    return req.headers['user-agent'] || 'Unknown';
  }

  @Get(":clerkId")
  async getUser(
    @Param("clerkId") clerkId: string,
    @Headers("x-internal-secret") internalSecret: string,
    @Request() req: any,
  ) {
    this.logger.log(`GET /user/${clerkId} - User-Agent: ${req.headers['user-agent'] || 'Unknown'} - IP: ${req.ip}`);
    this.validateInternalSecret(internalSecret);
    return this.userService.getUser(clerkId);
  }

  @Patch(":clerkId")
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param("clerkId") clerkId: string,
    @Body() dto: UpdateUserDto,
    @Headers("x-internal-secret") internalSecret: string,
  ) {
    this.validateInternalSecret(internalSecret);
    return this.userService.updateUser(clerkId, dto);
  }

  @Patch(":clerkId/streak")
  @HttpCode(HttpStatus.OK)
  async incrementStreak(
    @Param("clerkId") clerkId: string,
    @Headers("x-internal-secret") internalSecret: string,
  ) {
    this.validateInternalSecret(internalSecret);
    return this.userService.incrementStreak(clerkId);
  }

  @Patch(":clerkId/minutes")
  @HttpCode(HttpStatus.OK)
  async addPracticeMinutes(
    @Param("clerkId") clerkId: string,
    @Body() dto: AddMinutesDto,
    @Headers("x-internal-secret") internalSecret: string,
  ) {
    this.validateInternalSecret(internalSecret);
    return this.userService.addPracticeMinutes(clerkId, dto.minutes);
  }
}
