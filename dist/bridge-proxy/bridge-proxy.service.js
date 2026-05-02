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
var BridgeProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
let BridgeProxyService = BridgeProxyService_1 = class BridgeProxyService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(BridgeProxyService_1.name);
        this.bridgeBaseUrl = this.configService.get('BRIDGE_API_URL') || 'http://localhost:3012';
        this.bridgeInternalSecret = this.configService.get('BRIDGE_INTERNAL_SECRET');
        if (!this.bridgeInternalSecret) {
            this.logger.error('BRIDGE_INTERNAL_SECRET environment variable not set');
        }
        else {
            this.logger.log('Bridge proxy service initialized with internal secret');
        }
    }
    async updateLastActive(clerkId, app) {
        this.logger.log(`Updating last active app to ${app} for user ${clerkId}`);
        const url = `${this.bridgeBaseUrl}/user/${clerkId}`;
        const headers = {
            'x-internal-secret': this.bridgeInternalSecret,
            'Content-Type': 'application/json',
        };
        try {
            await this.httpService.axiosRef.patch(url, {
                lastActiveApp: app,
            }, { headers });
            this.logger.log(`Successfully updated last active app to ${app} for user ${clerkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update last active app for user ${clerkId}:`, error);
            throw error;
        }
    }
    async syncCefr(clerkId, cefrLevel, fluencyScore, source) {
        this.logger.log(`Syncing CEFR level ${cefrLevel} for user ${clerkId} from ${source || 'unknown'}`);
        const url = `${this.bridgeBaseUrl}/sync/cefr`;
        const headers = {
            'x-internal-secret': this.bridgeInternalSecret,
            'Content-Type': 'application/json',
        };
        const body = {
            clerkId,
            cefrLevel,
            fluencyScore: fluencyScore || 0,
            source: source || 'CORE',
        };
        try {
            await this.httpService.axiosRef.patch(url, body, { headers });
            this.logger.log(`Successfully synced CEFR level ${cefrLevel} for user ${clerkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync CEFR for user ${clerkId}:`, error);
            throw error;
        }
    }
    async incrementStreak(clerkId) {
        this.logger.log(`Incrementing streak for user ${clerkId}`);
        const url = `${this.bridgeBaseUrl}/user/${clerkId}/streak`;
        const headers = {
            'x-internal-secret': this.bridgeInternalSecret,
            'Content-Type': 'application/json',
        };
        try {
            await this.httpService.axiosRef.patch(url, {}, { headers });
            this.logger.log(`Successfully incremented streak for user ${clerkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to increment streak for user ${clerkId}:`, error);
            throw error;
        }
    }
    async addPracticeMinutes(clerkId, minutes) {
        this.logger.log(`Adding ${minutes} practice minutes for user ${clerkId}`);
        const url = `${this.bridgeBaseUrl}/user/${clerkId}/minutes`;
        const headers = {
            'x-internal-secret': this.bridgeInternalSecret,
            'Content-Type': 'application/json',
        };
        try {
            await this.httpService.axiosRef.patch(url, { minutes }, { headers });
            this.logger.log(`Successfully added ${minutes} practice minutes for user ${clerkId}`);
        }
        catch (error) {
            this.logger.error(`Failed to add practice minutes for user ${clerkId}:`, error);
            throw error;
        }
    }
};
exports.BridgeProxyService = BridgeProxyService;
exports.BridgeProxyService = BridgeProxyService = BridgeProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], BridgeProxyService);
