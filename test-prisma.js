const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.settings.findFirst();
  console.log(settings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
