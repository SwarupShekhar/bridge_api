// Test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:171199@localhost:5432/bridge_API_DB_test';
  process.env.INTERNAL_SECRET = 'swarupshekhar171199';
  process.env.PORT = '3001';
  process.env.PULSE_INTERNAL_URL = 'http://localhost:3001';
  process.env.CORE_INTERNAL_URL = 'http://localhost:3002';
});

// Cleanup after tests
afterAll(async () => {
  // Clean up test data if needed
});
