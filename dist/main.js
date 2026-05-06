"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const prisma_exception_filter_1 = require("./prisma/prisma-exception.filter");
const prisma_service_1 = require("./prisma/prisma.service");
const common_2 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const prismaService = app.get(prisma_service_1.PrismaService);
    app.useGlobalFilters(new prisma_exception_filter_1.PrismaExceptionFilter(prismaService));
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3012);
    await app.listen(port);
    console.log(`Bridge API is running on port ${port}`);
    process.on('unhandledRejection', (reason) => {
        const logger = new common_2.Logger('UnhandledRejection');
        logger.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (error) => {
        const logger = new common_2.Logger('UncaughtException');
        logger.error('Uncaught Exception:', error.message, error.stack);
        setTimeout(() => process.exit(1), 5000);
    });
}
bootstrap();
