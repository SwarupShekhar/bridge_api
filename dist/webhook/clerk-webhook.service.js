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
var ClerkWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const shared_users_service_1 = require("../shared-users/shared-users.service");
const rxjs_1 = require("rxjs");
let ClerkWebhookService = ClerkWebhookService_1 = class ClerkWebhookService {
    constructor(httpService, sharedUsersService) {
        this.httpService = httpService;
        this.sharedUsersService = sharedUsersService;
        this.logger = new common_1.Logger(ClerkWebhookService_1.name);
    }
    async handleUserCreated(event) {
        const internalSecret = process.env.INTERNAL_SECRET;
        if (!internalSecret) {
            this.logger.error('CRITICAL: INTERNAL_SECRET is not defined in environment variables');
            return;
        }
        try {
            const clerkId = event.data.id;
            const email = event.data.email_addresses[0]?.email_address;
            const fullName = `${event.data.first_name || ''} ${event.data.last_name || ''}`.trim() || 'Unknown User';
            if (!email) {
                this.logger.error(`No email found for user ${clerkId}`);
                return;
            }
            this.logger.log(`Processing user.created event for ${clerkId} (${email})`);
            await this.sharedUsersService.createSharedUser({
                clerkId,
                email,
                fullName,
            });
            this.logger.log(`Ensured shared user record for ${clerkId}`);
            const provisionPayload = {
                clerkId,
                email,
                fullName,
            };
            const headers = {
                'Content-Type': 'application/json',
                'x-internal-secret': internalSecret,
            };
            const [englivoResult, engrResult] = await Promise.allSettled([
                (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.ENGLIVO_INTERNAL_URL}/api/internal/provision`, provisionPayload, { headers })),
                (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.ENGR_INTERNAL_URL}/internal/provision`, provisionPayload, { headers })),
            ]);
            const englivoProvisioned = englivoResult.status === 'fulfilled';
            const engrProvisioned = engrResult.status === 'fulfilled';
            if (englivoProvisioned) {
                this.logger.log(`Successfully provisioned user ${clerkId} in Englivo`);
            }
            else {
                const error = englivoResult.reason;
                this.logger.error(`Failed to provision user ${clerkId} in Englivo: ${JSON.stringify(error?.response?.data || error?.message || error)}`);
            }
            if (engrProvisioned) {
                this.logger.log(`Successfully provisioned user ${clerkId} in EngR`);
            }
            else {
                const error = engrResult.reason;
                this.logger.error(`Failed to provision user ${clerkId} in EngR: ${JSON.stringify(error?.response?.data || error?.message || error)}`);
            }
            await this.sharedUsersService.updateProvisioningStatus({
                clerkId,
                englivoProvisioned,
                engrProvisioned,
            });
            this.logger.log(`Updated provisioning status for ${clerkId}: Englivo=${englivoProvisioned}, EngR=${engrProvisioned}`);
        }
        catch (error) {
            this.logger.error(`Error processing user.created event:`, error);
            throw error;
        }
    }
};
exports.ClerkWebhookService = ClerkWebhookService;
exports.ClerkWebhookService = ClerkWebhookService = ClerkWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        shared_users_service_1.SharedUsersService])
], ClerkWebhookService);
