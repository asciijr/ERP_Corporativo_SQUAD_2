import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.systemHealth.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { status: 'ok' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ok',
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
