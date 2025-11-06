import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@lumera.com' },
    update: {},
    create: {
      email: 'admin@lumera.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SuperAdmin',
    },
  });

  console.log('Admin created:', admin);

  // Create some sample products
  const products = [
    {
      name: 'Burger Klasik',
      description: 'Burger dengan daging sapi premium dan sayuran segar',
      price: 25000,
      stock: 50,
      imageUrl: '/images/burgers/burger.png',
    },
    {
      name: 'Donat Coklat',
      description: 'Donat lembut dengan topping coklat',
      price: 15000,
      stock: 30,
      imageUrl: '/images/cakes/donat.png',
    },
    {
      name: 'Ice Cream Vanilla',
      description: 'Es krim vanilla klasik yang creamy',
      price: 12000,
      stock: 40,
      imageUrl: '/images/icecreams/ice cream.png',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  console.log('Sample products created');

  // Create admin logs for the admin
  await prisma.adminLog.createMany({
    data: [
      {
        adminId: admin.id,
        action: 'LOGIN',
        module: 'AUTH',
        description: 'Admin logged in',
      },
      {
        adminId: admin.id,
        action: 'ACCESS',
        module: 'DASHBOARD',
        description: 'Accessed dashboard',
      },
      {
        adminId: admin.id,
        action: 'ACCESS',
        module: 'PRODUCTS',
        description: 'Accessed products management',
      },
    ],
  });

  console.log('Admin logs created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
