import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@myforms.com' },
    update: {},
    create: {
      email: 'admin@myforms.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@myforms.com' },
    update: {},
    create: {
      email: 'user@myforms.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER',
    },
  });

  console.log('Created users:', { admin: admin.email, user: user.email });

  // Create sample form templates
  const eventRegistration = await prisma.formTemplate.upsert({
    where: { id: 'event-registration-template' },
    update: {},
    create: {
      id: 'event-registration-template',
      name: 'Event Registration',
      description: 'Template for event registration forms',
      category: 'Events',
      isPublic: true,
      formData: {
        title: 'Event Registration',
        description: 'Please fill out this form to register for the event',
        questions: [
          {
            type: 'SHORT_ANSWER',
            title: 'Full Name',
            required: true,
            order: 0,
          },
          {
            type: 'SHORT_ANSWER',
            title: 'Email',
            required: true,
            validation: { pattern: 'email' },
            order: 1,
          },
          {
            type: 'MULTIPLE_CHOICE',
            title: 'Dietary Requirements',
            options: { choices: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other'] },
            order: 2,
          },
        ],
      },
    },
  });

  console.log('Created templates:', eventRegistration.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

