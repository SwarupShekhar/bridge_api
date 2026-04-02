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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const user_types_1 = require("./user.types");
let UserService = UserService_1 = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async getUser(clerkId) {
        const user = await this.prisma.sharedUser.findUnique({
            where: { clerkId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with clerkId ${clerkId} not found`);
        }
        return (0, user_types_1.enhanceUser)(user);
    }
    async updateUser(clerkId, dto) {
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
        this.logger.log(`Updated user ${clerkId} with fields: ${Object.keys(dto).join(", ")}`);
        return (0, user_types_1.enhanceUser)(updatedUser);
    }
    async incrementStreak(clerkId) {
        const user = await this.getUser(clerkId);
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        if (user.lastSessionAt && user.lastSessionAt >= todayStart && user.lastSessionAt < todayEnd) {
            this.logger.log(`User ${clerkId} already had streak incremented today, skipping`);
            return (0, user_types_1.enhanceUser)(user);
        }
        const updatedUser = await this.prisma.sharedUser.update({
            where: { clerkId },
            data: {
                streakDays: user.streakDays + 1,
                lastSessionAt: new Date(),
            },
        });
        this.logger.log(`Incremented streak for user ${clerkId} to ${updatedUser.streakDays}`);
        return (0, user_types_1.enhanceUser)(updatedUser);
    }
    async addPracticeMinutes(clerkId, minutes) {
        const user = await this.getUser(clerkId);
        const updatedUser = await this.prisma.sharedUser.update({
            where: { clerkId },
            data: {
                totalPracticeMinutes: user.totalPracticeMinutes + minutes,
                lastSessionAt: new Date(),
            },
        });
        this.logger.log(`Added ${minutes} practice minutes to user ${clerkId}, total: ${updatedUser.totalPracticeMinutes}`);
        return (0, user_types_1.enhanceUser)(updatedUser);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
