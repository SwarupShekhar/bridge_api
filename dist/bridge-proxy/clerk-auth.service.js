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
var ClerkAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthService = void 0;
const common_1 = require("@nestjs/common");
const backend_1 = require("@clerk/backend");
let ClerkAuthService = ClerkAuthService_1 = class ClerkAuthService {
    constructor() {
        this.logger = new common_1.Logger(ClerkAuthService_1.name);
        if (!process.env.CLERK_SECRET_KEY) {
            this.logger.warn('CLERK_SECRET_KEY environment variable not set. JWT verification will be skipped.');
        }
    }
    async verifyTokenAndGetUserId(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.logger.warn('Invalid or missing authorization header');
            throw new common_1.UnauthorizedException('Invalid authorization header');
        }
        const token = authHeader.substring(7);
        if (!process.env.CLERK_SECRET_KEY) {
            this.logger.warn('Clerk secret key not configured, using simplified token extraction');
            return this.extractClerkIdFromToken(token);
        }
        try {
            const payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            const clerkId = payload.sub;
            if (!clerkId) {
                throw new Error('No clerkId found in verified token');
            }
            this.logger.log(`Successfully verified token for user ${clerkId}`);
            return clerkId;
        }
        catch (error) {
            this.logger.error('Failed to verify Clerk token:', error);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    extractClerkIdFromToken(token) {
        try {
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const clerkId = decoded.sub;
            if (!clerkId) {
                throw new Error('No clerkId found in token');
            }
            this.logger.log(`Extracted clerkId from token (development mode): ${clerkId}`);
            return clerkId;
        }
        catch (error) {
            this.logger.error('Failed to extract clerkId from token:', error);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.ClerkAuthService = ClerkAuthService;
exports.ClerkAuthService = ClerkAuthService = ClerkAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ClerkAuthService);
