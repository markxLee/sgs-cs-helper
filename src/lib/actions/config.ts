import { prisma } from "@/lib/db";

export async function getLoginMode(): Promise<string> {
  const config = await prisma.config.findUnique({
    where: { key: "login_mode" },
  });
  return config?.value || "quick_code";
}

export async function updateLoginMode(mode: string): Promise<void> {
  await prisma.config.upsert({
    where: { key: "login_mode" },
    update: { value: mode },
    create: { key: "login_mode", value: mode },
  });
}
