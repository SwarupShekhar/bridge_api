import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            sharedUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user by clerkId', async () => {
      const mockUser = {
        clerkId: 'user_123',
        email: 'test@example.com',
        fullName: 'Test User',
        cefrLevel: 'A1',
        fluencyScore: 0,
        cefrUpdatedAt: new Date(),
        cefrUpdatedBy: 'system',
        englivoPlan: 'none',
        engrPlan: 'free',
        englivoCredits: 0,
        englivoProvisioned: false,
        engrProvisioned: false,
        totalPracticeMinutes: 0,
        streakDays: 0,
        lastActiveApp: null,
        onboardingCompleted: false,
        preferredMode: null,
        lastSessionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.getUser('user_123');
      expect(result).toBeDefined();
      expect(result.clerkId).toBe('user_123');
      expect(prismaService.sharedUser.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'user_123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(null);

      await expect(service.getUser('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const mockUser = {
        clerkId: 'user_123',
        email: 'test@example.com',
        fullName: 'Test User',
        cefrLevel: 'A1',
        fluencyScore: 0,
        cefrUpdatedAt: new Date(),
        cefrUpdatedBy: 'system',
        englivoPlan: 'none',
        engrPlan: 'free',
        englivoCredits: 0,
        englivoProvisioned: false,
        engrProvisioned: false,
        totalPracticeMinutes: 0,
        streakDays: 0,
        lastActiveApp: 'pulse',
        onboardingCompleted: false,
        preferredMode: 'practice',
        lastSessionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.sharedUser, 'update').mockResolvedValue(mockUser);

      const updateDto = { last_active_app: 'pulse', preferred_mode: 'practice' };
      const result = await service.updateUser('user_123', updateDto);

      expect(result).toBeDefined();
      expect(prismaService.sharedUser.update).toHaveBeenCalledWith({
        where: { clerkId: 'user_123' },
        data: {
          lastActiveApp: 'pulse',
          preferredMode: 'practice',
        },
      });
    });
  });
});
