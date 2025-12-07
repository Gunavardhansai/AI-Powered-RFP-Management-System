// seed.js - run with `node prisma/seed.js` after migrations
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.vendor.upsert({
    where: { email: 'vendor1@example.com' },
    update: {},
    create: {
      name: 'Acme Supplies',
      email: 'vendor1@example.com',
      contact: 'Alice'
    }
  });

  await prisma.vendor.upsert({
    where: { email: 'vendor2@example.com' },
    update: {},
    create: {
      name: 'BestParts Ltd',
      email: 'vendor2@example.com',
      contact: 'Bob'
    }
  });

  const rfp = await prisma.rFP.upsert({
    where: { id: 'seed-rfp-1' },
    update: {},
    create: {
      id: 'seed-rfp-1',
      title: 'Seed RFP - Laptops & Monitors',
      description: 'Need 20 laptops and 15 monitors',
      budget: 50000,
      currency: 'USD',
      delivery_days: 30,
      payment_terms: 'net 30',
      warranty_months: 12
    }
  });

  await prisma.rFPItem.createMany({
    data: [
      { rfpId: rfp.id, name: 'Laptop', qty: 20, specs: JSON.stringify({ ram: '16GB' }) },
      { rfpId: rfp.id, name: 'Monitor', qty: 15, specs: JSON.stringify({ size: '27-inch' }) }
    ]
  });

  console.log('Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect() });
