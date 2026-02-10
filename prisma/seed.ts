import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // 1. Validate required environment variables
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      "SUPER_ADMIN_EMAIL is required. Set it in .env or environment."
    );
  }

  if (!password) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD is required. Set it in .env or environment."
    );
  }

  if (password.length < 8) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters.");
  }

  // 2. Hash password
  console.log("🔐 Hashing password...");
  const passwordHash = await hashPassword(password);

  // 3. Upsert Super Admin user
  console.log("👤 Creating/updating Super Admin user...");
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      authMethod: "CREDENTIALS",
      status: "ACTIVE",
    },
    create: {
      email,
      passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      authMethod: "CREDENTIALS",
      status: "ACTIVE",
    },
  });
  console.log(`   ✓ User: ${user.email} (${user.role})`);

  // 4. Upsert default configs
  console.log("⚙️  Creating/updating default configs...");

  // Warning threshold (percentage)
  const warningThreshold = await prisma.config.upsert({
    where: { key: "warning_threshold" },
    update: { value: "80" },
    create: { key: "warning_threshold", value: "80" },
  });
  console.log(`   ✓ ${warningThreshold.key}: ${warningThreshold.value}`);

  // Staff code (shared code for STAFF role login)
  const staffCodeValue = process.env.STAFF_CODE || "SGS2026";
  const staffCode = await prisma.config.upsert({
    where: { key: "staff_code" },
    update: { value: staffCodeValue },
    create: { key: "staff_code", value: staffCodeValue },
  });
  console.log(`   ✓ ${staffCode.key}: ${staffCode.value}`);

  // Login mode config
  const loginModeValue = process.env.LOGIN_MODE || "quick_code";
  const loginMode = await prisma.config.upsert({
    where: { key: "login_mode" },
    update: { value: loginModeValue },
    create: { key: "login_mode", value: loginModeValue },
  });
  console.log(`   ✓ ${loginMode.key}: ${loginMode.value}`);

  console.log("\n✅ Seed completed successfully!");
  console.log(`   - Super Admin: ${user.email}`);
  console.log(`   - Configs: 2 records`);

  // 5. Set permissions for STAFF users
  console.log("🔑 Setting permissions for STAFF users...");
  const updated = await prisma.user.updateMany({
    data: { canUpload: true, canUpdateStatus: true },
    where: { role: "STAFF" }
  });
  console.log(`   ✓ Updated ${updated.count} STAFF users with permissions`);

  // 6. Seed Registrants from existing Orders
  console.log("\n👥 Seeding Registrants from existing orders...");
  
  // Fetch distinct registeredBy values from Order table
  const distinctRegistrants = await prisma.order.findMany({
    distinct: ['registeredBy'],
    where: {
      registeredBy: {
        not: null,
      },
    },
    select: {
      registeredBy: true,
    },
  });

  // Filter out empty/whitespace-only values and upsert each
  let registrantCount = 0;
  for (const { registeredBy } of distinctRegistrants) {
    if (registeredBy && registeredBy.trim().length > 0) {
      await prisma.registrant.upsert({
        where: { name: registeredBy },
        update: {},
        create: { name: registeredBy },
      });
      registrantCount++;
    }
  }
  
  console.log(`   ✓ Seeded ${registrantCount} registrants from existing orders`);

  console.log("\n✅ All seed operations completed successfully!");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
