# User Stories: SGS CS Order Tracker

<!-- Generated: 2026-02-05 | Product Slug: sgs-cs-helper -->

---

## User Stories Overview / Tổng quan User Stories

| Field                  | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| **Product Name**       | SGS CS Order Tracker                                                   |
| **Product Slug**       | `sgs-cs-helper`                                                        |
| **Scope Covered**      | Phase 0 (Foundation) + Phase 1 (MVP) + Phase 2 (Reporting & Analytics) |
| **Total User Stories** | 25                                                                     |

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

**US-1.1.3: Store Order with Upsert by Job Number**

- **Description**: As a system, I need to store parsed order data in the database with upsert logic so that orders are created or updated based on Job Number.

- **Acceptance Criteria**:
  - AC1: Job Number is used as unique identifier (case-insensitive)
  - AC2: If Job Number exists: UPDATE order with new data (if data changed)
  - AC3: If Job Number not exists: CREATE new order
  - AC4: User is notified: X orders created, Y orders updated, Z unchanged
  - AC5: Only changed fields are updated (compare before update)
  - AC6: Status is NOT overwritten if order already exists (preserve current status)
  - AC7: uploadedAt timestamp is updated on both create and update
  - AC8: uploadedById references the user who uploaded
  - AC9: Database transaction ensures data integrity
  - AC10: SSE broadcasts bulk update to connected clients after successful upsert

- **Blocked By**: US-1.1.2

- **Notes**:
  - Use Prisma upsert with jobNumber as unique key
  - Preserve existing status to avoid overwriting COMPLETED orders back to IN_PROGRESS
  - Show clear summary: "Created: 5, Updated: 3, Unchanged: 2"

- **Technical Notes**:
  - **Upsert Pattern**:
    ```typescript
    await prisma.order.upsert({
      where: { jobNumber: order.jobNumber },
      create: { ...orderData, status: "IN_PROGRESS" },
      update: {
        ...orderData,
        // Do NOT update status - preserve existing
      },
    });
    ```
  - **SSE Broadcast**: After batch upsert, call `broadcastBulkUpdate(orders)` from `@/lib/sse/broadcaster`

---

**US-1.1.4: Batch Upload Processing — Client-Side Chunking**

- **Description**: As a Staff member, I want uploaded files to be processed in batches of maximum 5 files at a time so that large uploads don't cause request timeouts.

- **Acceptance Criteria**:
  - AC1: Client-side batching splits files into chunks of max 5 files each
  - AC2: Each batch is sent as a separate request to the server
  - AC3: Progress shows current batch (e.g., "Processing batch 2/4...")
  - AC4: If one batch fails, error is shown but remaining batches continue
  - AC5: Final summary aggregates results from all batches (total created, updated, unchanged)
  - AC6: UI remains responsive during batch processing (no blocking)

- **Blocked By**: US-1.1.3

- **Notes**: Purely client-side change to UploadArea component. No API changes needed.

---

**US-1.1.5: Parse Test Request Samples & Display Total Samples**

- **Description**: As a Staff member, I want the system to parse "Phiếu yêu cầu test" data from Excel (row 10+) and display the total sample count in the Orders table so I can see the scope of each order.

- **Acceptance Criteria**:
  - AC1: Parse Excel rows from row 10 onwards with columns: Section (A), Sample ID (B), Description (C), Analyte (D), Method (E), LOD (F), LOQ (G), Unit (H), Required Date (I)
  - AC2: Empty rows are skipped (no data in key columns)
  - AC3: Store test samples in new `OrderSample` table linked to Order
  - AC4: Calculate total samples from Sample ID format `XXXX.NNN` — largest NNN value = total samples
  - AC5: Display "Total Samples" column in Orders table (In Progress tab)
  - AC6: Display "Total Samples" column in Completed Orders table (Completed tab)
  - AC7: Upsert logic: samples are replaced on re-upload of same order
  - AC8: If no samples found (row 10+ empty), total samples = 0

- **Blocked By**: US-1.1.3

- **Notes**:
  - Sample ID format: `2602A-00931.001` → `.001` means sample 1, max = total samples
  - Requires schema update: new `OrderSample` model
  - Requires parsing enhancement in Excel processor

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

**US-1.2.6: Show Registered By, add filter/sort, and display Priority ETA**

- **Description**: As a Staff member, I want the orders list to show who registered each order, be able to filter and sort by `Registered By` and `Required Date`, and see an estimated time-to-complete per `Priority` so that I can triage and assign work more effectively.

- **Acceptance Criteria**:
  - AC1: Orders table includes a `Registered By` column showing uploader name or identifier
  - AC2: UI provides filters for `Registered By` and `Required Date` (date range)
  - AC3: UI allows sorting by `Registered By` and `Required Date` (asc/desc)
  - AC4: UI provides a search box to search orders by `Job Number` (supports exact and partial matches)
  - AC5: (shifted) `Priority` column displays both priority level and an estimated time-to-complete (ETA) for that priority. ETA values are read from a `priority_to_eta` config/mapping; if missing, sensible hardcoded defaults are used (e.g., Priority 1 -> 2h).
  - AC4: `Priority` column displays both priority level and an estimated time-to-complete (ETA) for that priority. ETA values are read from a `priority_to_eta` config/mapping; if missing, sensible hardcoded defaults are used (e.g., Priority 1 -> 2h).
  - AC5: ETA values are configurable via a system config or mapping and documented in the settings help
  - AC6: Filtering and sorting work together with existing status/priority filters (combinable)
  - AC7: Empty state and loading states handled correctly when filters return no results
  - AC8: Feature respects permissions: only users with view permissions see `Registered By` (role-based visibility)

- **Blocked By**: US-1.1.3, US-1.2.1

- **Notes**: ETA per priority should be stored or derived from a `priority_to_eta` config (e.g., Priority 1 -> 2h, Priority 2 -> 8h)

---

**US-1.2.7: Multi-Select Registered By Filter with Dedicated Lookup Table**

- **Description**: As a Staff member / Admin, I need the "Registered By" filter on both In Progress and Completed tabs to support multi-select, with a complete data source backed by a dedicated `Registrant` lookup table (populated during Excel upload and seeded from existing orders), so I can filter orders by multiple registrants at once and never miss registrants who only appear on other pages.

- **Acceptance Criteria**:
  - AC1: New Prisma model `Registrant` with `name String @unique` — serves as lookup table for all known registrant names
  - AC2: During Excel upload (upsert flow), extract unique `registeredBy` values and insert into `Registrant` table if not already present
  - AC3: Seed/migration script to populate `Registrant` from existing `Order.registeredBy` via `SELECT DISTINCT registeredBy FROM "Order" WHERE registeredBy IS NOT NULL`
  - AC4: API endpoint or Server Action to fetch all registrants from the `Registrant` table (replaces client-side `Set` extraction)
  - AC5: "Registered By" filter on **In Progress** tab changes from single-select to multi-select (select multiple names)
  - AC6: "Registered By" filter on **Completed** tab changes from single-select to multi-select (same component)
  - AC7: Filter logic: when multiple registrants selected, show orders matching ANY of the selected registrants (`OR` logic)
  - AC8: Multi-select UI shows selected count badge (e.g., "2 selected") and allows clearing all or individual selections
  - AC9: `OrderFilters` type updated: `registeredBy: string` → `registeredBy: string[]`
  - AC10: Completed tab server-side query supports `registeredBy` as array (Prisma `in` clause)
  - AC11: In Progress tab client-side filter supports `registeredBy` as array

- **Blocked By**: US-1.2.6

- **Notes**:
  - Current limitation: In Progress tab extracts registrants from loaded orders via `Set`; Completed tab extracts from current page only (max 50)
  - `Registrant` table ensures complete data regardless of pagination
  - Multi-select component: use shadcn `Popover` + `Command` (combobox) pattern or similar
  - Schema: `model Registrant { id String @id @default(cuid()); name String @unique; createdAt DateTime @default(now()) }`

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

- **Technical Notes (from US-1.2.1 implementation)**:
  - **Realtime Updates**: Page `/orders` uses SSE (Server-Sent Events) for realtime status sync
  - **SSE Endpoint**: `/api/orders/sse` - clients subscribe to receive order updates
  - **Broadcaster**: When updating order status, call `broadcastOrderUpdate(order)` from `@/lib/sse/broadcaster`
  - **Client Progress**: Progress bar updates every 60s client-side without server calls
  - **Implementation Pattern**:

    ```typescript
    // In server action after updating order status:
    import { broadcastOrderUpdate } from "@/lib/sse/broadcaster";

    // After prisma update
    const updatedOrder = await prisma.order.update({...});
    broadcastOrderUpdate(updatedOrder); // Push to all connected clients
    ```

---

**US-1.3.2: Completed Orders Tab & Completed-Tab UI**

- **Description**: Completed orders are shown in a separate "Completed" tab. As a Staff member, I need a dedicated Completed tab UI where the progress bar is not shown, the primary action is an undo ("Hoàn Tác" / "Undo") to revert completion, and I can search and filter completed orders (search by Job Number, filter by Registered By and Required Date) so that I can find and, if permitted, revert completed items.

- **Acceptance Criteria**:
  - AC1: There is a separate `Completed` tab on the `/orders` page that lists only orders with status `COMPLETED`.
  - AC2: Rows in Completed tab show: Job Number, Registered Date, Required Date, Priority, Registered By, completedAt timestamp, and a Completed indicator/badge.
  - AC3: Progress bar is not shown in the Completed tab (not required for completed items).
  - AC4: The primary action for each Completed row is `Undo` (label: "Hoàn Tác" / "Undo"). Clicking `Undo` opens a confirmation modal before reverting status to `IN_PROGRESS`.
  - AC5: Undo action is permission-gated: only users with `canUpdateStatus` (or ADMIN/SUPER_ADMIN) can see and perform `Undo`; UI hides/greys out the action for others.
  - AC6: Completed tab provides a search box for `Job Number` supporting partial and exact matches.
  - AC7: Completed tab provides filters for `Registered By` (select or autocomplete) and `Required Date` (date range), and these filters can be combined with search.
  - AC8: Sorting is available on `completedAt`, `Registered Date`, and `Required Date` (asc/desc).
  - AC9: After successful `Undo`, the order moves back to the In Progress view and SSE/broadcast (or refetch) updates connected clients.
  - AC10: Empty state and loading states handled appropriately for Completed tab.
  - AC11: All UI strings localized (English + Vietnamese) and unit tests exist for Completed tab behaviors (search/filter/undo permission gating).

- **Blocked By**: US-1.3.1 (Mark Done) and US-1.2.1 (Orders list)

- **Notes**: This differs from a simple visual change — Completed items live in their own tab with search/filter/undo semantics. Consider adding pagination and server-side filtering for performance if Completed grows large.

---

**US-1.3.3: Undo Order Completion**

- **Description**: As a Staff member, I can undo marking an order as Done so that I can correct mistakes.

- **Acceptance Criteria**:
  - AC1: Staff with `canUpdateStatus` permission can revert COMPLETED → IN_PROGRESS
  - AC2: "Revert to In Progress" button available in Completed tab
  - AC3: Clicking revert changes status to IN_PROGRESS
  - AC4: completedAt is cleared
  - AC5: Order moves back to In Progress tab
  - AC6: SSE broadcasts update to all connected clients

- **Blocked By**: US-1.3.1

- **Notes**:
  - No time window limit - staff can revert anytime if they have permission
  - Update available from Completed tab on /orders page

- **Technical Notes (from US-1.2.1 implementation)**:
  - **Completed Tab**: Sort by Received Date (newest first)
  - **Permission Check**: Verify `session.user.canUpdateStatus === true` before allowing revert
  - **SSE Broadcast**: Call `broadcastOrderUpdate(order)` after status change
  - **Implementation Pattern**:
    ```typescript
    // Server action to revert status
    if (!session?.user?.canUpdateStatus) {
      throw new Error("Permission denied");
    }
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "IN_PROGRESS", completedAt: null },
    });
    broadcastOrderUpdate(order);
    ```

---

**US-1.3.4: Scan QR/Barcode to Mark Order Complete**

- **Description**: As a Staff member, I can scan a QR code or barcode on a physical job document to quickly find the order by Job Number and mark it as complete, so that I don't need to manually search the list.

- **Acceptance Criteria**:
  - AC1: A "Scan" button/icon exists on the orders page (visible to users with `canUpdateStatus`)
  - AC2: Clicking "Scan" opens a camera-based QR/barcode scanner using `@yudiel/react-qr-scanner`
  - AC3: Scanner uses rear camera (`facingMode: 'environment'`) by default on mobile
  - AC4: When a QR/barcode is detected, the decoded text is used to search for a matching Job Number (case-insensitive)
  - AC5: If Job Number exists AND status is `IN_PROGRESS`: show an alert/dialog with order details and a "Mark Complete" button
  - AC6: If Job Number exists AND status is `COMPLETED`: show info message "Order already completed"
  - AC7: If Job Number not found: show error message "Order not found"
  - AC8: After successful mark complete, scanner stays open for continuous scanning (batch workflow)
  - AC9: Scanner can be closed/dismissed at any time
  - AC10: Works on mobile browsers (iOS Safari 14.5+, Android Chrome 88+) over HTTPS
  - AC11: Permission-gated: only users with `canUpdateStatus` can see and use the scan feature

- **Blocked By**: US-1.3.1

- **Notes**:
  - Library: `@yudiel/react-qr-scanner` (v2.5.1) — React-first, TypeScript, actively maintained
  - Next.js SSR: Use `dynamic(() => import(...), { ssr: false })` for client-only rendering
  - Requires HTTPS (Vercel deploy satisfies this)
  - Supports QR codes and 1D barcodes (Code 128, EAN-13, etc.)
  - Consider adding haptic/sound feedback on successful scan

---

**US-1.3.5: Completion Tracking — Log Completed By & Show Actual Duration**

- **Description**: As a Staff member / Admin, I need the system to record who completed each order (for staff performance reporting) and display the actual processing duration in the Completed tab (time from `receivedDate` to `completedAt`), including overdue indication showing how much time exceeded the deadline.

- **Acceptance Criteria**:
  - AC1: When marking an order as complete, the `completedById` (current user ID) is recorded in the Order record
  - AC2: Schema change: add `completedById` (optional FK → User) and `completedBy` relation to Order model
  - AC3: Completed tab displays a "Completed By" column showing the name of the user who completed the order
  - AC4: Completed tab displays an "Actual Duration" column showing elapsed time from `receivedDate` to `completedAt` (e.g., "2d 5h", "18h 30m")
  - AC5: If the order was completed after `requiredDate` (overdue): display overdue indicator with how long past deadline (e.g., "⚠️ Overdue 1d 3h" in red)
  - AC6: If the order was completed before or on `requiredDate`: display on-time indicator (e.g., "✅ On time" or green styling)
  - AC7: Actual Duration calculation: `completedAt - receivedDate` (consistent with existing progress bar logic which uses `receivedDate`)
  - AC8: Overdue calculation: `completedAt - requiredDate` (only when `completedAt > requiredDate`)
  - AC9: Undo completion (`US-1.3.3`) must also clear `completedById` (set to null)
  - AC10: "Completed By" is sortable and filterable in the Completed tab
  - AC11: QR scan completion (`US-1.3.4`) must also log `completedById`

- **Blocked By**: US-1.3.1, US-1.3.2

- **Notes**:
  - Schema: `completedById String?` + `completedBy User? @relation("CompletedBy", ...)` on Order model
  - Actual Duration uses `receivedDate` (sample received time) as start, matching existing progress bar
  - Overdue uses `requiredDate` as deadline reference
  - Supports future staff performance reporting (filter/group by `completedBy`)

---

**US-1.3.6: Barcode Scanner Device Support (USB/Bluetooth Keyboard Input)**

- **Description**: As a Staff member, I can use a USB or Bluetooth barcode scanner device connected to a desktop/laptop computer to scan job documents and mark orders as complete, so that I can work faster at a workstation without needing a mobile phone camera.

- **Acceptance Criteria**:
  - AC1: On the orders page, a global keyboard listener detects barcode scanner input (rapid keystrokes < 50ms apart, ending with Enter)
  - AC2: Scanner input is distinguished from normal typing by keystroke speed threshold
  - AC3: When a valid barcode string is captured, it triggers the same lookup flow as camera scan (reuse `GET /api/orders/lookup`)
  - AC4: If order found + `IN_PROGRESS`: show ConfirmDialog with order details and "Mark Complete" button (reuse existing confirmation flow)
  - AC5: If order found + `COMPLETED`: show info message "Order already completed"
  - AC6: If order not found: show error message "Order not found"
  - AC7: After successful mark complete, listener remains active for continuous scanning (batch workflow)
  - AC8: Keyboard listener only active when scanner overlay is NOT open (no conflict with camera scan)
  - AC9: Permission-gated: only active for users with `canUpdateStatus`
  - AC10: Works on desktop browsers (Chrome, Edge, Firefox) — no HTTPS requirement for USB input
  - AC11: No visible UI change required — scanner input works passively on the orders page

- **Blocked By**: US-1.3.4

- **Notes**:
  - USB/Bluetooth barcode scanners act as HID keyboard devices — they "type" the barcode string and press Enter
  - Reuses `GET /api/orders/lookup` API route and `POST /api/orders/[id]/mark-done` from US-1.3.4
  - Key implementation: `useEffect` with `keydown` listener, buffer keystrokes, detect rapid input pattern
  - Threshold: ~50ms between keystrokes suggests scanner (human typing is typically >100ms)
  - Must not interfere with other input fields (e.g., search/filter inputs) — disable when an input element is focused
  - Consider debounce/cooldown after successful scan to prevent double-processing

---

**US-1.3.7: Completed Tab UI Polish — Email Display & Early Completion Indicator**

- **Description**: As a Staff member / Admin, I want the Completed tab to (1) hide empty parentheses `()` in the "Completed By" column when a user has no email, and (2) show how much earlier an order was completed relative to its priority duration in the "Actual Duration" column (mirroring the overdue sub-line), so the display is clean and informative.

- **Acceptance Criteria**:
  - AC1: "Completed By" column — if `completedBy.email` is null or empty string, display only the user's name without trailing `()`
  - AC2: "Actual Duration" column — if order was completed **before** the priority-based duration threshold, show a sub-line: `"Early: {time}"` in green (e.g., "Early: 30m"), mirroring the overdue sub-line format
  - AC3: Early duration calculation: `priorityDurationMs - actualMs` (only when `actualMs < priorityDurationMs`)
  - AC4: Color scheme unchanged: green for on-time/early, purple for overdue
  - AC5: No API changes — UI-only fix in `completed-orders-table.tsx`

- **Blocked By**: US-1.3.5

- **Notes**:
  - Staff users created via staff code login may not have email addresses
  - Early indicator helps managers quickly see high-performing completions
  - Uses same `formatDuration()` utility and `getPriorityDuration()` logic as overdue calculation

---

---

## Phase 2: Reporting & Analytics

### Epic 2.1: Performance Dashboard

---

**US-2.1.1: Performance Dashboard with Chart Visualization**

- **Description**: As an Admin / Super Admin, I need the main dashboard to display performance charts and KPI metrics showing completion data by team, group, or individual user over configurable time ranges, so I can monitor team productivity at a glance.

- **Acceptance Criteria**:
  - AC1: Dashboard page (`/`) shows performance section for Admin and Super Admin roles (Staff sees current view unchanged)
  - AC2: Scope selector: "All Team", "Group" (select group), "Individual" (select user) — defaults to "All Team"
  - AC3: Time range filter with presets: Today, Last 7 Days, This Month, Last Month, Last 3 Months, Custom date range picker
  - AC4: KPI summary cards: Total Completed, On-Time Rate (%), Average Processing Time, Overdue Count
  - AC5: Bar chart: completed orders per user (horizontal bar, sorted descending) for the selected scope/range
  - AC6: Pie/donut chart: On-Time vs Overdue ratio
  - AC7: Line chart (optional): completion trend over time for selected range (daily/weekly granularity)
  - AC8: Table view below charts showing per-user breakdown: User Name, Completed Count, On-Time %, Avg Duration, Overdue Count
  - AC9: Chart library: `recharts` (React-native, lightweight, composable, SSR-friendly with `dynamic()`)
  - AC10: Data aggregation computed server-side (Server Action) — client receives pre-computed metrics
  - AC11: Empty state shown when no completed orders exist in selected range
  - AC12: Responsive layout — charts stack vertically on mobile, grid on desktop

- **Blocked By**: US-1.3.5

- **Notes**:
  - Charts rendered on existing dashboard page (`(dashboard)/page.tsx`), not a separate route
  - Only Admin/Super Admin see the performance section; Staff view remains unchanged
  - Library: `recharts` — React-first, composable, lightweight (~45kB gzipped)
  - Next.js SSR: Use `dynamic(() => import(...), { ssr: false })` for chart components
  - Server Action returns pre-aggregated data to minimize client-side computation

---

**US-2.1.2: Export Completed Orders to Excel**

- **Description**: As an Admin / Super Admin, I need to export the filtered completed orders list from the Completed tab to an Excel file, for record-keeping and offline reporting.

- **Acceptance Criteria**:
  - AC1: "Export Excel" button on Completed Orders tab, visible only to Admin and Super Admin
  - AC2: Clicking Export fetches all completed orders matching current search/filter/sort in batches
  - AC3: Excel file is generated entirely on the client side using ExcelJS library
  - AC4: Downloaded file is valid `.xlsx` with proper column headers and formatted data
  - AC5: Excel columns: Job Number, Registered By, Registered Date, Received Date, Required Date, Priority, Sample Count, Completed At, Completed By
  - AC6: Export respects all current filters: search, registeredBy, date range, sort
  - AC7: File naming: `completed-orders-YYYY-MM-DD.xlsx`
  - AC8: Progress indicator shows during batch fetching
  - AC9: Export button disabled while export is in progress
  - AC10: STAFF users cannot see or use the export button

- **Blocked By**: US-2.1.1

- **Notes**:
  - Excel library: `exceljs` — client-side generation with `writeBuffer()`
  - Client fetches data in batches via existing `/api/orders/completed` API until all data collected, then creates file and triggers download
  - No server-side file generation — all processing happens in the browser
  - Performance summary report export deferred to future US

---

---

## User Story Summary Table

| ID       | Title                                                         | Blocked By           | Phase |
| -------- | ------------------------------------------------------------- | -------------------- | ----- |
| US-0.1.1 | Initialize Project Structure                                  | None                 | 0     |
| US-0.1.2 | Configure Development Environment                             | US-0.1.1             | 0     |
| US-0.2.1 | Super Admin Seeded Login                                      | US-0.1.1, US-0.3.1   | 0     |
| US-0.2.2 | Admin Google OAuth Login                                      | US-0.2.1, US-0.3.1   | 0     |
| US-0.2.5 | Staff Code Login (Per-User)                                   | US-0.2.1, US-0.3.1   | 0     |
| US-0.2.6 | Role-Based Route Protection                                   | US-0.2.1, US-0.2.3-5 | 0     |
| US-0.2.7 | Staff User Management                                         | US-0.2.2             | 0     |
| US-0.2.8 | Login Mode Configuration                                      | US-0.2.2             | 0     |
| US-0.3.1 | Create Core Database Schema                                   | US-0.1.1             | 0     |
| US-0.3.2 | Seed Initial Data                                             | US-0.3.1             | 0     |
| US-1.1.1 | Upload Excel Files UI                                         | US-0.2.5, US-0.3.1   | 1     |
| US-1.1.2 | Parse Excel and Extract Order Data                            | US-1.1.1             | 1     |
| US-1.1.3 | Store Order with Upsert by Job Number                         | US-1.1.2             | 1     |
| US-1.2.1 | Display Orders List                                           | US-1.1.3             | 1     |
| US-1.2.2 | Display Progress Bar                                          | US-1.2.1             | 1     |
| US-1.2.3 | Priority Color Coding                                         | US-1.2.1             | 1     |
| US-1.2.4 | Filter Orders by Status                                       | US-1.2.1             | 1     |
| US-1.2.5 | Sort Orders                                                   | US-1.2.1             | 1     |
| US-1.2.7 | Multi-Select Registered By Filter with Dedicated Lookup Table | US-1.2.6             | 1     |
| US-1.3.1 | Mark Order as Done                                            | US-1.2.1             | 1     |
| US-1.3.2 | Visual Distinction for Completed Orders                       | US-1.3.1             | 1     |
| US-1.3.3 | Undo Order Completion                                         | US-1.3.1             | 1     |
| US-1.3.4 | Scan QR/Barcode to Mark Order Complete                        | US-1.3.1             | 1     |
| US-1.3.5 | Completion Tracking — Log Completed By & Actual Duration      | US-1.3.1, US-1.3.2   | 1     |
| US-1.3.6 | Barcode Scanner Device Support (USB/Bluetooth)                | US-1.3.4             | 1     |
| US-2.1.1 | Performance Dashboard with Chart Visualization                | US-1.3.5             | 2     |
| US-2.1.2 | Export Completed Orders to Excel                              | US-2.1.1             | 2     |

---

## Parallelization Opportunities

These stories can be worked on in parallel after their dependencies are met:

| After Completing | Can Start In Parallel                            |
| ---------------- | ------------------------------------------------ |
| US-0.1.1         | US-0.1.2, US-0.3.1                               |
| US-0.3.1         | US-0.2.1, US-0.3.2                               |
| US-0.2.1         | US-0.2.2, US-0.2.5                               |
| US-0.2.2         | US-0.2.7, US-0.2.8                               |
| US-1.2.1         | US-1.2.2, US-1.2.3, US-1.2.4, US-1.2.5, US-1.3.1 |
| US-1.3.5         | US-2.1.1                                         |

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

**US-1.1.4: Xử lý Upload theo Batch — Chia chunk phía Client**

- **Mô tả**: Là Nhân viên, tôi muốn các file upload được xử lý theo batch tối đa 5 file mỗi lần để upload nhiều file không bị timeout.

- **Tiêu chí nghiệm thu**:
  - AC1: Client-side batching chia file thành các chunk tối đa 5 file mỗi chunk
  - AC2: Mỗi batch được gửi như một request riêng đến server
  - AC3: Progress hiển thị batch hiện tại (vd: "Đang xử lý batch 2/4...")
  - AC4: Nếu một batch lỗi, hiển thị lỗi nhưng các batch còn lại vẫn tiếp tục
  - AC5: Tổng kết cuối cùng gom kết quả từ tất cả batch (tổng created, updated, unchanged)
  - AC6: UI vẫn responsive trong khi xử lý batch (không blocking)

- **Bị chặn bởi**: US-1.1.3

- **Ghi chú**: Thay đổi hoàn toàn phía client ở component UploadArea. Không cần thay đổi API.

---

**US-1.1.5: Phân tích Phiếu Yêu cầu Test & Hiển thị Tổng Sample**

- **Mô tả**: Là Nhân viên, tôi muốn hệ thống phân tích dữ liệu "Phiếu yêu cầu test" từ Excel (dòng 10 trở đi) và hiển thị tổng số sample trong bảng Orders để tôi thấy phạm vi của mỗi đơn.

- **Tiêu chí nghiệm thu**:
  - AC1: Phân tích Excel từ dòng 10 trở đi với các cột: Section (A), Sample ID (B), Description (C), Analyte (D), Method (E), LOD (F), LOQ (G), Unit (H), Required Date (I)
  - AC2: Bỏ qua các dòng trống (không có dữ liệu ở các cột chính)
  - AC3: Lưu test samples vào bảng `OrderSample` mới liên kết với Order
  - AC4: Tính tổng samples từ định dạng Sample ID `XXXX.NNN` — giá trị NNN lớn nhất = tổng samples
  - AC5: Hiển thị cột "Tổng Samples" trong bảng Orders (tab Đang xử lý)
  - AC6: Hiển thị cột "Tổng Samples" trong bảng Completed Orders (tab Hoàn thành)
  - AC7: Logic upsert: samples được thay thế khi upload lại cùng order
  - AC8: Nếu không tìm thấy samples (dòng 10+ trống), tổng samples = 0

- **Bị chặn bởi**: US-1.1.3

- **Ghi chú**:
  - Định dạng Sample ID: `2602A-00931.001` → `.001` nghĩa là sample 1, max = tổng samples
  - Cần cập nhật schema: model `OrderSample` mới
  - Cần nâng cấp parser Excel

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

**US-1.2.6: Hiển thị Registered By, thêm lọc/sắp xếp, và hiển thị ETA theo Priority**

- **Mô tả**: Là nhân viên, tôi muốn danh sách đơn hiển thị người đăng ký (Registered By), có thể lọc và sắp xếp theo `Registered By` và `Required Date`, và xem ước lượng thời gian hoàn thành theo `Priority` để phân loại và phân công công việc hiệu quả hơn.

- **Tiêu chí nghiệm thu**:
  - AC1: Bảng đơn có cột `Registered By` hiển thị tên hoặc định danh người upload
  - AC2: Giao diện cung cấp bộ lọc cho `Registered By` và `Required Date` (phạm vi ngày)
  - AC3: Giao diện cho phép sắp xếp theo `Registered By` và `Required Date` (tăng/d giảm)
  - AC4: Giao diện cung cấp ô tìm kiếm để tìm đơn theo `Job Number` (hỗ trợ tìm khớp chính xác và khớp một phần)
  - AC5: Cột `Priority` hiển thị cả mức độ ưu tiên và ước lượng thời gian hoàn thành (ETA) cho mức ưu tiên đó. Giá trị ETA được lấy từ cấu hình/mapping `priority_to_eta`; nếu không có, sử dụng mặc định hardcoded hợp lý (ví dụ: Priority 1 -> 2h).
  - AC5: Giá trị ETA có thể cấu hình qua cấu hình hệ thống hoặc mapping và được ghi trong phần trợ giúp cài đặt
  - AC6: Lọc và sắp xếp kết hợp được với các bộ lọc trạng thái/priority hiện có
  - AC7: Xử lý trạng thái rỗng và loading khi bộ lọc không trả về kết quả
  - AC8: Tính năng tuân thủ phân quyền: chỉ người có quyền xem mới thấy `Registered By`

- **Bị chặn bởi**: US-1.1.3, US-1.2.1

- **Ghi chú**: ETA theo priority nên được lưu hoặc suy ra từ cấu hình `priority_to_eta` (ví dụ: Priority 1 -> 2h, Priority 2 -> 8h)

---

**US-1.2.7: Bộ lọc Registered By Multi-Select với Bảng Tra cứu Riêng**

- **Mô tả**: Là nhân viên / Admin, tôi cần bộ lọc "Registered By" trên cả tab In Progress và Completed hỗ trợ chọn nhiều, với nguồn dữ liệu đầy đủ từ bảng tra cứu `Registrant` riêng (được tạo khi upload Excel và seed từ dữ liệu Order hiện có), để lọc đơn theo nhiều người đăng ký cùng lúc và không bỏ sót registrant chỉ xuất hiện ở trang khác.

- **Tiêu chí nghiệm thu**:
  - AC1: Model Prisma mới `Registrant` với `name String @unique` — bảng tra cứu tất cả tên registrant
  - AC2: Khi upload Excel (upsert), trích xuất `registeredBy` duy nhất và thêm vào bảng `Registrant` nếu chưa có
  - AC3: Script seed/migration để tạo dữ liệu `Registrant` từ Order hiện có qua `SELECT DISTINCT`
  - AC4: API endpoint hoặc Server Action lấy tất cả registrant từ bảng `Registrant`
  - AC5: Bộ lọc "Registered By" trên tab **In Progress** đổi từ single-select sang multi-select
  - AC6: Bộ lọc "Registered By" trên tab **Completed** đổi từ single-select sang multi-select (cùng component)
  - AC7: Logic lọc: khi chọn nhiều registrant, hiện đơn khớp BẤT KỲ registrant nào (logic `OR`)
  - AC8: UI multi-select hiện badge số đã chọn (VD: "2 đã chọn") và cho phép xóa từng hoặc tất cả
  - AC9: Kiểu `OrderFilters` cập nhật: `registeredBy: string` → `registeredBy: string[]`
  - AC10: Query server-side tab Completed hỗ trợ `registeredBy` dạng mảng (Prisma `in`)
  - AC11: Filter client-side tab In Progress hỗ trợ `registeredBy` dạng mảng

- **Bị chặn bởi**: US-1.2.6

- **Ghi chú**:
  - Hạn chế hiện tại: Tab In Progress trích xuất registrant từ đơn đã tải qua `Set`; tab Completed chỉ lấy từ trang hiện tại (tối đa 50)
  - Bảng `Registrant` đảm bảo dữ liệu đầy đủ bất kể phân trang
  - Component multi-select: dùng pattern shadcn `Popover` + `Command` (combobox) hoặc tương tự
  - Schema: `model Registrant { id String @id @default(cuid()); name String @unique; createdAt DateTime @default(now()) }`

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

**US-1.3.2: Tab Hoàn Thành & Giao diện Tab Hoàn Thành**

- **Mô tả**: Đơn đã hoàn thành hiển thị trong tab riêng "Hoàn Thành". Là nhân viên, tôi cần giao diện riêng cho tab Hoàn Thành — không hiển thị progress bar, hành động chính là `Hoàn Tác` để hoàn nguyên, và UI phải hỗ trợ tìm kiếm và lọc (tìm theo Job Number, lọc theo Registered By và Required Date) để dễ tìm và hoàn nguyên các đơn đã hoàn thành nếu được phép.

- **Tiêu chí nghiệm thu**:
  - AC1: Có tab `Hoàn Thành` riêng trên trang `/orders` chỉ liệt kê các đơn có trạng thái `COMPLETED`.
  - AC2: Mỗi hàng trong tab Hoàn Thành hiển thị: Job Number, Registered Date, Required Date, Priority, Registered By, completedAt và một badge chỉ báo đã hoàn thành.
  - AC3: Không hiển thị progress bar trong tab Hoàn Thành.
  - AC4: Hành động chính cho mỗi đơn là `Hoàn Tác`. Click `Hoàn Tác` mở modal xác nhận trước khi hoàn nguyên trạng thái về `IN_PROGRESS`.
  - AC5: Hành động `Hoàn Tác` chỉ hiển thị và thực thi với user có quyền `canUpdateStatus` (hoặc ADMIN/SUPER_ADMIN); người khác không thấy hoặc thấy disabled.
  - AC6: Tab Hoàn Thành có ô tìm kiếm `Job Number` hỗ trợ tìm khớp một phần và khớp chính xác.
  - AC7: Tab Hoàn Thành có bộ lọc `Registered By` (select/autocomplete) và `Required Date` (phạm vi ngày); các bộ lọc có thể kết hợp với tìm kiếm.
  - AC8: Cho phép sắp xếp theo `completedAt`, `Registered Date`, `Required Date` (tăng/giảm).
  - AC9: Sau khi `Hoàn Tác` thành công, đơn chuyển lại sang tab Đang xử lý và SSE/refetch cập nhật các client đang kết nối.
  - AC10: Xử lý trạng thái rỗng và loading đúng cho tab Hoàn Thành.
  - AC11: Các chuỗi UI có bản địa hóa (EN + VI) và có unit tests cho hành vi tab Hoàn Thành (tìm kiếm/lọc/hoàn tác và phân quyền).

- **Bị chặn bởi**: US-1.3.1 và US-1.2.1

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

**US-1.3.4: Quét QR/Barcode để Đánh dấu Đơn Hoàn thành**

- **Mô tả**: Là nhân viên, tôi có thể quét mã QR hoặc barcode trên hồ sơ giấy để nhanh chóng tìm đơn theo Job Number và đánh dấu hoàn thành, mà không cần tìm kiếm thủ công trên danh sách.

- **Tiêu chí nghiệm thu**:
  - AC1: Nút/icon "Quét" trên trang orders (chỉ hiển thị với user có quyền `canUpdateStatus`)
  - AC2: Click "Quét" mở scanner camera sử dụng `@yudiel/react-qr-scanner`
  - AC3: Scanner dùng camera sau (`facingMode: 'environment'`) mặc định trên mobile
  - AC4: Khi phát hiện QR/barcode, text giải mã được dùng để tìm Job Number (không phân biệt hoa thường)
  - AC5: Nếu Job Number tồn tại VÀ trạng thái `IN_PROGRESS`: hiện alert/dialog với thông tin đơn và nút "Đánh dấu Hoàn thành"
  - AC6: Nếu Job Number tồn tại VÀ trạng thái `COMPLETED`: hiện thông báo "Đơn đã hoàn thành"
  - AC7: Nếu không tìm thấy Job Number: hiện thông báo lỗi "Không tìm thấy đơn hàng"
  - AC8: Sau khi mark complete thành công, scanner vẫn mở để quét tiếp (quy trình batch)
  - AC9: Scanner có thể đóng bất cứ lúc nào
  - AC10: Hoạt động trên trình duyệt mobile (iOS Safari 14.5+, Android Chrome 88+) qua HTTPS
  - AC11: Phân quyền: chỉ user có `canUpdateStatus` mới thấy và dùng tính năng quét

- **Bị chặn bởi**: US-1.3.1

- **Ghi chú**:
  - Thư viện: `@yudiel/react-qr-scanner` (v2.5.1) — React-first, TypeScript, đang được duy trì
  - Next.js SSR: Dùng `dynamic(() => import(...), { ssr: false })` để render client-only
  - Yêu cầu HTTPS (deploy Vercel đáp ứng)
  - Hỗ trợ QR codes và 1D barcodes (Code 128, EAN-13, v.v.)
  - Cân nhắc thêm phản hồi haptic/âm thanh khi quét thành công

---

**US-1.3.5: Theo dõi Hoàn thành — Ghi nhận Người Hoàn thành & Hiển thị Thời gian Thực tế**

- **Mô tả**: Là nhân viên / Admin, tôi cần hệ thống ghi nhận ai hoàn thành mỗi đơn (để báo cáo hiệu suất nhân viên) và hiển thị thời gian xử lý thực tế trong tab Hoàn Thành (từ `receivedDate` đến `completedAt`), bao gồm chỉ báo quá hạn cho biết vượt deadline bao lâu.

- **Tiêu chí nghiệm thu**:
  - AC1: Khi đánh dấu đơn hoàn thành, `completedById` (ID user hiện tại) được ghi vào Order
  - AC2: Thay đổi schema: thêm `completedById` (FK tùy chọn → User) và relation `completedBy` vào Order model
  - AC3: Tab Hoàn Thành hiển thị cột "Người Hoàn thành" (tên user đã complete)
  - AC4: Tab Hoàn Thành hiển thị cột "Thời gian Thực tế" — thời gian từ `receivedDate` đến `completedAt` (VD: "2d 5h", "18h 30m")
  - AC5: Nếu đơn hoàn thành sau `requiredDate` (quá hạn): hiển thị chỉ báo quá hạn với thời gian vượt (VD: "⚠️ Quá hạn 1d 3h" màu đỏ)
  - AC6: Nếu đơn hoàn thành trước hoặc đúng `requiredDate`: hiển thị chỉ báo đúng hạn (VD: "✅ Đúng hạn" hoặc styling xanh)
  - AC7: Tính Thời gian Thực tế: `completedAt - receivedDate` (nhất quán với progress bar hiện tại dùng `receivedDate`)
  - AC8: Tính Quá hạn: `completedAt - requiredDate` (chỉ khi `completedAt > requiredDate`)
  - AC9: Hoàn tác completion (`US-1.3.3`) phải xóa cả `completedById` (set null)
  - AC10: "Người Hoàn thành" có thể sắp xếp và lọc trong tab Hoàn Thành
  - AC11: Hoàn thành bằng quét QR (`US-1.3.4`) cũng phải ghi `completedById`

- **Bị chặn bởi**: US-1.3.1, US-1.3.2

- **Ghi chú**:
  - Schema: `completedById String?` + `completedBy User? @relation("CompletedBy", ...)` trên Order model
  - Thời gian Thực tế dùng `receivedDate` (thời điểm nhận mẫu) làm mốc bắt đầu, nhất quán với progress bar
  - Quá hạn dùng `requiredDate` làm mốc deadline
  - Hỗ trợ báo cáo hiệu suất nhân viên tương lai (lọc/nhóm theo `completedBy`)

---

**US-1.3.6: Hỗ trợ Máy quét Barcode (USB/Bluetooth — Nhập qua Bàn phím)**

- **Mô tả**: Là nhân viên, tôi có thể dùng máy quét barcode USB hoặc Bluetooth kết nối máy tính để quét hồ sơ và đánh dấu đơn hoàn thành, giúp làm việc nhanh hơn tại bàn làm việc mà không cần dùng camera điện thoại.

- **Tiêu chí nghiệm thu**:
  - AC1: Trên trang orders, listener bàn phím toàn trang phát hiện input từ máy quét (phím nhấn liên tục < 50ms, kết thúc Enter)
  - AC2: Phân biệt input máy quét với gõ phím thường bằng ngưỡng tốc độ
  - AC3: Khi bắt được chuỗi barcode hợp lệ, kích hoạt flow lookup giống camera scan (tái sử dụng `GET /api/orders/lookup`)
  - AC4: Nếu tìm thấy đơn + `IN_PROGRESS`: hiện ConfirmDialog với thông tin đơn và nút "Đánh dấu Hoàn thành"
  - AC5: Nếu tìm thấy đơn + `COMPLETED`: hiện thông báo "Đơn đã hoàn thành"
  - AC6: Nếu không tìm thấy: hiện thông báo lỗi "Không tìm thấy đơn hàng"
  - AC7: Sau khi mark complete thành công, listener vẫn hoạt động để quét tiếp (batch workflow)
  - AC8: Keyboard listener chỉ active khi scanner overlay KHÔNG mở (tránh xung đột với camera scan)
  - AC9: Phân quyền: chỉ hoạt động với user có `canUpdateStatus`
  - AC10: Hoạt động trên trình duyệt desktop (Chrome, Edge, Firefox) — không cần HTTPS cho input USB
  - AC11: Không cần thay đổi UI — máy quét hoạt động ngầm trên trang orders

- **Bị chặn bởi**: US-1.3.4

- **Ghi chú**:
  - Máy quét barcode USB/Bluetooth hoạt động như thiết bị HID bàn phím — "gõ" chuỗi barcode rồi nhấn Enter
  - Tái sử dụng API route `GET /api/orders/lookup` và `POST /api/orders/[id]/mark-done` từ US-1.3.4
  - Triển khai chính: `useEffect` với `keydown` listener, buffer phím nhấn, phát hiện pattern nhập nhanh
  - Ngưỡng: ~50ms giữa các phím gợi ý máy quét (gõ tay thường > 100ms)
  - Không được can thiệp vào các ô input khác (VD: search/filter) — tắt khi input element đang focus
  - Cân nhắc debounce/cooldown sau scan thành công để tránh xử lý trùng

---

**US-1.3.7: Cải thiện UI tab Hoàn thành — Hiển thị Email & Chỉ báo Hoàn thành Sớm**

- **Mô tả**: Là nhân viên / Admin, tôi muốn tab Hoàn thành (1) ẩn dấu ngoặc rỗng `()` ở cột "Completed By" khi user không có email, và (2) hiển thị hoàn thành sớm bao lâu so với thời gian priority ở cột "Actual Duration" (tương tự dòng phụ overdue), để giao diện sạch và thông tin đầy đủ.

- **Tiêu chí nghiệm thu**:
  - AC1: Cột "Completed By" — nếu `completedBy.email` null hoặc chuỗi rỗng, chỉ hiển thị tên user, bỏ `()`
  - AC2: Cột "Actual Duration" — nếu đơn hoàn thành **sớm hơn** thời gian priority, hiển thị dòng phụ: `"Early: {time}"` màu xanh (VD: "Early: 30m"), giống format dòng overdue
  - AC3: Tính thời gian sớm: `priorityDurationMs - actualMs` (chỉ khi `actualMs < priorityDurationMs`)
  - AC4: Màu sắc không đổi: xanh cho đúng hạn/sớm, tím cho quá hạn
  - AC5: Không thay đổi API — chỉ sửa UI trong `completed-orders-table.tsx`

- **Bị chặn bởi**: US-1.3.5

- **Ghi chú**:
  - Staff user tạo qua staff code login có thể không có email
  - Chỉ báo sớm giúp quản lý nhanh chóng thấy đơn hoàn thành hiệu quả
  - Dùng cùng hàm `formatDuration()` và logic `getPriorityDuration()` như tính overdue

---

---

## Phase 2: Báo cáo & Phân tích

### Epic 2.1: Dashboard Hiệu suất

---

**US-2.1.1: Dashboard Hiệu suất với Biểu đồ Trực quan**

- **Mô tả**: Là Admin / Super Admin, tôi cần dashboard chính hiển thị biểu đồ hiệu suất và chỉ số KPI thể hiện dữ liệu hoàn thành theo toàn team, nhóm hoặc cá nhân với bộ lọc thời gian linh hoạt, để theo dõi năng suất team ngay khi đăng nhập.

- **Tiêu chí nghiệm thu**:
  - AC1: Trang Dashboard (`/`) hiển thị phần hiệu suất cho Admin và Super Admin (Staff giữ giao diện hiện tại)
  - AC2: Bộ chọn phạm vi: "Toàn Team", "Nhóm" (chọn nhóm), "Cá nhân" (chọn user) — mặc định "Toàn Team"
  - AC3: Bộ lọc thời gian: preset (Hôm nay, 7 ngày qua, Tháng này, Tháng trước, 3 tháng qua) + chọn khoảng thời gian tùy chỉnh
  - AC4: Thẻ KPI tổng hợp: Tổng Hoàn thành, Tỷ lệ Đúng hạn (%), Thời gian Xử lý TB, Số đơn Quá hạn
  - AC5: Biểu đồ cột: số đơn hoàn thành theo user (cột ngang, sắp xếp giảm dần) cho phạm vi/thời gian đã chọn
  - AC6: Biểu đồ tròn/donut: Tỷ lệ Đúng hạn vs Quá hạn
  - AC7: Biểu đồ đường (tùy chọn): xu hướng hoàn thành theo thời gian (theo ngày/tuần)
  - AC8: Bảng dưới biểu đồ hiển thị chi tiết từng user: Tên, Số đơn HT, % Đúng hạn, TG TB, Số đơn Quá hạn
  - AC9: Thư viện biểu đồ: `recharts` (React-native, nhẹ, composable, tương thích SSR với `dynamic()`)
  - AC10: Tổng hợp dữ liệu tính toán phía server (Server Action) — client nhận metrics đã tính sẵn
  - AC11: Trạng thái trống khi không có đơn hoàn thành trong khoảng thời gian đã chọn
  - AC12: Layout responsive — biểu đồ xếp dọc trên mobile, dạng grid trên desktop

- **Bị chặn bởi**: US-1.3.5

- **Ghi chú**:
  - Biểu đồ render trên trang dashboard hiện tại (`(dashboard)/page.tsx`), không tạo route riêng
  - Chỉ Admin/Super Admin thấy phần hiệu suất; Staff giữ giao diện hiện tại
  - Thư viện: `recharts` — React-first, composable, nhẹ (~45kB gzipped)
  - Next.js SSR: Dùng `dynamic(() => import(...), { ssr: false })` cho chart components
  - Server Action trả về dữ liệu đã tổng hợp, giảm tính toán phía client

---

**US-2.1.2: Xuất Đơn hàng Đã hoàn thành ra Excel**

- **Mô tả**: Là Admin / Super Admin, tôi cần xuất danh sách đơn hàng đã hoàn thành (đã lọc) từ tab Completed ra file Excel, để lưu trữ và báo cáo offline.

- **Tiêu chí nghiệm thu**:
  - AC1: Nút "Export Excel" trên tab Completed Orders, chỉ hiển thị cho Admin và Super Admin
  - AC2: Nhấn Export sẽ fetch tất cả completed orders phù hợp với search/filter/sort hiện tại theo batch
  - AC3: File Excel được tạo hoàn toàn ở phía client bằng thư viện ExcelJS
  - AC4: File tải về là `.xlsx` hợp lệ với tiêu đề cột và dữ liệu được định dạng đúng
  - AC5: Cột Excel: Mã Job, Người đăng ký, Ngày đăng ký, Ngày nhận mẫu, Ngày yêu cầu, Priority, Số mẫu, Ngày hoàn thành, Người hoàn thành
  - AC6: Xuất file tuân thủ tất cả bộ lọc hiện tại: search, registeredBy, khoảng ngày, sắp xếp
  - AC7: Đặt tên file: `completed-orders-YYYY-MM-DD.xlsx`
  - AC8: Hiển thị thanh tiến trình khi đang fetch batch
  - AC9: Nút Export bị vô hiệu khi đang export
  - AC10: Người dùng STAFF không thể thấy hoặc sử dụng nút export

- **Bị chặn bởi**: US-2.1.1

- **Ghi chú**:
  - Thư viện Excel: `exceljs` — tạo file phía client bằng `writeBuffer()`
  - Client fetch dữ liệu theo batch qua API `/api/orders/completed` hiện có cho đến khi lấy hết, rồi tạo file và trigger download
  - Không tạo file phía server — mọi xử lý diễn ra trên trình duyệt
  - Xuất báo cáo tổng hợp hiệu suất hoãn sang US tương lai

---

**Next Step**: `/roadmap-to-user-stories-review` or `/product-checklist`
