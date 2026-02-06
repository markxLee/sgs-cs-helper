import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Generate a random 6-character alphanumeric staff code
 * 
 * Format: [A-Z0-9]{6}
 * Example: "ABC123", "XY9Z4K"
 * 
 * @returns A 6-character uppercase alphanumeric string
 */
export function generateStaffCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Generate a unique staff code with collision detection
 * 
 * Attempts to generate a unique code up to 10 times.
 * If collision occurs, logs warning and retries.
 * 
 * @param prisma - Prisma client instance
 * @returns A unique 6-character staff code
 * @throws Error if unable to generate unique code after 10 attempts
 */
export async function generateUniqueStaffCode(
  prisma: PrismaClient
): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateStaffCode();
    
    // Check if code already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { staffCode: code },
      select: { id: true },
    });
    
    if (!existingUser) {
      return code;
    }
    
    // Log collision warning (rare but possible)
    console.warn(
      `Staff code collision: ${code}, attempt ${attempt + 1}/${MAX_ATTEMPTS}`
    );
  }
  
  // This should be extremely rare with 36^6 = 2.1B possible codes
  throw new Error(
    "Unable to generate unique staff code after 10 attempts. Please try again."
  );
}
