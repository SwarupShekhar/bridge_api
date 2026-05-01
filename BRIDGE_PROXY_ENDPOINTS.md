# Bridge Proxy Endpoints Documentation

## Overview

The Bridge API now includes server-side proxy endpoints that accept Bridge write events from mobile applications and forward them to the Bridge API using a server-held secret. This ensures secure communication between mobile clients and the Bridge API.

## Architecture

```
Mobile App → Backend (Core/Nest) → Bridge API
    ↓              ↓                    ↓
Clerk Token   Clerk Auth        Internal Secret
Verification   Service           (BRIDGE_INTERNAL_SECRET)
```

## Security Model

1. **Mobile → Backend**: Authentication via Clerk JWT tokens
2. **Backend → Bridge**: Authentication via `BRIDGE_INTERNAL_SECRET`
3. **Mobile never receives** the `BRIDGE_INTERNAL_SECRET`

## Environment Variables

Required environment variables:

```bash
# Bridge API Configuration
BRIDGE_API_URL=http://localhost:3012
BRIDGE_INTERNAL_SECRET=your-bridge-secret-here

# Clerk Authentication (optional for development)
CLERK_SECRET_KEY=your-clerk-secret-key-here

# Internal Service URLs (for cross-service communication)
PULSE_INTERNAL_URL=http://localhost:3001
CORE_INTERNAL_URL=http://localhost:3002
INTERNAL_SECRET=swarupshekhar171199
```

## Core Backend Endpoints (englivo.com)

### POST /api/bridge/last-active

Updates the user's last active app in Bridge.

**Request:**
```bash
POST /api/bridge/last-active
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json

{
  "app": "CORE" | "PULSE"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Last active app updated to CORE for user user_123"
}
```

### POST /api/bridge/sync-cefr

Syncs CEFR level to Bridge.

**Request:**
```bash
POST /api/bridge/sync-cefr
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json

{
  "cefrLevel": "B1",
  "fluencyScore": 75,
  "source": "CORE"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "CEFR level B1 synced for user user_123"
}
```

## Nest Backend Endpoints (pulse.englivo.com)

### POST /sessions/bridge/streak

Increments user's streak in Bridge.

**Request:**
```bash
POST /sessions/bridge/streak
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "status": "success",
  "message": "Streak incremented for user user_123"
}
```

### POST /sessions/bridge/minutes

Adds practice minutes to user in Bridge.

**Request:**
```bash
POST /sessions/bridge/minutes
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json

{
  "minutes": 30
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Added 30 practice minutes for user user_123"
}
```

## Implementation Details

### Files Created/Modified

1. **BridgeProxyService** (`src/bridge-proxy/bridge-proxy.service.ts`)
   - Handles HTTP requests to Bridge API
   - Manages internal secret authentication
   - Provides methods for all Bridge operations

2. **ClerkAuthService** (`src/bridge-proxy/clerk-auth.service.ts`)
   - Verifies Clerk JWT tokens
   - Extracts user ID from verified tokens
   - Falls back to simplified extraction for development

3. **BridgeProxyController** (`src/bridge-proxy/bridge-proxy.controller.ts`)
   - Core backend endpoints (`/api/bridge/*`)
   - Handles last-active and sync-cefr operations

4. **SessionsController** (`src/bridge-proxy/sessions.controller.ts`)
   - Nest backend endpoints (`/sessions/bridge/*`)
   - Handles streak and minutes operations

5. **BridgeProxyModule** (`src/bridge-proxy/bridge-proxy.module.ts`)
   - Module configuration with all dependencies

### Authentication Flow

1. **Mobile sends request** with Clerk JWT token
2. **Backend verifies token** using ClerkAuthService
3. **Backend extracts clerkId** from verified token
4. **Backend calls Bridge API** with internal secret
5. **Bridge API processes** the request and updates data

### Error Handling

- **401 Unauthorized**: Invalid or missing Clerk token
- **500 Internal Server Error**: Bridge API communication failure
- **400 Bad Request**: Invalid request body format

## Testing

### Unit Tests

All proxy endpoints have comprehensive unit tests:

```bash
# Run all tests
npm test

# Run only bridge proxy tests
npm test -- --testPathPattern=bridge-proxy
```

### Test Coverage

- ✅ Service methods for all Bridge operations
- ✅ Controller endpoints with authentication
- ✅ Clerk token verification
- ✅ Error handling scenarios
- ✅ Request/response validation

## Development vs Production

### Development Mode
- `CLERK_SECRET_KEY` not required
- Simplified token extraction from JWT payload
- Warning logs for missing configuration

### Production Mode
- `CLERK_SECRET_KEY` required
- Full JWT verification with Clerk
- Proper security validation

## Usage Examples

### Mobile App Integration

```javascript
// Mobile app code
const updateLastActive = async (app) => {
  const token = await getClerkToken();
  
  const response = await fetch('/api/bridge/last-active', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app }),
  });
  
  return response.json();
};

const addPracticeMinutes = async (minutes) => {
  const token = await getClerkToken();
  
  const response = await fetch('/sessions/bridge/minutes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ minutes }),
  });
  
  return response.json();
};
```

### Backend Integration

```javascript
// Core backend service
export class CoreUserService {
  async updateUserActivity(userId: string, app: 'CORE' | 'PULSE') {
    const token = await getClerkTokenForUser(userId);
    
    await this.httpService.post('/api/bridge/last-active', 
      { app }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  }
}

// Nest backend service
export class SessionService {
  async recordPracticeSession(userId: string, minutes: number) {
    const token = await getClerkTokenForUser(userId);
    
    await this.httpService.post('/sessions/bridge/minutes', 
      { minutes }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  }
}
```

## Deployment Considerations

1. **Environment Variables**: Ensure all required environment variables are set
2. **Clerk Configuration**: Configure proper Clerk secret keys for production
3. **Network Access**: Ensure backends can reach Bridge API endpoints
4. **Monitoring**: Monitor proxy endpoint usage and error rates
5. **Rate Limiting**: Consider rate limiting for mobile clients

## Troubleshooting

### Common Issues

1. **"BRIDGE_INTERNAL_SECRET not set"**
   - Set the environment variable in your deployment
   - Ensure it's the same secret used by Bridge API

2. **"Invalid authorization header"**
   - Ensure mobile app sends proper Bearer token
   - Check token format: `Bearer <token>`

3. **"Invalid or expired token"**
   - Verify Clerk secret key is correct
   - Check token expiration in mobile app

4. **Bridge API connection errors**
   - Verify Bridge API URL is correct
   - Check network connectivity between services

### Debug Logging

Enable debug logging to troubleshoot issues:

```bash
# Set log level to debug
LOG_LEVEL=debug npm run start:dev
```

## Security Best Practices

1. **Never expose** `BRIDGE_INTERNAL_SECRET` to mobile clients
2. **Use HTTPS** for all API communications
3. **Validate all input** data before forwarding to Bridge
4. **Monitor for** unusual activity patterns
5. **Rotate secrets** regularly
6. **Implement rate limiting** for proxy endpoints

## Future Enhancements

1. **Request caching** for repeated operations
2. **Batch operations** for multiple updates
3. **Webhook notifications** for Bridge updates
4. **Metrics collection** for usage analytics
5. **Circuit breaker** pattern for Bridge API failures
