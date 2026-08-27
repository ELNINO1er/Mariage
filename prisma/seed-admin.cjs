const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Super-admin ignoré : ADMIN_EMAIL ou ADMIN_PASSWORD absent.");
    return;
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD doit contenir au moins 10 caractères.");
  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, platformRole: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      firstName: process.env.ADMIN_FIRST_NAME?.trim() || "Super",
      lastName: process.env.ADMIN_LAST_NAME?.trim() || "Admin",
      email,
      passwordHash,
      platformRole: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Compte super-admin de production vérifié.");
}

main().finally(() => prisma.$disconnect());
