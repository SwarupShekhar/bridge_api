import { Test, TestingModule } from '@nestjs/testing';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

describe('SyncController', () => {
  let controller: SyncController;
  let syncService: SyncService;

  beforeEach(async () => {
    const mockSyncService = {
      syncCefr: jest.fn(),
      syncPlan: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [
        {
          provide: SyncService,
          useValue: mockSyncService,
        },
      ],
    }).compile();

    controller = module.get<SyncController>(SyncController);
    syncService = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCefr', () => {
    const mockBody = {
      clerkId: 'user_123',
      cefrLevel: 'B1',
      fluencyScore: 75,
      source: 'PULSE' as const,
    };

    it('should successfully update CEFR for existing user', async () => {
      const mockUpdatedUser = {
        clerkId: 'user_123',
        cefrLevel: 'B1',
        fluencyScore: 75,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      jest.spyOn(syncService, 'syncCefr').mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.updateCefr(mockBody, 'swarupshekhar171199');

      expect(result).toEqual({
        status: 'success',
        message: 'CEFR level updated to B1 for user user_123',
        userCreated: false,
      });
      expect(syncService.syncCefr).toHaveBeenCalledWith(mockBody);
    });

    it('should create new user and return success', async () => {
      const now = new Date();
      const mockNewUser = {
        clerkId: 'user_123',
        cefrLevel: 'B1',
        fluencyScore: 75,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(syncService, 'syncCefr').mockResolvedValue(mockNewUser as any);

      const result = await controller.updateCefr(mockBody, 'swarupshekhar171199');

      expect(result).toEqual({
        status: 'success',
        message: 'Created new user user_123 with CEFR level B1 from PULSE',
        userCreated: true,
      });
      expect(syncService.syncCefr).toHaveBeenCalledWith(mockBody);
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(controller.updateCefr(mockBody, 'invalid-secret'))
        .rejects.toThrow('Invalid internal secret');
      
      expect(syncService.syncCefr).not.toHaveBeenCalled();
    });
  });

  describe('updatePlan', () => {
    const mockBody = {
      clerkId: 'user_123',
      plan: 'STARTER',
      pulseCallsPerWeek: null,
      coreTutorSecondsPerWeek: 7200,
      coreAiCreditsMonthly: 20,
    };

    it('should successfully update plan', async () => {
      jest.spyOn(syncService, 'syncPlan').mockResolvedValue(undefined);

      const result = await controller.updatePlan(mockBody, 'swarupshekhar171199');

      expect(result).toEqual({
        status: 'success',
        message: 'Plan updated to STARTER for user user_123',
      });
      expect(syncService.syncPlan).toHaveBeenCalledWith(mockBody);
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(controller.updatePlan(mockBody, 'invalid-secret'))
        .rejects.toThrow('Invalid internal secret');
      
      expect(syncService.syncPlan).not.toHaveBeenCalled();
    });
  });
});
