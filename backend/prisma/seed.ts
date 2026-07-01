import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash,
      role: 'user',
    },
  })

  await prisma.task.createMany({
    data: [
      { title: 'Setup database', description: 'Configure PostgreSQL and run migrations', status: 'done', ownerId: admin.id },
      { title: 'Build auth system', description: 'Implement JWT auth with refresh tokens', status: 'in_progress', ownerId: admin.id },
      { title: 'Write API tests', description: 'Add integration tests for all endpoints', status: 'todo', ownerId: admin.id },
      { title: 'Fix login bug', description: 'Users cannot login with valid credentials', status: 'todo', ownerId: user.id },
      { title: 'Add pagination', description: 'Paginate task list for large datasets', status: 'todo', ownerId: user.id },
    ],
    skipDuplicates: true,
  })

  console.log('Seed complete.')
  console.log('Admin: admin@example.com / password123')
  console.log('User:  user@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
