# Environment Variables Setup Guide
# Hướng dẫn Thiết lập Biến Môi trường

## Quick Start / Bắt đầu nhanh

### 1. Copy template
```bash
cp .env.example .env.local
```

### 2. Update values with your configuration
```
Cập nhật các giá trị theo cấu hình của bạn
```

---

## Required Environment Variables / Biến Môi trường Bắt buộc

### Database Configuration / Cấu hình Database

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_cs_helper
```

- **Description / Mô tả**: PostgreSQL connection string for Prisma ORM
- **Format**: `postgresql://user:password@host:port/database`
- **Example / Ví dụ**:
  - Local: `postgresql://postgres:postgres@localhost:5432/sgs_cs_helper`
  - Vercel Postgres: `postgresql://user:password@xxxxx.postgres.vercel.com:5432/sgs_cs_helper`

---

### NextAuth Configuration / Cấu hình NextAuth

#### NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
```

- **Description / Mô tả**: Secret key for JWT encryption
- **How to generate / Cách tạo**:
  ```bash
  openssl rand -base64 32
  ```
- **Required / Bắt buộc**: Yes
- **Min length / Độ dài tối thiểu**: 32 characters

#### NEXTAUTH_URL
```
NEXTAUTH_URL=http://localhost:3000
```

- **Description / Mô tả**: The URL where the application is deployed
- **Values / Giá trị**:
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
- **Required / Bắt buộc**: Yes

---

### Seeding Configuration / Cấu hình Seed

#### SUPER_ADMIN_EMAIL
```
SUPER_ADMIN_EMAIL=admin@example.com
```

- **Description / Mô tả**: Email for Super Admin account (created during seed)
- **Example / Ví dụ**: `admin@sgs.com`
- **Required / Bắt buộc**: Yes

#### SUPER_ADMIN_PASSWORD
```
SUPER_ADMIN_PASSWORD=SuperAdmin123
```

- **Description / Mô tả**: Password for Super Admin account
- **Requirements / Yêu cầu**: Minimum 8 characters
- **Example / Ví dụ**: `MySecurePassword123!`
- **Required / Bắt buộc**: Yes
- **Security / Bảo mật**: Use strong password, don't share

#### STAFF_CODE (Optional)
```
STAFF_CODE=SGS2026
```

- **Description / Mô tả**: Default shared staff code
- **Default / Mặc định**: `SGS2026`
- **Required / Bắt buộc**: No
- **Note / Ghi chú**: Legacy variable for backward compatibility

#### LOGIN_MODE (Optional)
```
LOGIN_MODE=quick_code
```

- **Description / Mô tả**: Default login mode for the system
- **Allowed values / Giá trị cho phép**:
  - `quick_code` - Only staff code login
  - `full_login` - Only email/password login
  - `both` - Support both methods
- **Default / Mặc định**: `quick_code`
- **Required / Bắt buộc**: No

---

## Environment Variables by Environment / Biến Theo Môi trường

### Development / Phát triển

Create `.env.local` file:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sgs_cs_helper
NEXTAUTH_SECRET=dev-secret-key-min-32-characters-long
NEXTAUTH_URL=http://localhost:3000
SUPER_ADMIN_EMAIL=dev@example.com
SUPER_ADMIN_PASSWORD=DevPassword123
STAFF_CODE=SGS2026
LOGIN_MODE=quick_code
NODE_ENV=development
```

### Production / Sản xuất

Set these in Vercel dashboard:
- **Settings > Environment Variables**

```
DATABASE_URL=postgresql://...@xxxxx.postgres.vercel.com:5432/sgs_cs_helper
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.com
SUPER_ADMIN_EMAIL=<your-email>
SUPER_ADMIN_PASSWORD=<strong-password>
STAFF_CODE=<code>
LOGIN_MODE=quick_code
NODE_ENV=production
```

---

## Setup Instructions / Hướng dẫn Thiết lập

### 1. Create .env.local
```bash
cp .env.example .env.local
```

### 2. Update values
Edit `.env.local` with your configuration:
```bash
# Replace DATABASE_URL with your PostgreSQL connection string
# Thay thế DATABASE_URL bằng chuỗi kết nối PostgreSQL của bạn
DATABASE_URL=...

# Generate and set NEXTAUTH_SECRET
# Tạo và thiết lập NEXTAUTH_SECRET
openssl rand -base64 32
```

### 3. Initialize database
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Verify setup
```bash
# Check if migrations applied
pnpm db:generate

# Start development server
pnpm dev

# Visit http://localhost:3000/login
# Login with:
#   Email: (value of SUPER_ADMIN_EMAIL)
#   Password: (value of SUPER_ADMIN_PASSWORD)
```

---

## Common Issues / Vấn đề Thường gặp

### DATABASE_URL not set
```
Error: DATABASE_URL environment variable is not set
```

**Solution / Giải pháp**:
1. Create `.env.local` file
2. Add `DATABASE_URL=...` line
3. Restart dev server

### NEXTAUTH_SECRET too short
```
Error: secret should be at least 32 characters
```

**Solution / Giải pháp**:
```bash
openssl rand -base64 32
# Copy output and paste into NEXTAUTH_SECRET
```

### Migration fails
```
Error: ECONNREFUSED at localhost:5432
```

**Solution / Giải pháp**:
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Check database exists: `createdb sgs_cs_helper`

---

## Security Guidelines / Hướng dẫn Bảo mật

✅ **DO / NÊN LÀM**:
- Use strong passwords (min 12 characters with mixed case, numbers, symbols)
- Store `.env.local` locally only
- Use different secrets for dev and prod
- Regenerate NEXTAUTH_SECRET periodically
- Rotate passwords regularly

❌ **DON'T / KHÔNG NÊN**:
- Commit `.env.local` to git
- Share secrets via email or chat
- Use same password for dev and prod
- Use weak or simple passwords
- Store secrets in comments in code

---

## Additional Resources / Tài nguyên Bổ sung

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Database Connection](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [PostgreSQL Connection String](https://www.postgresql.org/docs/current/libpq-connect.html)

