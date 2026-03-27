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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedUsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SharedUsersService = class SharedUsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSharedUser(data) {
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
    async updateProvisioningStatus(data) {
        const existing = await this.findByClerkId(data.clerkId);
        return this.prisma.sharedUser.update({
            where: { clerkId: data.clerkId },
            data: {
                ...(data.englivoProvisioned !== undefined && {
                    englivoProvisioned: (existing?.englivoProvisioned || data.englivoProvisioned) ?? false,
                }),
                ...(data.engrProvisioned !== undefined && {
                    engrProvisioned: (existing?.engrProvisioned || data.engrProvisioned) ?? false,
                }),
            },
        });
    }
    async findByClerkId(clerkId) {
        return this.prisma.sharedUser.findUnique({
            where: { clerkId },
        });
    }
    async findByEmail(email) {
        return this.prisma.sharedUser.findUnique({
            where: { email },
        });
    }
};
exports.SharedUsersService = SharedUsersService;
exports.SharedUsersService = SharedUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SharedUsersService);
