import bcrypt from "bcrypt";

/**
 * Cost factor for bcrypt hashing.
 * 10 is the recommended balance between security and performance.
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt.
 * @param password - The plain text password to hash
 * @returns The bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a bcrypt hash.
 * @param password - The plain text password to verify
 * @param hash - The bcrypt hash to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
