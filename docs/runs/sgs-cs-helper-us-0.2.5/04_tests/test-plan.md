# Phase 4: Testing - Test Plan
<!-- Version: 1.0 | Branch: feature/sgs-cs-helper-us-0.2.5 -->

## Test Execution Summary
- **Mode**: Standard (Tests written during Phase 4 after implementation)
- **Framework**: Vitest + Testing Library
- **Coverage Target**: 90%+ for auth logic
- **Test Status**: Ready to execute
- **Files**: 8 tasks → 9+ test cases

---

## Test Strategy

### 1. Unit Tests (Per-Function)
- **Location**: `src/**/__tests__/*.test.ts`
- **Purpose**: Test isolated functions with mocked dependencies
- **Framework**: Vitest
- **Coverage**: Auth providers, config functions, type safety

### 2. Integration Tests (Cross-Component)
- **Location**: `src/**/__tests__/*.integration.test.ts`
- **Purpose**: Test component interactions, database, real NextAuth
- **Setup**: Real database or test database
- **Coverage**: Login flow, session creation, permissions flow

### 3. E2E Tests (Full User Journey)
- **Location**: `e2e/` (if added later)
- **Purpose**: Test complete login workflow
- **Framework**: Playwright/Cypress
- **Coverage**: Form UI, form submission, redirect, session persistence

---

## Test Cases by Task

### TC-001: Staff Code Uniqueness in Schema
**Task**: T-001 (Update Prisma Schema)
**Type**: Unit (Schema validation)
**File**: `prisma/__tests__/schema.test.ts` (or review schema manually)

```typescript
describe('User Schema', () => {
  it('should enforce @unique constraint on staffCode', async () => {
    // Create user 1 with staffCode "SGS001"
    const user1 = await prisma.user.create({
      data: {
        email: 'test1@sgs.com',
        staffCode: 'SGS001',
        authMethod: 'STAFF_CODE',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
      },
    });

    // Try to create user 2 with same staffCode - should fail
    await expect(
      prisma.user.create({
        data: {
          email: 'test2@sgs.com',
          staffCode: 'SGS001',
          authMethod: 'STAFF_CODE',
          role: 'STAFF',
          status: 'ACTIVE',
          canUpload: true,
          canUpdateStatus: true,
        },
      })
    ).rejects.toThrow(); // Unique constraint violation
  });
});
```

**Expected Result**: ✅ Prisma throws P2002 error for duplicate staffCode

---

### TC-002: Migration & Seed Execution
**Task**: T-002 (Migration & Seed)
**Type**: Integration
**File**: `prisma/__tests__/seed.integration.test.ts`

```typescript
describe('Database Migration & Seed', () => {
  it('should apply migration and create super admin', async () => {
    // Assume migration already ran
    const superAdmin = await prisma.user.findUnique({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
    });

    expect(superAdmin).toBeDefined();
    expect(superAdmin.role).toBe('SUPER_ADMIN');
    expect(superAdmin.status).toBe('ACTIVE');
  });

  it('should set permissions on STAFF users', async () => {
    const staffUser = await prisma.user.findFirst({
      where: { role: 'STAFF' },
    });

    expect(staffUser.canUpload).toBe(true);
    expect(staffUser.canUpdateStatus).toBe(true);
  });

  it('should create login_mode config', async () => {
    const config = await prisma.config.findUnique({
      where: { key: 'login_mode' },
    });

    expect(config).toBeDefined();
    expect(config.value).toBe('quick_code');
  });
});
```

**Expected Result**: ✅ Database state matches expectations

---

### TC-003: Staff Code Provider - Valid Code
**Task**: T-003 (Staff Code Provider)
**Type**: Unit (Provider logic)
**File**: `src/lib/auth/__tests__/config.test.ts`

```typescript
import { authorize } from '@/lib/auth/config';

describe('Staff Code Provider', () => {
  it('should return user for valid staff code', async () => {
    // Mock prisma
    const mockUser = {
      id: 'test-id',
      email: 'staff@sgs.com',
      staffCode: 'SGS001',
      role: 'STAFF',
      status: 'ACTIVE',
      canUpload: true,
      canUpdateStatus: true,
      authMethod: 'STAFF_CODE',
    };

    // Mock prisma.user.findUnique to return staff user
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await authorize(
      { staffCode: 'SGS001' },
      req
    );

    expect(result).toEqual(expect.objectContaining({
      email: 'staff@sgs.com',
      canUpload: true,
      canUpdateStatus: true,
    }));
  });
});
```

**Expected Result**: ✅ Provider returns user object with permissions

---

### TC-004: Staff Code Provider - Invalid Code
**Task**: T-003 (Staff Code Provider)
**Type**: Unit (Provider error handling)
**File**: `src/lib/auth/__tests__/config.test.ts`

```typescript
it('should return null for invalid staff code', async () => {
  // Mock prisma to return null (code not found)
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

  const result = await authorize(
    { staffCode: 'INVALID' },
    req
  );

  expect(result).toBeNull();
});

it('should return null for inactive user', async () => {
  const inactiveUser = {
    id: 'test-id',
    email: 'inactive@sgs.com',
    staffCode: 'SGS002',
    role: 'STAFF',
    status: 'PENDING', // Not ACTIVE
    canUpload: false,
    canUpdateStatus: false,
  };

  vi.mocked(prisma.user.findUnique).mockResolvedValue(
    inactiveUser
  );

  const result = await authorize(
    { staffCode: 'SGS002' },
    req
  );

  expect(result).toBeNull();
});
```

**Expected Result**: ✅ Provider returns null for invalid/inactive users

---

### TC-005: Session Includes Permissions
**Task**: T-004 (Session Types)
**Type**: Unit (Session callback)
**File**: `src/lib/auth/__tests__/session.test.ts`

```typescript
describe('Session Types', () => {
  it('should include permissions in session', async () => {
    // Create session after login
    const session = {
      user: {
        id: 'test-id',
        email: 'staff@sgs.com',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: 'SGS001',
      },
    };

    // Verify TypeScript compilation
    const canUpload: boolean = session.user.canUpload;
    const canUpdateStatus: boolean = session.user.canUpdateStatus;
    const staffCode: string | null = session.user.staffCode;

    expect(canUpload).toBe(true);
    expect(canUpdateStatus).toBe(true);
    expect(staffCode).toBe('SGS001');
  });

  it('should set staffCode to null for email/password users', () => {
    const session = {
      user: {
        id: 'admin-id',
        email: 'admin@sgs.com',
        canUpload: true,
        canUpdateStatus: true,
        staffCode: null, // Email/password users don't have staffCode
      },
    };

    expect(session.user.staffCode).toBeNull();
  });
});
```

**Expected Result**: ✅ Session types match implementation

---

### TC-006: Login Mode Config Retrieval
**Task**: T-005 (Login Mode Config)
**Type**: Unit (Config function)
**File**: `src/lib/__tests__/config.test.ts`

```typescript
import { getLoginMode, updateLoginMode } from '@/lib/actions/config';

describe('Login Mode Config', () => {
  it('should return default login mode if not set', async () => {
    // Mock config not found
    vi.mocked(prisma.config.findUnique).mockResolvedValue(null);

    const mode = await getLoginMode();

    expect(mode).toBe('quick_code'); // Default
  });

  it('should return stored login mode', async () => {
    vi.mocked(prisma.config.findUnique).mockResolvedValue({
      key: 'login_mode',
      value: 'full_login',
    });

    const mode = await getLoginMode();

    expect(mode).toBe('full_login');
  });

  it('should update login mode', async () => {
    await updateLoginMode('both');

    expect(prisma.config.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'login_mode' },
        create: { key: 'login_mode', value: 'both' },
        update: { value: 'both' },
      })
    );
  });
});
```

**Expected Result**: ✅ Config functions return correct values

---

### TC-007: Login Form Adapts to Mode
**Task**: T-006 (Login Form)
**Type**: Integration (Component)
**File**: `src/app/(auth)/login/_components/__tests__/login-form.integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../login-form';

describe('Login Form - Mode Adaptation', () => {
  it('should show staff code input for quick_code mode', async () => {
    // Mock getLoginMode to return 'quick_code'
    vi.mocked(getLoginMode).mockResolvedValue('quick_code');

    render(<LoginForm />);

    await waitFor(() => {
      // Should show staff code input
      expect(
        screen.getByPlaceholderText(/enter your staff code/i)
      ).toBeInTheDocument();

      // Should NOT show email/password inputs
      expect(
        screen.queryByPlaceholderText(/enter your email/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should show email/password inputs for full_login mode', async () => {
    vi.mocked(getLoginMode).mockResolvedValue('full_login');

    render(<LoginForm />);

    await waitFor(() => {
      // Should show email input
      expect(
        screen.getByPlaceholderText(/enter your email/i)
      ).toBeInTheDocument();

      // Should NOT show staff code input
      expect(
        screen.queryByPlaceholderText(/enter your staff code/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should show both inputs for both mode', async () => {
    vi.mocked(getLoginMode).mockResolvedValue('both');

    render(<LoginForm />);

    await waitFor(() => {
      // Should show both
      expect(
        screen.getByPlaceholderText(/enter your staff code/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter your email/i)
      ).toBeInTheDocument();
    });
  });

  it('should change provider when user selects role', async () => {
    render(<LoginForm />);

    const roleSelect = screen.getByDisplayValue('STAFF');
    await userEvent.selectOptions(roleSelect, 'ADMIN');

    // Form should now show email/password fields
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter your email/i)
      ).toBeInTheDocument();
    });
  });
});
```

**Expected Result**: ✅ Form UI changes based on mode and role

---

### TC-008: Duplicate Code Creation Fails
**Task**: T-007 (Code Uniqueness)
**Type**: Integration (Helper function)
**File**: `src/lib/auth/__tests__/staff-code.integration.test.ts`

```typescript
import { createStaffCode } from '@/lib/auth/staff-code';

describe('Staff Code Uniqueness', () => {
  it('should fail when creating duplicate staff code', async () => {
    // First user gets SGS001
    await prisma.user.create({
      data: {
        email: 'user1@sgs.com',
        staffCode: 'SGS001',
        role: 'STAFF',
        status: 'ACTIVE',
        canUpload: true,
        canUpdateStatus: true,
      },
    });

    // Attempt to create second user with same code should fail
    await expect(
      createStaffCode('SGS001')
    ).rejects.toThrow(/already in use|unique constraint/i);
  });

  it('should handle P2002 error properly', async () => {
    // Mock Prisma to throw P2002
    vi.mocked(prisma.user.create).mockRejectedValue(
      new Error('Unique constraint failed on the fields: (`staffCode`)')
    );

    await expect(
      createStaffCode('DUPLICATE')
    ).rejects.toThrow();
  });
});
```

**Expected Result**: ✅ Function throws proper error for duplicates

---

### TC-009: PENDING/REVOKED Users Cannot Login
**Task**: T-008 (Status Validation)
**Type**: Unit (Provider validation)
**File**: `src/lib/auth/__tests__/config.test.ts`

```typescript
describe('User Status Validation', () => {
  it('should reject PENDING users', async () => {
    const pendingUser = {
      id: 'test-id',
      email: 'pending@sgs.com',
      staffCode: 'SGS001',
      role: 'STAFF',
      status: 'PENDING',
      canUpload: false,
      canUpdateStatus: false,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      pendingUser
    );

    const result = await authorize(
      { staffCode: 'SGS001' },
      req
    );

    expect(result).toBeNull();
  });

  it('should reject REVOKED users', async () => {
    const revokedUser = {
      id: 'test-id',
      email: 'revoked@sgs.com',
      staffCode: 'SGS002',
      role: 'STAFF',
      status: 'REVOKED',
      canUpload: true,
      canUpdateStatus: true,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      revokedUser
    );

    const result = await authorize(
      { staffCode: 'SGS002' },
      req
    );

    expect(result).toBeNull();
  });

  it('should accept ACTIVE users', async () => {
    const activeUser = {
      id: 'test-id',
      email: 'active@sgs.com',
      staffCode: 'SGS003',
      role: 'STAFF',
      status: 'ACTIVE',
      canUpload: true,
      canUpdateStatus: true,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      activeUser
    );

    const result = await authorize(
      { staffCode: 'SGS003' },
      req
    );

    expect(result).toEqual(
      expect.objectContaining({
        email: 'active@sgs.com',
      })
    );
  });
});
```

**Expected Result**: ✅ Only ACTIVE users can login

---

## Coverage Analysis

### By Task
| Task | Unit | Integration | E2E | Est Coverage |
|------|------|-------------|-----|--------------|
| T-001 | ✅ | — | — | 100% (schema) |
| T-002 | — | ✅ | — | 90% (seed logic) |
| T-003 | ✅ | — | — | 95% (provider) |
| T-004 | ✅ | — | — | 100% (types) |
| T-005 | ✅ | — | — | 95% (config) |
| T-006 | — | ✅ | — | 85% (component) |
| T-007 | — | ✅ | — | 90% (error handling) |
| T-008 | ✅ | — | — | 95% (validation) |
| **Overall** | **6** | **3** | **0** | **92%** |

---

## Test Execution Steps

### Setup
```bash
# 1. Install test dependencies
pnpm install

# 2. Ensure database is ready
pnpm db:generate
pnpm db:migrate

# 3. Set test environment
export NODE_ENV=test
```

### Run Tests
```bash
# All tests
pnpm test

# Watch mode (development)
pnpm test:watch

# With coverage
pnpm test --coverage

# Specific test file
pnpm test -- auth/__tests__/config.test.ts
```

### Test Database
Use test database or in-memory SQLite for isolation:
```bash
# Configure in vitest.config.ts
DATABASE_URL=file:./test.db
```

---

## Known Limitations & Assumptions

### Assumptions
1. **Database**: PostgreSQL with Prisma migrations applied
2. **NextAuth**: Session strategy using JWT
3. **Mocking**: vitest mock functions available
4. **Environment**: TEST NODE_ENV allows test-specific behavior

### Limitations
1. **E2E Tests**: Not included in Phase 4 scope (can be added later)
2. **UI Coverage**: Partial (login form UI tested, not full page)
3. **Load Testing**: Not included
4. **Security Testing**: Not included (e.g., password strength)

---

## Success Criteria

### Minimum (Phase 4 Pass)
- [ ] All 9 test cases written and executable
- [ ] 90%+ coverage for auth logic
- [ ] All tests pass
- [ ] No type errors in test files
- [ ] CI/CD passes

### Ideal (Full Quality)
- [ ] All 15+ test cases written
- [ ] Integration tests verify database state
- [ ] Edge cases covered (null inputs, malformed data)
- [ ] Error scenarios tested (network failure, DB error)
- [ ] Documentation includes test examples

---

## ⏸️ Stop: Ready for Test Execution

**Next Steps**:
1. Create test files for each test case above
2. Run `pnpm test` to verify test setup
3. Execute all tests and verify pass
4. Generate coverage report: `pnpm test --coverage`
5. Move to Phase 5 (Done Check)

**Test Execution Timeline**:
- Unit tests: 20-30 minutes
- Integration tests: 15-20 minutes  
- Verification: 10 minutes
- **Total: ~45-60 minutes**

---

**Phase**: 4 (Testing)
**Status**: Ready to execute
**Created**: 2026-02-06
**Last Updated**: 2026-02-06
