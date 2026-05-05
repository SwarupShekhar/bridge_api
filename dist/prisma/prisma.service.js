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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: ['info', 'warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.connectionRetries = 0;
        this.maxRetries = 3;
        this.isConnecting = false;
    }
    async onModuleInit() {
        this.logger.log('PrismaService initialized - connection will be established on first query');
    }
    async connectWithRetry() {
        if (this.isConnecting) {
            this.logger.log('Connection already in progress, waiting...');
            while (this.isConnecting) {
                await this.delay(100);
            }
            return;
        }
        this.isConnecting = true;
        while (this.connectionRetries < this.maxRetries) {
            try {
                this.logger.log(`Connecting to database... (Attempt ${this.connectionRetries + 1}/${this.maxRetries})`);
                await this.$connect();
                this.logger.log('Successfully connected to database');
                this.connectionRetries = 0;
                this.isConnecting = false;
                return;
            }
            catch (error) {
                this.connectionRetries++;
                this.logger.error(`Database connection attempt ${this.connectionRetries} failed:`, error.message);
                if (this.connectionRetries >= this.maxRetries) {
                    this.logger.error('Max connection retries reached. Database will be available on first query.');
                    this.connectionRetries = 0;
                    this.isConnecting = false;
                    return;
                }
                await this.delay(2000 * this.connectionRetries);
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Successfully disconnected from database');
        }
        catch (error) {
            this.logger.error('Error disconnecting from database:', error);
        }
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error.message);
            await this.connectWithRetry();
            return false;
        }
    }
    async executeWithRetry(operation) {
        if (!this.isHealthy()) {
            await this.connectWithRetry();
        }
        try {
            return await operation();
        }
        catch (error) {
            if (error.message?.includes('connection') || error.message?.includes('closed') ||
                error.message?.includes('database') || error.code === 'P1001' ||
                error.code === 'P1002') {
                this.logger.warn('Database connection lost, attempting to reconnect...');
                await this.connectWithRetry();
                return await operation();
            }
            throw error;
        }
    }
    isHealthy() {
        try {
            return this.$queryRaw !== undefined;
        }
        catch {
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
