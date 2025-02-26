import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Test kategorileri
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Restoran' } }),
    prisma.category.create({ data: { name: 'Kafe' } }),
    prisma.category.create({ data: { name: 'Market' } })
  ])

  // Test kullanıcısı
  const hashedPassword = await bcrypt.hash('123456', 10)
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'BUSINESS'
    }
  })

  // Test işletmesi
  await prisma.business.create({
    data: {
      name: 'Test İşletme',
      description: 'Test açıklama',
      address: 'Test adres',
      latitude: 41.0082,
      longitude: 28.9784,
      categoryId: categories[0].id,
      userId: user.id
    }
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect()) 