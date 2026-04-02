# Bridge API

Bridge API for syncing users between EngR and Englivo

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline using GitHub Actions.

### Pipeline Features

- **Automated Testing**: Runs linting and unit tests on every push and pull request
- **Code Coverage**: Generates and uploads coverage reports to Codecov
- **Security Scanning**: Runs npm audit and Snyk security scans
- **Docker Builds**: Automatically builds and pushes Docker images to GitHub Container Registry
- **Automated Releases**: Creates releases when tags are pushed
- **Multi-Environment Support**: Separate configurations for development and production

### Workflow Triggers

The CI/CD pipeline is triggered by:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches  
- Git tags (for releases)

### Jobs Overview

1. **test**: Linting, testing, and coverage reporting
2. **build**: Application build verification
3. **security**: Security vulnerability scanning
4. **docker**: Docker image building and pushing
5. **deploy**: Production deployment (main branch only)

## Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

### Docker Development

1. **Development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Production environment**
   ```bash
   docker-compose up --build
   ```

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PULSE_INTERNAL_URL`: Pulse service URL
- `CORE_INTERNAL_URL`: Core service URL  
- `INTERNAL_SECRET`: Service-to-service authentication secret
- `PORT`: Application port (default: 3000)

## Available Scripts

- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run start` - Start in production mode
- `npm run start:dev` - Start in development mode
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Database

This project uses Prisma ORM with PostgreSQL.

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Deployment

### Docker Deployment

1. **Build image**
   ```bash
   docker build -t bridge-api .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env bridge-api
   ```

### Production Deployment

The CI/CD pipeline automatically:
1. Builds Docker images
2. Pushes to GitHub Container Registry
3. Deploys to production (on main branch merges)

### Environment-Specific Configurations

- **Development**: Uses `docker-compose.dev.yml`
- **Production**: Uses `docker-compose.yml`

## Monitoring and Health

### Health Check
The application includes a health check endpoint:
```
GET /health
```

### Docker Health Checks
- Application health check every 30 seconds
- PostgreSQL health check every 10 seconds
- Redis health check every 10 seconds

## Security

- Security scans run on every PR
- Dependency vulnerability scanning with Snyk
- Non-root Docker user for production
- Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

The CI/CD pipeline will automatically run tests and checks on your PR.
