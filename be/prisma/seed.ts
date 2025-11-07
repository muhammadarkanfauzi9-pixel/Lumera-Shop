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

  // Create sample users for reviews
  const sampleUsers = [
    {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'John Doe',
      phone: '081234567890',
      balance: 100000, // Add balance for QRIS simulation
    },
    {
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Jane Smith',
      phone: '081234567891',
      balance: 50000, // Add balance for QRIS simulation
    },
  ];

  const createdUsers = [];
  for (const user of sampleUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(createdUser);
  }

  console.log('Sample users created');

  // Create sample ratings/reviews
  const sampleRatings = [
    {
      productId: 1, // Burger Klasik
      userId: createdUsers[0]?.id,
      value: 5,
      comment: 'Burger ini sangat enak dan juicy! Porsinya juga pas.',
    },
    {
      productId: 1, // Burger Klasik
      userId: createdUsers[1]?.id,
      value: 4,
      comment: 'Rasanya oke, tapi agak lama antriannya.',
    },
    {
      productId: 2, // Donat Coklat
      userId: createdUsers[0]?.id,
      value: 5,
      comment: 'Donatnya lembut dan topping coklatnya melimpah. Recomended!',
    },
    {
      productId: 3, // Ice Cream Vanilla
      userId: createdUsers[1]?.id,
      value: 3,
      comment: 'Es krimnya biasa saja, kurang creamy.',
    },
    {
      productId: 1, // Burger Klasik
      userId: null, // Anonymous
      value: 4,
      comment: 'Enak banget, tapi harganya mahal.',
    },
  ];

  for (const rating of sampleRatings) {
    await prisma.rating.create({
      data: rating,
    });
  }

  console.log('Sample ratings created');

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
