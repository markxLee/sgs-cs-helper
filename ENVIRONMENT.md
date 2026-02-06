# Environment Variables Checklist
# Danh sách Kiểm tra Biến Môi trường

## Setup Instructions / Hướng dẫn Thiết lập

### Step 1: Create `.env.local`
Tạo file `.env.local` với nội dung dưới đây:

```bash
# ============================================
# REQUIRED - Database / BẮT BUỘC - Database
# ============================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_cs_helper

# ============================================
# REQUIRED - NextAuth / BẮT BUỘC - NextAuth
# ============================================
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# ============================================
# REQUIRED - Seeding / BẮT BUỘC - Seed
# ============================================
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=SuperAdmin123

# ============================================
# OPTIONAL - Default Config / TÙY CHỌN - Cấu hình Mặc định
# ============================================
STAFF_CODE=SGS2026
LOGIN_MODE=quick_code
NODE_ENV=development
```

### Step 2: Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
# Copy the output and paste into NEXTAUTH_SECRET
```

### Step 3: Update database connection
Update `DATABASE_URL` with your PostgreSQL connection:
```
postgresql://user:password@localhost:5432/sgs_cs_helper
```

### Step 4: Verify the setup
```bash
# Generate Prisma types
pnpm db:generate

# Run migrations (if any)
pnpm db:migrate

# Seed the database (creates Super Admin)
pnpm db:seed

# Start dev server
pnpm dev
```

---

## Variable Reference / Tham chiếu Biến

### DATABASE_URL
- **Required / Bắt buộc**: ✅ Yes
- **Default / Mặc định**: None
- **Example**: `postgresql://postgres:postgres@localhost:5432/sgs_cs_helper`
- **Description / Mô tả**: PostgreSQL connection string for Prisma

### NEXTAUTH_SECRET
- **Required / Bắt buộc**: ✅ Yes
- **Default / Mặc định**: None
- **Min length / Độ dài tối thiểu**: 32 characters
- **Generate / Tạo**: `openssl rand -base64 32`
- **Description / Mô tả**: JWT encryption secret for NextAuth

### NEXTAUTH_URL
- **Required / Bắt buộc**: ✅ Yes
- **Default / Mặc định**: None
- **Dev / Phát triển**: `http://localhost:3000`
- **Production / Sản xuất**: `https://your-domain.com`
- **Description / Mô tả**: Application URL

### SUPER_ADMIN_EMAIL
- **Required / Bắt buộc**: ✅ Yes (for seeding)
- **Default / Mặc định**: None
- **Example**: `admin@sgs.com`
- **Description / Mô tả**: Email for initial Super Admin account

### SUPER_ADMIN_PASSWORD
- **Required / Bắt buộc**: ✅ Yes (for seeding)
- **Default / Mặc định**: None
- **Min length / Độ dài tối thiểu**: 8 characters
- **Example**: `MySecurePassword123!`
- **Description / Mô tả**: Password for initial Super Admin account

### STAFF_CODE
- **Required / Bắt buộc**: ❌ No
- **Default / Mặc định**: `SGS2026`
- **Example**: `SGS2026`
- **Description / Mô tả**: Legacy shared staff code (optional)

### LOGIN_MODE
- **Required / Bắt buộc**: ❌ No
- **Default / Mặc định**: `quick_code`
- **Allowed / Cho phép**:
  - `quick_code`: Staff code login only
  - `full_login`: Email/password login only
  - `both`: Both methods available
- **Description / Mô tả**: System-wide login mode configuration

### NODE_ENV
- **Required / Bắt buộc**: ❌ No
- **Default / Mặc định**: `development`
- **Allowed / Cho phép**: `development`, `production`, `test`
- **Description / Mô tả**: Node.js environment

---

## Deployment / Triển khai

### Vercel Setup
1. Go to project Settings > Environment Variables
2. Add all REQUIRED variables
3. Set NODE_ENV to `production`
4. Redeploy

### Environment-specific values

#### Development / Phát triển
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_cs_helper
NEXTAUTH_SECRET=dev-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

#### Production / Sản xuất
```
DATABASE_URL=postgresql://user:pass@vercel-postgres.com/sgs_cs_helper
NEXTAUTH_SECRET=prod-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

---

## Troubleshooting / Khắc phục sự cố

### Missing DATABASE_URL
```
Error: DATABASE_URL environment variable is not set
```
**Fix**: Add `DATABASE_URL=...` to `.env.local` and restart server

### NEXTAUTH_SECRET validation
```
Error: secret should be at least 32 characters
```
**Fix**: Generate with `openssl rand -base64 32` and paste full output

### Connection refused
```
Error: ECONNREFUSED at localhost:5432
```
**Fix**: 
1. Start PostgreSQL: `pg_ctl start` or `brew services start postgresql`
2. Verify DATABASE_URL
3. Ensure database exists

### Seed fails
```
Error: Connection refused or authentication failed
```
**Fix**:
1. Check DATABASE_URL is correct
2. Verify PostgreSQL is running
3. Ensure user/password are correct

---

## Security Notes / Ghi chú Bảo mật

⚠️ **Never commit `.env.local` to git**
- Use `.gitignore` (already configured)
- Never share NEXTAUTH_SECRET
- Use strong passwords (12+ chars with mixed case)
- Rotate secrets periodically

✅ **Best practices**:
1. Use separate secrets for dev/prod
2. Regenerate NEXTAUTH_SECRET regularly
3. Store production secrets in vault
4. Audit environment access logs
5. Limit secret access to team members only

