const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany();
  console.log('Current locations:', locations);

  const broadstairs = locations.find(loc => loc.name.toLowerCase() === 'broadstairs');
  if (broadstairs) {
    const updated = await prisma.location.update({
      where: { id: broadstairs.id },
      data: {
        email: '1 High St, Broadstairs CT10 1LP', // They are using the email field for the address
        phone: '01843 313655',
      },
    });
    console.log('Updated location:', updated);
  } else {
    console.log('Broadstairs location not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
