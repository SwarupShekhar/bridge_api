import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

describe('SyncService', () => {
  let service: SyncService;
  let prismaService: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: PrismaService,
          useValue: {
            sharedUser: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              patch: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prismaService = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncCefr', () => {
    const mockCefrData = {
      clerkId: 'user_123',
      cefrLevel: 'B1',
      fluencyScore: 75,
      source: 'PULSE' as const,
    };

    it('should create new user if not found', async () => {
      const mockNewUser = {
        clerkId: 'user_123',
        email: 'user_123@placeholder.com',
        fullName: 'User user_123',
        cefrLevel: 'B1',
        fluencyScore: 75,
        cefrUpdatedAt: new Date(),
        cefrUpdatedBy: 'PULSE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.sharedUser, 'create').mockResolvedValue(mockNewUser as any);

      const result = await service.syncCefr(mockCefrData);

      expect(result).toEqual(mockNewUser);
      expect(prismaService.sharedUser.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'user_123' },
      });
      expect(prismaService.sharedUser.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'user_123',
          email: 'user_123@placeholder.com',
          fullName: 'User user_123',
          cefrLevel: 'B1',
          fluencyScore: 75,
          cefrUpdatedAt: expect.any(Date),
          cefrUpdatedBy: 'PULSE',
        },
      });
    });

    it('should update existing user with different CEFR level', async () => {
      const mockExistingUser = {
        clerkId: 'user_123',
        cefrLevel: 'A1',
        fluencyScore: 50,
        cefrUpdatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        cefrLevel: 'B1',
        fluencyScore: 75,
        cefrUpdatedAt: new Date(),
      };

      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(mockExistingUser as any);
      jest.spyOn(prismaService.sharedUser, 'update').mockResolvedValue(mockUpdatedUser as any);

      const result = await service.syncCefr(mockCefrData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prismaService.sharedUser.update).toHaveBeenCalledWith({
        where: { clerkId: 'user_123' },
        data: {
          cefrLevel: 'B1',
          fluencyScore: 75,
          cefrUpdatedAt: expect.any(Date),
          cefrUpdatedBy: 'PULSE',
        },
      });
    });

    it('should skip update if CEFR level unchanged', async () => {
      const mockExistingUser = {
        clerkId: 'user_123',
        cefrLevel: 'B1',
        fluencyScore: 75,
        cefrUpdatedAt: new Date(),
      };

      jest.spyOn(prismaService.sharedUser, 'findUnique').mockResolvedValue(mockExistingUser as any);
      jest.spyOn(prismaService.sharedUser, 'update');

      const result = await service.syncCefr(mockCefrData);

      expect(result).toEqual(mockExistingUser);
      expect(prismaService.sharedUser.update).not.toHaveBeenCalled();
    });
  });
});
