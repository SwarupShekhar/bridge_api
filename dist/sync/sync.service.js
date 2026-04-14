"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../prisma/prisma.service");
let SyncService = SyncService_1 = class SyncService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new common_1.Logger(SyncService_1.name);
    }
    async syncCefr(data) {
        const { clerkId, cefrLevel, fluencyScore, source } = data;
        const existingUser = await this.prisma.sharedUser.findUnique({
            where: { clerkId },
        });
        if (!existingUser) {
            this.logger.warn(`User ${clerkId} not found in database. Creating new user with CEFR data from ${source}`);
            const newUser = await this.prisma.sharedUser.create({
                data: {
                    clerkId,
                    email: `${clerkId}@placeholder.com`,
                    fullName: `User ${clerkId}`,
                    cefrLevel,
                    fluencyScore,
                    cefrUpdatedAt: new Date(),
                    cefrUpdatedBy: source,
                },
            });
            this.logger.log(`Created new user ${clerkId} with CEFR level ${cefrLevel} from ${source}`);
            this.notifyOtherBackend(data).catch((error) => {
                this.logger.error(`Failed to notify other backend for new user ${clerkId}:`, error);
            });
            return newUser;
        }
        if (existingUser.cefrLevel === cefrLevel) {
            this.logger.log(`CEFR level unchanged for user ${clerkId}, skipping update`);
            return existingUser;
        }
        const updatedUser = await this.prisma.sharedUser.update({
            where: { clerkId },
            data: {
                cefrLevel,
                fluencyScore,
                cefrUpdatedAt: new Date(),
                cefrUpdatedBy: source,
            },
        });
        this.notifyOtherBackend(data).catch((error) => {
            this.logger.error(`Failed to notify other backend for user ${clerkId}:`, error);
        });
        return updatedUser;
    }
    async syncPlan(data) {
        const { clerkId, plan } = data;
        this.logger.log(`Received plan sync request for user ${clerkId}: ${plan}`);
        const existingUser = await this.prisma.sharedUser.findUnique({
            where: { clerkId },
        });
        if (!existingUser) {
            this.logger.warn(`User ${clerkId} not found in database. Creating new user with plan data`);
            await this.prisma.sharedUser.create({
                data: {
                    clerkId,
                    email: `${clerkId}@placeholder.com`,
                    fullName: `User ${clerkId}`,
                    englivoPlan: plan === 'none' || plan === 'free' ? 'none' : plan,
                    engrPlan: plan,
                },
            });
            this.logger.log(`Created new user ${clerkId} with plan ${plan}`);
            return;
        }
        const needsUpdate = existingUser.engrPlan !== plan ||
            existingUser.englivoPlan !== plan;
        if (!needsUpdate) {
            this.logger.log(`Plan data unchanged for user ${clerkId}, skipping update`);
            return;
        }
        await this.prisma.sharedUser.update({
            where: { clerkId },
            data: {
                englivoPlan: plan === 'none' || plan === 'free' ? 'none' : plan,
                engrPlan: plan,
            },
        });
        this.logger.log(`Updated plan to ${plan} for user ${clerkId}`);
    }
    async notifyOtherBackend(data) {
        const { clerkId, cefrLevel, fluencyScore, source } = data;
        const targetUrl = source === 'PULSE'
            ? process.env.CORE_INTERNAL_URL
            : process.env.PULSE_INTERNAL_URL;
        if (!targetUrl) {
            throw new Error(`Target backend URL not configured for source: ${source}`);
        }
        const endpoint = `${targetUrl}/api/internal/update-cefr`;
        const internalSecret = process.env.INTERNAL_SECRET;
        if (!internalSecret) {
            throw new Error('INTERNAL_SECRET environment variable not set');
        }
        try {
            this.logger.debug(`Calling URL: ${endpoint}`);
            await this.httpService.axiosRef.patch(endpoint, {
                clerkId,
                cefrLevel,
                fluencyScore,
                source,
            }, {
                headers: {
                    'x-internal-secret': internalSecret,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`Successfully notified other backend (${source === 'PULSE' ? 'CORE' : 'PULSE'}) for user ${clerkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to call ${endpoint}:`, error);
            throw error;
        }
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], SyncService);
