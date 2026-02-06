# User Stories: SGS CS Order Tracker
<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-helper -->

---

## User Stories Overview / Tổng quan User Stories

| Field | Value |
|-------|-------|
| **Product Name** | SGS CS Order Tracker |
| **Product Slug** | `sgs-cs-helper` |
| **Scope Covered** | Phase 0 (Foundation) + Phase 1 (MVP) |
| **Total User Stories** | 19 |

---

## Dependency Graph Summary

```
Phase 0 Foundation:
  US-0.1.1 (Project Init) ──┬──► US-0.3.1 (DB Schema)
                            │
                            └──► US-0.2.1 (Super Admin Login)
                                      │
  US-0.3.1 (DB Schema) ───────────────┤
                                      │
  US-0.2.1 + US-0.3.1 ────────────────┼──► US-0.2.2 (Admin Dashboard & Invitation)
                                      │              │
                                      │              ├──► US-0.2.3 (Admin Google OAuth)
                                      │              │
                                      │              └──► US-0.2.4 (Admin Credentials)
                                      │
                                      └──► US-0.2.5 (Staff Login)
                                                │
  US-0.2.3 + US-0.2.4 + US-0.2.5 ──────────────► US-0.2.6 (Route Protection)
                                                │
Phase 1 MVP:                                    │
  US-0.2.5 + US-0.3.1 ────────────────────────► US-1.1.1 (Upload UI)
                                                      │
  US-1.1.1 ──────────────────────────────────────────► US-1.1.2 (Parse Excel)
                                                            │
  US-1.1.2 ──────────────────────────────────────────────► US-1.1.3 (Store + Dedup)
                                                                  │
  US-1.1.3 ──────────────────────────────────────────────────────► US-1.2.1 (Order List)
                                                                  │
  US-1.2.1 ───┬──► US-1.2.2 (Progress Bar)                       │
              ├──► US-1.2.3 (Filters)                            │
              └──► US-1.3.1 (Mark Done)                          │
```

---

# English

---

## Phase 0: Foundation

### Epic 0.1: Project Setup

---

**US-0.1.1: Initialize Project Structure**

- **Description**: As a developer, I need the project initialized with the correct folder structure, dependencies, and configuration so that I can start building features.

- **Acceptance Criteria**:
  - AC1: Next.js 16.0.10 project with App Router is created
  - AC2: TypeScript is configured with strict mode
  - AC3: Tailwind CSS and shadcn/ui are installed and configured
  - AC4: Prisma is installed and connected to PostgreSQL
  - AC5: Environment variables template (.env.example) exists
  - AC6: Project can be deployed to Vercel successfully
  - AC7: Folder structure matches tech stack instructions

- **Blocked By**: None

- **Notes**: This is the foundation story - all other stories depend on this.

---

**US-0.1.2: Configure Development Environment**

- **Description**: As a developer, I need proper linting, formatting, and development scripts so that I can develop efficiently with consistent code quality.

- **Acceptance Criteria**:
  - AC1: ESLint is configured with Next.js recommended rules
  - AC2: Prettier is configured for code formatting
  - AC3: `pnpm dev` starts development server
  - AC4: `pnpm build` creates production build
  - AC5: `pnpm lint` runs linting checks
  - AC6: Pre-commit hooks validate code (optional)

- **Blocked By**: US-0.1.1

- **Notes**: Can be done in parallel with US-0.3.1 after US-0.1.1.

---

### Epic 0.2: Authentication System

---

**US-0.2.1: Super Admin Seeded Login**

- **Description**: As a Super Admin, I can log in with my seeded username and password so that I can access the system and manage it.

- **Acceptance Criteria**:
  - AC1: Login page exists at `/login`
  - AC2: Super Admin credentials are seeded during database setup
  - AC3: Successful login redirects to dashboard
  - AC4: Invalid credentials show error message
  - AC5: Session is created and persisted
  - AC6: Super Admin role is correctly assigned

- **Blocked By**: US-0.1.1, US-0.3.1

- **Notes**: NextAuth.js Credentials provider for Super Admin.

---

**US-0.2.2: Super Admin Dashboard & Admin Invitation**

- **Description**: As a Super Admin, I can access a dashboard to manage Admin users by inviting them via email, so that I can control who has Admin access to the system.

- **Acceptance Criteria**:
  - AC1: Super Admin dashboard exists at `/admin/users`
  - AC2: "Invite Admin" form with email input field
  - AC3: Super Admin can choose auth method: "Google OAuth" or "Email/Password"
  - AC4: If "Email/Password" chosen, Super Admin creates initial password for Admin
  - AC5: Invited Admin is stored in database with `ADMIN` role and `pending` status
  - AC6: Super Admin can see list of all invited/active Admin users
  - AC7: Super Admin can revoke/delete Admin access
  - AC8: Email validation ensures valid email format

- **Blocked By**: US-0.2.1, US-0.3.1

- **Notes**: Admin invitation is stored in User table. Auth method determines how Admin can login.

---

**US-0.2.3: Admin Google OAuth Login**

- **Description**: As an invited Admin with Gmail, I can log in using my Google account so that I can access the system without remembering a password.

- **Acceptance Criteria**:
  - AC1: "Login with Google" button exists on login page
  - AC2: Only invited Admin emails (with Google auth method) can log in
  - AC3: Gmail must match an existing invited Admin record
  - AC4: Non-invited users see "Not authorized" message
  - AC5: First successful login updates Admin status from `pending` to `active`
  - AC6: Admin role is correctly assigned in session
  - AC7: Session is created and persisted
  - AC8: Successful login redirects to `/dashboard`

- **Blocked By**: US-0.2.2

- **Notes**: Requires Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).

---

**US-0.2.4: Admin Credentials Login**

- **Description**: As an invited Admin, I can log in with the email and password created by Super Admin so that I can access the system without Google account.

- **Acceptance Criteria**:
  - AC1: Email/password form exists on login page (same as Super Admin)
  - AC2: Only invited Admins (with Password auth method) can log in
  - AC3: Credentials validated against Admin record in database
  - AC4: Invalid credentials show "Invalid email or password" message
  - AC5: First successful login updates Admin status from `pending` to `active`
  - AC6: Admin role is correctly assigned in session
  - AC7: Session is created and persisted
  - AC8: Successful login redirects to `/dashboard`

- **Blocked By**: US-0.2.2

- **Notes**: Password is hashed with bcrypt. Super Admin creates the initial password.

---

**US-0.2.5: Staff Code Login (Per-User)**

- **Description**: As a Staff member, I can log in with my personal staff code so that I can quickly access the system. Each staff has their own unique code assigned by Admin/Super Admin.

- **Acceptance Criteria**:
  - AC1: Code input field exists on login page (when quick login is enabled)
  - AC2: Correct personal code grants access with STAFF role and user permissions
  - AC3: Incorrect code shows error message
  - AC4: Staff session is created with individual user record (not anonymous)
  - AC5: Staff can access dashboard after login
  - AC6: Staff code must be unique per user (no duplicates)
  - AC7: Login respects system-wide login mode setting (quick code vs full login)
  - AC8: Session includes permissions: canUpload, canUpdateStatus

- **Blocked By**: US-0.2.1, US-0.3.1

- **Notes**: Staff code stored in User.staffCode field. Requires US-0.2.7 for staff creation and US-0.2.8 for login mode config.

---

**US-0.2.6: Role-Based Route Protection**

- **Description**: As a system, I need to protect routes based on user roles so that unauthorized users cannot access restricted areas.

- **Acceptance Criteria**:
  - AC1: Unauthenticated users are redirected to login
  - AC2: STAFF can access: dashboard, upload (if canUpload), mark done (if canUpdateStatus)
  - AC3: ADMIN can access: dashboard, upload, mark done, settings, staff management
  - AC4: SUPER_ADMIN can access: all routes including user management (`/admin/*`)
  - AC5: Unauthorized access shows "Access Denied" page
  - AC6: Permission-based access control (canUpload, canUpdateStatus)

- **Blocked By**: US-0.2.1, US-0.2.3, US-0.2.4, US-0.2.5

- **Notes**: Implemented via NextAuth.js middleware. Check both role and permissions.

---

**US-0.2.7: Staff User Management**

- **Description**: As an Admin or Super Admin, I can create and manage staff users so that I can control who has access to the system and what they can do.

- **Acceptance Criteria**:
  - AC1: Staff management page exists at `/admin/staff`
  - AC2: "Create Staff" form with: name, email (optional), permissions
  - AC3: Staff code is auto-generated (unique 6-char alphanumeric)
  - AC4: Staff code uniqueness is enforced (no duplicates)
  - AC5: Can set permissions: canUpload (upload orders), canUpdateStatus (mark done)
  - AC6: Can view list of all staff users with their codes and permissions
  - AC7: Can edit staff permissions
  - AC8: Can deactivate/reactivate staff (change status)
  - AC9: Can regenerate staff code if needed
  - AC10: Both Admin and Super Admin can manage staff

- **Blocked By**: US-0.2.2

- **Notes**: Staff code is shown to Admin for sharing with staff member. Code visible only at creation or regeneration.

---

**US-0.2.8: Login Mode Configuration**

- **Description**: As an Admin or Super Admin, I can configure the system-wide login mode so that I can control whether staff can use quick code login or must use full username/password.

- **Acceptance Criteria**:
  - AC1: Setting exists in Config: `login_mode` with values: `quick_code`, `full_login`, `both`
  - AC2: Admin settings page has toggle for login mode
  - AC3: When `quick_code`: Only code input shown for staff on login page
  - AC4: When `full_login`: Only email/password shown for staff on login page
  - AC5: When `both`: Staff can choose between code or email/password
  - AC6: Default mode is `quick_code`
  - AC7: Setting change takes effect immediately (no restart needed)
  - AC8: Super Admin and Admin can both change this setting

- **Blocked By**: US-0.2.2

- **Notes**: Stored in Config table. Affects login page UI dynamically.

---

### Epic 0.3: Database Schema

---

**US-0.3.1: Create Core Database Schema**

- **Description**: As a developer, I need the database schema created so that the application can store and retrieve data.

- **Acceptance Criteria**:
  - AC1: User model exists with id, email, name, role, staffCode, timestamps
  - AC2: Order model exists with jobNumber, registeredDate, requiredDate, priority, status, timestamps
  - AC3: Config model exists with key-value pairs
  - AC4: Role enum includes SUPER_ADMIN, ADMIN, STAFF
  - AC5: OrderStatus enum includes IN_PROGRESS, COMPLETED, OVERDUE
  - AC6: Indexes exist on frequently queried fields
  - AC7: `pnpm prisma db push` applies schema successfully

- **Blocked By**: US-0.1.1

- **Notes**: Schema as defined in tech stack instructions.

---

**US-0.3.2: Seed Initial Data**

- **Description**: As a developer, I need initial data seeded so that the system is ready for first use.

- **Acceptance Criteria**:
  - AC1: Super Admin user is created with hashed password
  - AC2: Default config values are created (warning_threshold: 80, staff_code)
  - AC3: `pnpm prisma db seed` runs successfully
  - AC4: Seed is idempotent (running twice doesn't create duplicates)

- **Blocked By**: US-0.3.1

- **Notes**: Credentials from environment variables.

---

## Phase 1: MVP (Minimum Viable Product)

### Epic 1.1: Order Upload & Parsing

---

**US-1.1.1: Upload Excel Files UI**

- **Description**: As a Staff member, I can upload one or more Excel files so that order data can be imported into the system.

- **Acceptance Criteria**:
  - AC1: Upload area exists on dashboard (drag-and-drop or click to select)
  - AC2: Multiple .xls files can be selected at once
  - AC3: Only .xls files are accepted (validation)
  - AC4: Upload progress is shown for each file
  - AC5: Success/failure feedback is displayed per file
  - AC6: Invalid file format shows clear error message
  - AC7: Loading spinner/skeleton shown during file processing
  - AC8: Upload button disabled while processing to prevent double-submit

- **Blocked By**: US-0.2.3, US-0.3.1

- **Notes**: Files processed server-side for security.

---

**US-1.1.2: Parse Excel and Extract Order Data**

- **Description**: As a system, I need to parse uploaded Excel files and extract order data so that orders can be stored in the database.

- **Acceptance Criteria**:
  - AC1: Job Number is extracted from row 1 (e.g., "2601A-03979")
  - AC2: Registered Date is extracted and converted to datetime (Vietnam TZ)
  - AC3: Required Date is extracted and converted to datetime
  - AC4: Priority is extracted as integer
  - AC5: Excel date serial numbers are correctly converted
  - AC6: Parse errors are reported with file name and reason

- **Blocked By**: US-1.1.1

- **Notes**: Use xlsx library server-side.

---

**US-1.1.3: Store Order with Duplicate Detection**

- **Description**: As a system, I need to store parsed order data in the database with duplicate detection so that orders can be tracked without creating duplicates.

- **Acceptance Criteria**:
  - AC1: Job Number uniqueness is checked before insert (case-insensitive)
  - AC2: Duplicate orders are skipped (not created)
  - AC3: User is notified which files were duplicates
  - AC4: Non-duplicate orders in same batch are still processed
  - AC5: Order record is created with all extracted fields
  - AC6: Status is set to IN_PROGRESS by default
  - AC7: uploadedAt timestamp is recorded
  - AC8: uploadedById references the current user
  - AC9: Database transaction ensures data integrity

- **Blocked By**: US-1.1.2

- **Notes**: Job Number is the unique identifier. Link order to user who uploaded it.

---

### Epic 1.2: Order Dashboard

---

**US-1.2.1: Display Orders List**

- **Description**: As a Staff member, I can see a list of all orders so that I can monitor what's in progress.

- **Acceptance Criteria**:
  - AC1: Orders are displayed in a table/list view
  - AC2: Each row shows: Job Number, Registered Date, Required Date, Priority, Status
  - AC3: Orders are sorted by Required Date (soonest first) by default
  - AC4: Empty state shows "No orders" message
  - AC5: List loads quickly (< 2 seconds for 100 orders)
  - AC6: Loading skeleton/spinner shown while fetching data
  - AC7: Error state shown if data fetch fails with retry option

- **Blocked By**: US-1.1.3

- **Notes**: Server component for initial data fetch.

---

**US-1.2.2: Display Progress Bar**

- **Description**: As a Staff member, I can see a progress bar for each order showing time elapsed so that I know how urgent each order is.

- **Acceptance Criteria**:
  - AC1: Progress bar shows % of time elapsed (Registered → Required)
  - AC2: Progress bar is color-coded:
    - 🟢 Green: 0-60%
    - 🟡 Yellow: 61-80%
    - 🟠 Orange: 81-95%
    - 🔴 Red: >95% or overdue
  - AC3: Percentage number is displayed alongside bar
  - AC4: Overdue orders show 100%+ with red indicator
  - AC5: Progress updates on page refresh

- **Blocked By**: US-1.2.1

- **Notes**: Calculate server-side, display client-side.

---

**US-1.2.3: Priority Color Coding**

- **Description**: As a Staff member, I can see orders color-coded by priority so that I can quickly identify urgent orders.

- **Acceptance Criteria**:
  - AC1: Priority badge/indicator is visible for each order
  - AC2: Color coding based on priority value:
    - Priority 1-2: 🔴 Red (Critical)
    - Priority 3-4: 🟠 Orange (High)
    - Priority 5-6: 🟡 Yellow (Medium)
    - Priority 7+: 🟢 Green (Low)
  - AC3: Priority is visible in list and detail views

- **Blocked By**: US-1.2.1

- **Notes**: Exact thresholds can be adjusted.

---

**US-1.2.4: Filter Orders by Status**

- **Description**: As a Staff member, I can filter orders by status so that I can focus on orders that need attention.

- **Acceptance Criteria**:
  - AC1: Filter buttons/tabs exist: All, In Progress, Completed, Overdue
  - AC2: Clicking filter shows only matching orders
  - AC3: Order count is shown for each filter
  - AC4: Default filter is "In Progress"
  - AC5: Filter state persists during session

- **Blocked By**: US-1.2.1

- **Notes**: Could be tabs or dropdown.

---

**US-1.2.5: Sort Orders**

- **Description**: As a Staff member, I can sort orders by different columns so that I can organize my view.

- **Acceptance Criteria**:
  - AC1: Sortable columns: Required Date, Priority, Registered Date, Job Number
  - AC2: Click column header to sort
  - AC3: Toggle between ascending/descending
  - AC4: Sort indicator shows current sort direction
  - AC5: Default sort: Required Date ascending

- **Blocked By**: US-1.2.1

- **Notes**: Client-side or server-side sorting acceptable.

---

### Epic 1.3: Order Completion

---

**US-1.3.1: Mark Order as Done**

- **Description**: As a Staff member, I can mark an order as Done so that completed work is tracked.

- **Acceptance Criteria**:
  - AC1: "Mark Done" button exists for each in-progress order
  - AC2: Clicking button changes order status to COMPLETED
  - AC3: completedAt timestamp is recorded
  - AC4: Visual feedback confirms action (toast notification)
  - AC5: Order moves to Completed filter
  - AC6: Button is disabled for already-completed orders

- **Blocked By**: US-1.2.1

- **Notes**: Use Server Action for mutation.

---

**US-1.3.2: Visual Distinction for Completed Orders**

- **Description**: As a Staff member, I can visually distinguish completed orders so that I know what's done.

- **Acceptance Criteria**:
  - AC1: Completed orders have different visual style (grayed out, strikethrough, or badge)
  - AC2: Progress bar shows "Complete" instead of percentage
  - AC3: Completion timestamp is displayed
  - AC4: "Mark Done" button is replaced with "Completed" indicator

- **Blocked By**: US-1.3.1

- **Notes**: Clear visual distinction.

---

**US-1.3.3: Undo Order Completion**

- **Description**: As a Staff member, I can undo marking an order as Done (within 5 minutes) so that I can correct mistakes.

- **Acceptance Criteria**:
  - AC1: "Undo" option appears after marking done (toast or button)
  - AC2: Undo is available for 5 minutes after completion
  - AC3: Clicking undo reverts status to IN_PROGRESS
  - AC4: completedAt is cleared
  - AC5: After 5 minutes, undo option is no longer available

- **Blocked By**: US-1.3.1

- **Notes**: Time window prevents accidental permanent changes.

---

---

## User Story Summary Table

| ID | Title | Blocked By | Phase |
|----|-------|------------|-------|
| US-0.1.1 | Initialize Project Structure | None | 0 |
| US-0.1.2 | Configure Development Environment | US-0.1.1 | 0 |
| US-0.2.1 | Super Admin Seeded Login | US-0.1.1, US-0.3.1 | 0 |
| US-0.2.2 | Admin Google OAuth Login | US-0.2.1, US-0.3.1 | 0 |
| US-0.2.5 | Staff Code Login (Per-User) | US-0.2.1, US-0.3.1 | 0 |
| US-0.2.6 | Role-Based Route Protection | US-0.2.1, US-0.2.3-5 | 0 |
| US-0.2.7 | Staff User Management | US-0.2.2 | 0 |
| US-0.2.8 | Login Mode Configuration | US-0.2.2 | 0 |
| US-0.3.1 | Create Core Database Schema | US-0.1.1 | 0 |
| US-0.3.2 | Seed Initial Data | US-0.3.1 | 0 |
| US-1.1.1 | Upload Excel Files UI | US-0.2.5, US-0.3.1 | 1 |
| US-1.1.2 | Parse Excel and Extract Order Data | US-1.1.1 | 1 |
| US-1.1.3 | Store Order with Duplicate Detection | US-1.1.2 | 1 |
| US-1.2.1 | Display Orders List | US-1.1.3 | 1 |
| US-1.2.2 | Display Progress Bar | US-1.2.1 | 1 |
| US-1.2.3 | Priority Color Coding | US-1.2.1 | 1 |
| US-1.2.4 | Filter Orders by Status | US-1.2.1 | 1 |
| US-1.2.5 | Sort Orders | US-1.2.1 | 1 |
| US-1.3.1 | Mark Order as Done | US-1.2.1 | 1 |
| US-1.3.2 | Visual Distinction for Completed Orders | US-1.3.1 | 1 |
| US-1.3.3 | Undo Order Completion | US-1.3.1 | 1 |

---

## Parallelization Opportunities

These stories can be worked on in parallel after their dependencies are met:

| After Completing | Can Start In Parallel |
|------------------|----------------------|
| US-0.1.1 | US-0.1.2, US-0.3.1 |
| US-0.3.1 | US-0.2.1, US-0.3.2 |
| US-0.2.1 | US-0.2.2, US-0.2.5 |
| US-0.2.2 | US-0.2.7, US-0.2.8 |
| US-1.2.1 | US-1.2.2, US-1.2.3, US-1.2.4, US-1.2.5, US-1.3.1 |

---

# Tiếng Việt

---

## Phase 0: Nền tảng

### Epic 0.1: Thiết lập Dự án

---

**US-0.1.1: Khởi tạo Cấu trúc Dự án**

- **Mô tả**: Là developer, tôi cần dự án được khởi tạo với cấu trúc thư mục, dependencies và cấu hình đúng để có thể bắt đầu xây dựng tính năng.

- **Tiêu chí nghiệm thu**:
  - AC1: Next.js 16.0.10 với App Router được tạo
  - AC2: TypeScript được cấu hình với strict mode
  - AC3: Tailwind CSS và shadcn/ui được cài đặt và cấu hình
  - AC4: Prisma được cài đặt và kết nối PostgreSQL
  - AC5: Template biến môi trường (.env.example) tồn tại
  - AC6: Dự án có thể deploy lên Vercel thành công
  - AC7: Cấu trúc thư mục theo hướng dẫn tech stack

- **Bị chặn bởi**: None

---

**US-0.1.2: Cấu hình Môi trường Phát triển**

- **Mô tả**: Là developer, tôi cần linting, formatting và scripts phát triển để có thể phát triển hiệu quả với chất lượng code nhất quán.

- **Tiêu chí nghiệm thu**:
  - AC1: ESLint được cấu hình với rules Next.js recommended
  - AC2: Prettier được cấu hình cho code formatting
  - AC3: `pnpm dev` khởi động development server
  - AC4: `pnpm build` tạo production build
  - AC5: `pnpm lint` chạy kiểm tra linting
  - AC6: Pre-commit hooks validate code (tùy chọn)

- **Bị chặn bởi**: US-0.1.1

---

### Epic 0.2: Hệ thống Xác thực

---

**US-0.2.1: Đăng nhập Super Admin (Seeded)**

- **Mô tả**: Là Super Admin, tôi có thể đăng nhập với username/password được seed sẵn để truy cập và quản lý hệ thống.

- **Tiêu chí nghiệm thu**:
  - AC1: Trang login tồn tại tại `/login`
  - AC2: Credentials Super Admin được seed khi setup database
  - AC3: Đăng nhập thành công chuyển đến dashboard
  - AC4: Credentials sai hiển thị thông báo lỗi
  - AC5: Session được tạo và lưu trữ
  - AC6: Role Super Admin được gán đúng

- **Bị chặn bởi**: US-0.1.1, US-0.3.1

---

**US-0.2.2: Đăng nhập Admin bằng Google OAuth**

- **Mô tả**: Là Admin, tôi có thể đăng nhập bằng tài khoản Google để truy cập hệ thống mà không cần nhớ mật khẩu khác.

- **Tiêu chí nghiệm thu**:
  - AC1: Nút "Đăng nhập với Google" tồn tại trên trang login
  - AC2: Chỉ email Admin được mời mới có thể đăng nhập
  - AC3: Đăng nhập thành công chuyển đến dashboard
  - AC4: User không được mời thấy thông báo "Không được phép"
  - AC5: Role Admin được gán đúng
  - AC6: Session được tạo và lưu trữ

- **Bị chặn bởi**: US-0.2.1, US-0.3.1

---

**US-0.2.5: Đăng nhập Nhân viên bằng Mã Cá nhân**

- **Mô tả**: Là nhân viên, tôi có thể đăng nhập với mã nhân viên cá nhân để truy cập nhanh hệ thống. Mỗi nhân viên có mã riêng do Admin/Super Admin tạo.

- **Tiêu chí nghiệm thu**:
  - AC1: Ô nhập mã tồn tại trên trang login (khi quick login được bật)
  - AC2: Mã đúng cấp quyền truy cập với role STAFF và quyền của user
  - AC3: Mã sai hiển thị thông báo lỗi
  - AC4: Session nhân viên được tạo với thông tin user riêng (không ẩn danh)
  - AC5: Nhân viên có thể truy cập dashboard sau khi đăng nhập
  - AC6: Mã nhân viên phải duy nhất (không trùng lặp)
  - AC7: Đăng nhập tuân theo cấu hình chế độ login hệ thống
  - AC8: Session bao gồm quyền: canUpload, canUpdateStatus

- **Bị chặn bởi**: US-0.2.1, US-0.3.1

- **Ghi chú**: Mã lưu trong User.staffCode. Cần US-0.2.7 để tạo nhân viên và US-0.2.8 để cấu hình chế độ login.

---

**US-0.2.6: Bảo vệ Route theo Role**

- **Mô tả**: Là hệ thống, tôi cần bảo vệ routes dựa trên role của user để user không được phép không thể truy cập khu vực hạn chế.

- **Tiêu chí nghiệm thu**:
  - AC1: User chưa xác thực được chuyển đến login
  - AC2: STAFF có thể truy cập: dashboard, upload (nếu canUpload), mark done (nếu canUpdateStatus)
  - AC3: ADMIN có thể truy cập: dashboard, upload, mark done, settings, quản lý nhân viên
  - AC4: SUPER_ADMIN có thể truy cập: tất cả routes kể cả quản lý user (`/admin/*`)
  - AC5: Truy cập không được phép hiển thị trang "Access Denied"
  - AC6: Kiểm tra quyền dựa trên cả role và permissions (canUpload, canUpdateStatus)

- **Bị chặn bởi**: US-0.2.1, US-0.2.3, US-0.2.4, US-0.2.5

---

**US-0.2.7: Quản lý Nhân viên**

- **Mô tả**: Là Admin hoặc Super Admin, tôi có thể tạo và quản lý nhân viên để kiểm soát ai có quyền truy cập hệ thống và họ có thể làm gì.

- **Tiêu chí nghiệm thu**:
  - AC1: Trang quản lý nhân viên tại `/admin/staff`
  - AC2: Form "Tạo nhân viên" với: tên, email (tùy chọn), quyền
  - AC3: Mã nhân viên tự động tạo (6 ký tự chữ-số duy nhất)
  - AC4: Tính duy nhất của mã được đảm bảo (không trùng)
  - AC5: Có thể đặt quyền: canUpload (upload đơn), canUpdateStatus (đánh dấu hoàn thành)
  - AC6: Có thể xem danh sách tất cả nhân viên với mã và quyền của họ
  - AC7: Có thể chỉnh sửa quyền nhân viên
  - AC8: Có thể vô hiệu hóa/kích hoạt lại nhân viên (thay đổi status)
  - AC9: Có thể tạo lại mã nhân viên nếu cần
  - AC10: Cả Admin và Super Admin đều có thể quản lý nhân viên

- **Bị chặn bởi**: US-0.2.2

- **Ghi chú**: Mã nhân viên được hiển thị cho Admin để chia sẻ với nhân viên. Mã chỉ hiển thị khi tạo mới hoặc tạo lại.

---

**US-0.2.8: Cấu hình Chế độ Đăng nhập**

- **Mô tả**: Là Admin hoặc Super Admin, tôi có thể cấu hình chế độ đăng nhập toàn hệ thống để kiểm soát nhân viên có thể dùng quick code hay phải đăng nhập đầy đủ.

- **Tiêu chí nghiệm thu**:
  - AC1: Cấu hình trong Config: `login_mode` với giá trị: `quick_code`, `full_login`, `both`
  - AC2: Trang cài đặt Admin có toggle cho chế độ login
  - AC3: Khi `quick_code`: Chỉ hiện ô nhập mã cho nhân viên trên trang login
  - AC4: Khi `full_login`: Chỉ hiện email/password cho nhân viên trên trang login
  - AC5: Khi `both`: Nhân viên có thể chọn giữa mã hoặc email/password
  - AC6: Chế độ mặc định là `quick_code`
  - AC7: Thay đổi cấu hình có hiệu lực ngay (không cần restart)
  - AC8: Super Admin và Admin đều có thể thay đổi cấu hình này

- **Bị chặn bởi**: US-0.2.2

- **Ghi chú**: Lưu trong bảng Config. Ảnh hưởng UI trang login động.

---

### Epic 0.3: Schema Cơ sở dữ liệu

---

**US-0.3.1: Tạo Schema Database Cốt lõi**

- **Mô tả**: Là developer, tôi cần schema database được tạo để ứng dụng có thể lưu trữ và truy xuất dữ liệu.

- **Tiêu chí nghiệm thu**:
  - AC1: Model User tồn tại với id, email, name, role, staffCode, timestamps
  - AC2: Model Order tồn tại với jobNumber, registeredDate, requiredDate, priority, status, timestamps
  - AC3: Model Config tồn tại với key-value pairs
  - AC4: Enum Role bao gồm SUPER_ADMIN, ADMIN, STAFF
  - AC5: Enum OrderStatus bao gồm IN_PROGRESS, COMPLETED, OVERDUE
  - AC6: Indexes tồn tại trên các trường thường xuyên query
  - AC7: `pnpm prisma db push` apply schema thành công

- **Bị chặn bởi**: US-0.1.1

---

**US-0.3.2: Seed Dữ liệu Ban đầu**

- **Mô tả**: Là developer, tôi cần dữ liệu ban đầu được seed để hệ thống sẵn sàng sử dụng lần đầu.

- **Tiêu chí nghiệm thu**:
  - AC1: User Super Admin được tạo với password đã hash
  - AC2: Giá trị config mặc định được tạo (warning_threshold: 80, staff_code)
  - AC3: `pnpm prisma db seed` chạy thành công
  - AC4: Seed là idempotent (chạy 2 lần không tạo trùng)

- **Bị chặn bởi**: US-0.3.1

---

## Phase 1: MVP

### Epic 1.1: Upload & Phân tích Đơn hàng

---

**US-1.1.1: Giao diện Upload File Excel**

- **Mô tả**: Là nhân viên, tôi có thể upload một hoặc nhiều file Excel để dữ liệu đơn hàng có thể được import vào hệ thống.

- **Tiêu chí nghiệm thu**:
  - AC1: Khu vực upload tồn tại trên dashboard (kéo thả hoặc click để chọn)
  - AC2: Có thể chọn nhiều file .xls cùng lúc
  - AC3: Chỉ file .xls được chấp nhận (validation)
  - AC4: Tiến trình upload được hiển thị cho mỗi file
  - AC5: Phản hồi thành công/thất bại được hiển thị cho mỗi file
  - AC6: Format file không hợp lệ hiển thị thông báo lỗi rõ ràng
  - AC7: Loading spinner/skeleton hiển thị trong khi xử lý file
  - AC8: Nút upload bị vô hiệu hóa khi đang xử lý để tránh gửi trùng

- **Bị chặn bởi**: US-0.2.3, US-0.3.1

---

**US-1.1.2: Phân tích Excel và Trích xuất Dữ liệu**

- **Mô tả**: Là hệ thống, tôi cần phân tích file Excel đã upload và trích xuất dữ liệu đơn hàng để orders có thể được lưu vào database.

- **Tiêu chí nghiệm thu**:
  - AC1: Job Number được trích xuất từ row 1 (VD: "2601A-03979")
  - AC2: Registered Date được trích xuất và chuyển đổi sang datetime (TZ Việt Nam)
  - AC3: Required Date được trích xuất và chuyển đổi sang datetime
  - AC4: Priority được trích xuất dạng integer
  - AC5: Số serial ngày Excel được chuyển đổi đúng
  - AC6: Lỗi parse được báo cáo với tên file và lý do

- **Bị chặn bởi**: US-1.1.1

---

**US-1.1.3: Lưu Đơn hàng với Phát hiện Trùng lặp**

- **Mô tả**: Là hệ thống, tôi cần lưu dữ liệu đơn hàng đã parse vào database với phát hiện trùng lặp để orders có thể được theo dõi mà không tạo trùng.

- **Tiêu chí nghiệm thu**:
  - AC1: Tính unique của Job Number được kiểm tra trước khi insert (không phân biệt hoa thường)
  - AC2: Đơn trùng được bỏ qua (không tạo)
  - AC3: User được thông báo những file nào bị trùng
  - AC4: Đơn không trùng trong cùng batch vẫn được xử lý
  - AC5: Record Order được tạo với tất cả trường đã trích xuất
  - AC6: Status được đặt là IN_PROGRESS mặc định
  - AC7: Timestamp uploadedAt được ghi nhận
  - AC8: uploadedById reference đến user hiện tại
  - AC9: Database transaction đảm bảo tính toàn vẹn dữ liệu

- **Bị chặn bởi**: US-1.1.2

- **Ghi chú**: Job Number là unique identifier. Liên kết order với user đã upload.

---

### Epic 1.2: Dashboard Đơn hàng

---

**US-1.2.1: Hiển thị Danh sách Đơn hàng**

- **Mô tả**: Là nhân viên, tôi có thể xem danh sách tất cả đơn hàng để theo dõi những gì đang xử lý.

- **Tiêu chí nghiệm thu**:
  - AC1: Orders được hiển thị dạng bảng/danh sách
  - AC2: Mỗi hàng hiển thị: Job Number, ngày đăng ký, ngày yêu cầu, priority, trạng thái
  - AC3: Orders được sắp xếp theo Required Date (sớm nhất trước) mặc định
  - AC4: Trạng thái trống hiển thị thông báo "Không có đơn hàng"
  - AC5: Danh sách load nhanh (< 2 giây cho 100 đơn)
  - AC6: Loading skeleton/spinner hiển thị khi đang tải dữ liệu
  - AC7: Hiển thị lỗi nếu tải dữ liệu thất bại với tùy chọn thử lại

- **Bị chặn bởi**: US-1.1.3

---

**US-1.2.2: Hiển thị Progress Bar**

- **Mô tả**: Là nhân viên, tôi có thể xem progress bar cho mỗi đơn hiển thị thời gian đã qua để biết mức độ khẩn cấp của mỗi đơn.

- **Tiêu chí nghiệm thu**:
  - AC1: Progress bar hiển thị % thời gian đã qua (Registered → Required)
  - AC2: Progress bar có mã màu:
    - 🟢 Xanh: 0-60%
    - 🟡 Vàng: 61-80%
    - 🟠 Cam: 81-95%
    - 🔴 Đỏ: >95% hoặc quá hạn
  - AC3: Số % được hiển thị cạnh bar
  - AC4: Đơn quá hạn hiển thị 100%+ với chỉ báo đỏ
  - AC5: Tiến độ cập nhật khi refresh trang

- **Bị chặn bởi**: US-1.2.1

---

**US-1.2.3: Mã màu theo Priority**

- **Mô tả**: Là nhân viên, tôi có thể xem đơn hàng được mã hóa màu theo priority để nhanh chóng nhận diện đơn khẩn cấp.

- **Tiêu chí nghiệm thu**:
  - AC1: Badge/chỉ báo priority hiển thị cho mỗi đơn
  - AC2: Mã màu dựa trên giá trị priority:
    - Priority 1-2: 🔴 Đỏ (Critical)
    - Priority 3-4: 🟠 Cam (High)
    - Priority 5-6: 🟡 Vàng (Medium)
    - Priority 7+: 🟢 Xanh (Low)
  - AC3: Priority hiển thị trong list và detail views

- **Bị chặn bởi**: US-1.2.1

---

**US-1.2.4: Lọc Đơn theo Trạng thái**

- **Mô tả**: Là nhân viên, tôi có thể lọc đơn theo trạng thái để tập trung vào đơn cần chú ý.

- **Tiêu chí nghiệm thu**:
  - AC1: Nút/tab lọc tồn tại: Tất cả, Đang xử lý, Hoàn thành, Quá hạn
  - AC2: Click lọc chỉ hiển thị đơn phù hợp
  - AC3: Số lượng đơn được hiển thị cho mỗi bộ lọc
  - AC4: Bộ lọc mặc định là "Đang xử lý"
  - AC5: Trạng thái lọc được giữ trong session

- **Bị chặn bởi**: US-1.2.1

---

**US-1.2.5: Sắp xếp Đơn hàng**

- **Mô tả**: Là nhân viên, tôi có thể sắp xếp đơn theo các cột khác nhau để tổ chức view của mình.

- **Tiêu chí nghiệm thu**:
  - AC1: Cột có thể sắp xếp: Required Date, Priority, Registered Date, Job Number
  - AC2: Click header cột để sắp xếp
  - AC3: Toggle giữa tăng dần/giảm dần
  - AC4: Chỉ báo sắp xếp hiển thị hướng hiện tại
  - AC5: Sắp xếp mặc định: Required Date tăng dần

- **Bị chặn bởi**: US-1.2.1

---

### Epic 1.3: Hoàn thành Đơn hàng

---

**US-1.3.1: Đánh dấu Đơn Hoàn thành**

- **Mô tả**: Là nhân viên, tôi có thể đánh dấu đơn là Hoàn thành để công việc đã xong được theo dõi.

- **Tiêu chí nghiệm thu**:
  - AC1: Nút "Đánh dấu Hoàn thành" tồn tại cho mỗi đơn đang xử lý
  - AC2: Click nút thay đổi trạng thái đơn sang COMPLETED
  - AC3: Timestamp completedAt được ghi nhận
  - AC4: Phản hồi trực quan xác nhận hành động (toast notification)
  - AC5: Đơn chuyển sang bộ lọc Hoàn thành
  - AC6: Nút bị vô hiệu hóa cho đơn đã hoàn thành

- **Bị chặn bởi**: US-1.2.1

---

**US-1.3.2: Phân biệt Trực quan Đơn Hoàn thành**

- **Mô tả**: Là nhân viên, tôi có thể phân biệt trực quan đơn đã hoàn thành để biết gì đã xong.

- **Tiêu chí nghiệm thu**:
  - AC1: Đơn hoàn thành có style khác (xám, gạch ngang, hoặc badge)
  - AC2: Progress bar hiển thị "Hoàn thành" thay vì %
  - AC3: Timestamp hoàn thành được hiển thị
  - AC4: Nút "Đánh dấu Hoàn thành" được thay bằng chỉ báo "Đã hoàn thành"

- **Bị chặn bởi**: US-1.3.1

---

**US-1.3.3: Hoàn tác Hoàn thành Đơn**

- **Mô tả**: Là nhân viên, tôi có thể hoàn tác việc đánh dấu đơn Hoàn thành (trong 5 phút) để sửa sai lầm.

- **Tiêu chí nghiệm thu**:
  - AC1: Tùy chọn "Hoàn tác" xuất hiện sau khi đánh dấu hoàn thành (toast hoặc nút)
  - AC2: Hoàn tác khả dụng trong 5 phút sau khi hoàn thành
  - AC3: Click hoàn tác đưa trạng thái về IN_PROGRESS
  - AC4: completedAt được xóa
  - AC5: Sau 5 phút, tùy chọn hoàn tác không còn khả dụng

- **Bị chặn bởi**: US-1.3.1

---

**Next Step**: `/roadmap-to-user-stories-review` or `/product-checklist`
