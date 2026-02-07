---
applyTo: '**/*.test.ts,**/*.spec.ts,**/__tests__/**'
---
# Testing Instructions - SGS CS Helper
# Generated: 2026-02-07
# Based on: Vitest 4.0.18, Testing patterns from existing tests

---

## 🧪 Test Framework

This project uses **Vitest** for testing.

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage
```

---

## 📁 Test File Location

```
src/
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   └── __tests__/
│   │       └── config.test.ts    # Tests next to implementation
│   └── actions/
│       ├── audit-log.ts
│       └── __tests__/
│           └── config.test.ts
└── types/
    └── __tests__/
        └── next-auth.test.ts
```

### Naming Convention

```
*.test.ts    # Unit tests
*.spec.ts    # Integration tests (optional)
```

---

## ✍️ Test Structure (AAA Pattern)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature/Module', () => {
  describe('function/method', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should do something when condition', () => {
      // Arrange - Set up test data
      const input = { name: 'Test' };
      
      // Act - Execute the code
      const result = myFunction(input);
      
      // Assert - Verify the result
      expect(result).toBe('expected');
    });
  });
});
```

---

## 🎯 Assertion Patterns

### Basic Assertions

```typescript
// Equality
expect(result).toBe(expected);           // Strict equality (===)
expect(result).toEqual(expected);        // Deep equality for objects
expect(result).toStrictEqual(expected);  // Deep equality + same types

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThanOrEqual(10);

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ name: 'Test' });
```

### Async Assertions

```typescript
// Promise resolves
await expect(asyncFn()).resolves.toBe('value');

// Promise rejects
await expect(asyncFn()).rejects.toThrow('error');
await expect(asyncFn()).rejects.toThrowError(/pattern/);
```

### Type Assertions

```typescript
// Check if object matches type shape
it('should have correct type structure', () => {
  const user = createUser();
  
  expect(user).toMatchObject({
    id: expect.any(String),
    createdAt: expect.any(Date),
    role: expect.stringMatching(/ADMIN|STAFF/),
  });
});
```

---

## 🎭 Mocking

### Mock Functions

```typescript
import { vi } from 'vitest';

// Create mock function
const mockFn = vi.fn();

// With return value
const mockFn = vi.fn().mockReturnValue('value');
const mockFn = vi.fn().mockResolvedValue('async value');

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(2);
```

### Mock Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

// Import after mock
import { prisma } from '@/lib/db';
```

### Spy on Functions

```typescript
import { vi } from 'vitest';

const spy = vi.spyOn(console, 'log');

// After calling code that logs
expect(spy).toHaveBeenCalledWith('expected message');

// Clean up
spy.mockRestore();
```

---

## 🔧 Test Setup

### beforeEach / afterEach

```typescript
describe('UserService', () => {
  let testUser: User;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Set up test data
    testUser = { id: '1', name: 'Test' };
  });
  
  afterEach(() => {
    // Clean up
  });
  
  it('should use test user', () => {
    expect(testUser.name).toBe('Test');
  });
});
```

### beforeAll / afterAll

```typescript
describe('Database tests', () => {
  beforeAll(async () => {
    // One-time setup (e.g., database connection)
  });
  
  afterAll(async () => {
    // One-time teardown
  });
});
```

---

## 📋 Testing Patterns in This Project

### Testing Type Definitions

```typescript
// From src/types/__tests__/next-auth.test.ts
describe('NextAuth Type Extensions', () => {
  it('should include canUpload in session user', () => {
    const session: Session = {
      user: {
        id: 'test-id',
        canUpload: true,
        canUpdateStatus: false,
        // ...
      },
      expires: '2026-01-01',
    };
    
    expect(session.user.canUpload).toBe(true);
  });
});
```

### Testing Validation Schemas

```typescript
describe('getAuditLogsSchema', () => {
  it('should accept valid input', () => {
    const input = {
      adminId: 'admin-1',
      page: 1,
      limit: 20,
    };
    
    const result = getAuditLogsSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid page', () => {
    const input = { page: 0 }; // Must be >= 1
    
    const result = getAuditLogsSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
```

### Testing Async Functions

```typescript
describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const hash = await hashPassword('secret123');
    
    const result = await verifyPassword('secret123', hash);
    
    expect(result).toBe(true);
  });
  
  it('should return false for wrong password', async () => {
    const hash = await hashPassword('secret123');
    
    const result = await verifyPassword('wrong', hash);
    
    expect(result).toBe(false);
  });
});
```

---

## 🚨 Common Mistakes

### Object Equality

```typescript
// ❌ Wrong - toBe checks reference equality
expect(session.user).toBe(user);

// ✅ Correct - toStrictEqual checks deep equality
expect(session.user).toStrictEqual(user);
```

### Async Tests

```typescript
// ❌ Wrong - Forgot await
it('should fetch user', () => {
  const user = getUser('1'); // Returns Promise
  expect(user.name).toBe('Test'); // Fails!
});

// ✅ Correct - Await the result
it('should fetch user', async () => {
  const user = await getUser('1');
  expect(user.name).toBe('Test');
});
```

### Mock Cleanup

```typescript
// ❌ Wrong - Mocks persist between tests
vi.mock('@/lib/db', () => ({ ... }));

// ✅ Correct - Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 📌 Quick Reference

| Task | Code |
|------|------|
| Run tests | `pnpm test` |
| Run once | `pnpm test:run` |
| Coverage | `pnpm test:coverage` |
| Mock function | `vi.fn()` |
| Mock module | `vi.mock('path')` |
| Spy function | `vi.spyOn(obj, 'method')` |
| Clear mocks | `vi.clearAllMocks()` |
| Reset mocks | `vi.resetAllMocks()` |
| Restore mocks | `vi.restoreAllMocks()` |
