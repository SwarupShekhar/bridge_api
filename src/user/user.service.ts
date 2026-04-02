import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SharedUser } from "@prisma/client";
import { UpdateUserDto } from "./user.dto";
import { EnhancedSharedUser, enhanceUser } from "./user.types";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getUser(clerkId: string): Promise<EnhancedSharedUser> {
    const user = await this.prisma.sharedUser.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException(`User with clerkId ${clerkId} not found`);
    }

    return enhanceUser(user);
  }

  async updateUser(clerkId: string, dto: UpdateUserDto): Promise<EnhancedSharedUser> {
    const user = await this.getUser(clerkId);

    const updatedUser = await this.prisma.sharedUser.update({
      where: { clerkId },
      data: {
        ...(dto.last_active_app !== undefined && {
          lastActiveApp: dto.last_active_app,
        }),
        ...(dto.preferred_mode !== undefined && {
          preferredMode: dto.preferred_mode,
        }),
      },
    });

    this.logger.log(
      `Updated user ${clerkId} with fields: ${Object.keys(dto).join(", ")}`,
    );

    return enhanceUser(updatedUser);
  }

  async incrementStreak(clerkId: string): Promise<EnhancedSharedUser> {
    const user = await this.getUser(clerkId);

    // Check if last session was today (already incremented today)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    if (user.lastSessionAt && user.lastSessionAt >= todayStart && user.lastSessionAt < todayEnd) {
      this.logger.log(`User ${clerkId} already had streak incremented today, skipping`);
      return enhanceUser(user);
    }

    const updatedUser = await this.prisma.sharedUser.update({
      where: { clerkId },
      data: {
        streakDays: user.streakDays + 1,
        lastSessionAt: new Date(),
      },
    });

    this.logger.log(
      `Incremented streak for user ${clerkId} to ${updatedUser.streakDays}`,
    );

    return enhanceUser(updatedUser);
  }

  async addPracticeMinutes(
    clerkId: string,
    minutes: number,
  ): Promise<EnhancedSharedUser> {
    const user = await this.getUser(clerkId);

    const updatedUser = await this.prisma.sharedUser.update({
      where: { clerkId },
      data: {
        totalPracticeMinutes: user.totalPracticeMinutes + minutes,
        lastSessionAt: new Date(),
      },
    });

    this.logger.log(
      `Added ${minutes} practice minutes to user ${clerkId}, total: ${updatedUser.totalPracticeMinutes}`,
    );

    return enhanceUser(updatedUser);
  }
}
