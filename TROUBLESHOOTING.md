# Bridge API - Troubleshooting Guide

## Issues Found & Fixed

### 1. Database Connection Error
**Error**: `Can't reach database server at ep-wild-tree-anr4wid6-pooler.c-6.us-east-1.aws.neon.tech:5432`

**Solution**: 
- Check your `.env` file - it should have the correct `DATABASE_URL`
- Ensure the Neon database is accessible
- Verify network connectivity to the Neon database

### 2. Invalid Internal Secret
**Error**: `Invalid internal secret provided` warnings

**Solution**:
- Ensure your `.env` file has `INTERNAL_SECRET` set (not `INTERNAL_BRIDGE_SECRET`)
- The secret should match between services
- Use the correct header: `x-internal-secret: <your-secret>`

### 3. Missing LiveKit Webhook Endpoint
**Error**: `POST /webhooks/livekit/egress 404 Not Found`

**Solution**: ✅ **FIXED**
- Added LiveKit webhook endpoint in `src/webhook/clerk-webhook.controller.ts`
- Endpoint now returns 200 OK with basic processing

## Environment Variables Required

Update your `.env` file with these variables:

```bash
# Database (use your actual Neon database URL)
DATABASE_URL="your_neon_database_url"

# Internal Service URLs
PULSE_INTERNAL_URL="http://localhost:3001"
CORE_INTERNAL_URL="http://localhost:3002"

# Internal Secret for service-to-service communication
INTERNAL_SECRET="swarupshekhar171199"

# Server Port
PORT=3000
```

## Testing the Endpoints

### Test User Endpoints
```bash
# Get user (replace with actual clerkId and secret)
curl -H "x-internal-secret: swarupshekhar171199" \
  http://localhost:3000/user/your_clerk_id

# Update user
curl -X PATCH \
  -H "x-internal-secret: swarupshekhar171199" \
  -H "Content-Type: application/json" \
  -d '{"last_active_app": "PULSE", "preferred_mode": "practice"}' \
  http://localhost:3000/user/your_clerk_id

# Increment streak
curl -X PATCH \
  -H "x-internal-secret: swarupshekhar171199" \
  http://localhost:3000/user/your_clerk_id/streak

# Add minutes
curl -X PATCH \
  -H "x-internal-secret: swarupshekhar171199" \
  -H "Content-Type: application/json" \
  -d '{"minutes": 15}' \
  http://localhost:3000/user/your_clerk_id/minutes

# Update CEFR
curl -X PATCH \
  -H "x-internal-secret: swarupshekhar171199" \
  -H "Content-Type: application/json" \
  -d '{"clerkId": "your_clerk_id", "cefrLevel": "B2", "fluencyScore": 75, "source": "PULSE"}' \
  http://localhost:3000/sync/cefr
```

### Test Webhooks
```bash
# Test LiveKit webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"type": "egress.started", "data": {}}' \
  http://localhost:3000/webhooks/livekit/egress
```

## Next Steps

1. **Update your local `.env` file** with the correct database URL and internal secret
2. **Restart the application** after updating environment variables
3. **Test the endpoints** to verify they work correctly
4. **Monitor logs** for any remaining issues

The Bridge API should now handle all required endpoints and webhook requests properly.
