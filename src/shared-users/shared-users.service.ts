import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SharedUser } from '@prisma/client';

@Injectable()
export class SharedUsersService {
  constructor(private prisma: PrismaService) {}

  async createSharedUser(data: {
    clerkId: string;
    email: string;
    fullName: string;
  }): Promise<SharedUser> {
    return this.prisma.sharedUser.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        fullName: data.fullName,
      },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        fullName: data.fullName,
      },
    });
  }

  async updateProvisioningStatus(data: {
    clerkId: string;
    englivoProvisioned?: boolean;
    engrProvisioned?: boolean;
  }): Promise<SharedUser> {
    // Fetch existing status to implement cumulative logic (false -> true only)
    const existing = await this.findByClerkId(data.clerkId);
    
    return this.prisma.sharedUser.update({
      where: { clerkId: data.clerkId },
      data: {
        ...(data.englivoProvisioned !== undefined && {
          // Stay true if already true, otherwise use new value
          englivoProvisioned: (existing?.englivoProvisioned || data.englivoProvisioned) ?? false,
        }),
        ...(data.engrProvisioned !== undefined && {
          // Stay true if already true, otherwise use new value
          engrProvisioned: (existing?.engrProvisioned || data.engrProvisioned) ?? false,
        }),
      },
    });
  }

  async findByClerkId(clerkId: string): Promise<SharedUser | null> {
    return this.prisma.sharedUser.findUnique({
      where: { clerkId },
    });
  }

  async findByEmail(email: string): Promise<SharedUser | null> {
    return this.prisma.sharedUser.findUnique({
      where: { email },
    });
  }
}

