import 'dotenv/config'
import { PrismaClient, OrderStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const url = new URL(process.env.DATABASE_URL as string)
url.searchParams.delete('sslmode')
const connectionString = url.toString()

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Clear existing data (berurutan sesuai relasi)
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()

  console.log('✅ Existing data cleared')

  // 2. Seed Roles
  const roles = await prisma.role.createMany({
    data: [
      {
        name: 'admin',
        permissions: JSON.stringify([
          'create:any',
          'read:any',
          'update:any',
          'delete:any',
          'manage:users',
          'manage:orders',
          'manage:products',
          'manage:categories',
          'manage:reviews'
        ])
      },
      {
        name: 'customer',
        permissions: JSON.stringify([
          'read:own',
          'update:own',
          'create:order',
          'read:products',
          'create:review'
        ])
      }
    ],
    skipDuplicates: true
  })

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
  const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } })

  console.log('✅ Roles seeded')

  // 3. Seed Users
  const passwordHash = await hash('password123', 10)
  
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        passwordHash,
        name: 'Admin User',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        roleId: adminRole!.id,
        address: 'Jl. Admin No. 1, Jakarta',
        phone: '+6281234567890',
        isActive: true
      },
      {
        email: 'customer1@example.com',
        passwordHash,
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        roleId: customerRole!.id,
        address: 'Jl. Customer No. 123, Bandung',
        phone: '+6289876543210',
        isActive: true
      },
      {
        email: 'customer2@example.com',
        passwordHash,
        name: 'Jane Smith',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        roleId: customerRole!.id,
        address: 'Jl. Mawar No. 45, Surabaya',
        phone: '+6285555555555',
        isActive: true
      }
    ],
    skipDuplicates: true
  })

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const customer1 = await prisma.user.findUnique({ where: { email: 'customer1@example.com' } })
  const customer2 = await prisma.user.findUnique({ where: { email: 'customer2@example.com' } })

  console.log('✅ Users seeded')

  // 4. Seed Categories (dengan parent-child relationship)
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      description: 'Latest electronic gadgets and devices',
      isActive: true
    }
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      description: 'Fashion clothing for all',
      isActive: true
    }
  })

  // Sub-categories
  await prisma.category.createMany({
    data: [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        description: 'Latest smartphones',
        isActive: true,
        parentId: electronics.id
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
        description: 'High-performance laptops',
        isActive: true,
        parentId: electronics.id
      },
      {
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
        description: 'Clothing for men',
        isActive: true,
        parentId: clothing.id
      },
      {
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        description: 'Clothing for women',
        isActive: true,
        parentId: clothing.id
      }
    ],
    skipDuplicates: true
  })

  const smartphoneCat = await prisma.category.findUnique({ where: { slug: 'smartphones' } })
  const laptopCat = await prisma.category.findUnique({ where: { slug: 'laptops' } })
  const mensClothingCat = await prisma.category.findUnique({ where: { slug: 'mens-clothing' } })
  const womensClothingCat = await prisma.category.findUnique({ where: { slug: 'womens-clothing' } })

  console.log('✅ Categories seeded')

  // 5. Seed Products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: 1299.99,
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        stock: 50,
        categoryId: smartphoneCat!.id,
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
          'https://images.unsplash.com/photo-1695048133081-0c5cb1383c5c'
        ],
        partitions: JSON.stringify({
          colors: ['Space Black', 'White', 'Blue', 'Natural'],
          storage: ['128GB', '256GB', '512GB', '1TB']
        }),
        isActive: true,
        sku: 'IP15P-2023',
        weight: 0.5
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        slug: 'samsung-galaxy-s23-ultra',
        price: 1199.99,
        description: 'Samsung flagship with S Pen and 200MP camera',
        stock: 35,
        categoryId: smartphoneCat!.id,
        images: [
          'https://images.unsplash.com/photo-1678911820855-67f96d8015e1',
          'https://images.unsplash.com/photo-1678911820843-7c8c9f6c6a3b'
        ],
        partitions: JSON.stringify({
          colors: ['Phantom Black', 'Cream', 'Green', 'Lavender'],
          storage: ['256GB', '512GB', '1TB']
        }),
        isActive: true,
        sku: 'SGS23U-2023',
        weight: 0.48
      },
      {
        name: 'MacBook Pro 16" M2 Max',
        slug: 'macbook-pro-16-m2-max',
        price: 3499.99,
        description: 'Professional laptop with M2 Max chip',
        stock: 20,
        categoryId: laptopCat!.id,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
          'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5'
        ],
        partitions: JSON.stringify({
          chip: ['M2 Pro', 'M2 Max'],
          memory: ['16GB', '32GB', '64GB', '96GB'],
          storage: ['512GB', '1TB', '2TB', '4TB', '8TB']
        }),
        isActive: true,
        sku: 'MBP16-M2MAX',
        weight: 2.15
      },
      {
        name: 'Men\'s Casual Shirt',
        slug: 'mens-casual-shirt',
        price: 29.99,
        description: 'Comfortable casual shirt for everyday wear',
        stock: 100,
        categoryId: mensClothingCat!.id,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'
        ],
        partitions: JSON.stringify({
          size: ['S', 'M', 'L', 'XL', 'XXL'],
          color: ['White', 'Blue', 'Black', 'Gray']
        }),
        isActive: true,
        sku: 'MCS-001',
        weight: 0.3
      },
      {
        name: 'Women\'s Summer Dress',
        slug: 'womens-summer-dress',
        price: 49.99,
        description: 'Light and beautiful summer dress',
        stock: 75,
        categoryId: womensClothingCat!.id,
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae'
        ],
        partitions: JSON.stringify({
          size: ['XS', 'S', 'M', 'L', 'XL'],
          color: ['Red', 'Yellow', 'Blue', 'White', 'Pink']
        }),
        isActive: true,
        sku: 'WSD-001',
        weight: 0.25
      }
    ],
    skipDuplicates: true
  })

  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-15-pro' } })
  const samsung = await prisma.product.findUnique({ where: { slug: 'samsung-galaxy-s23-ultra' } })
  const macbook = await prisma.product.findUnique({ where: { slug: 'macbook-pro-16-m2-max' } })
  const shirt = await prisma.product.findUnique({ where: { slug: 'mens-casual-shirt' } })
  const dress = await prisma.product.findUnique({ where: { slug: 'womens-summer-dress' } })

  console.log('✅ Products seeded')

  // 6. Seed Orders
  const orders = await prisma.order.createMany({
    data: [
      {
        userId: customer1!.id,
        total: 1329.98, // iPhone + shipping
        status: OrderStatus.DELIVERED,
        shippingAddress: JSON.stringify({
          street: 'Jl. Customer No. 123',
          city: 'Bandung',
          province: 'West Java',
          postalCode: '40111',
          country: 'Indonesia'
        }),
        billingAddress: JSON.stringify({
          street: 'Jl. Customer No. 123',
          city: 'Bandung',
          province: 'West Java',
          postalCode: '40111',
          country: 'Indonesia'
        }),
        paymentMethod: 'credit_card',
        paymentId: 'pay_123456789',
        shippingCost: 10.00,
        tax: 20.00,
        notes: 'Please deliver before 5 PM',
        shippedAt: new Date('2024-01-15T10:30:00Z'),
        deliveredAt: new Date('2024-01-17T14:20:00Z')
      },
      {
        userId: customer2!.id,
        total: 3549.98, // MacBook + shirt + shipping
        status: OrderStatus.PROCESSING,
        shippingAddress: JSON.stringify({
          street: 'Jl. Mawar No. 45',
          city: 'Surabaya',
          province: 'East Java',
          postalCode: '60245',
          country: 'Indonesia'
        }),
        billingAddress: JSON.stringify({
          street: 'Jl. Mawar No. 45',
          city: 'Surabaya',
          province: 'East Java',
          postalCode: '60245',
          country: 'Indonesia'
        }),
        paymentMethod: 'bank_transfer',
        paymentId: 'pay_987654321',
        shippingCost: 15.00,
        tax: 35.00,
        notes: 'Gift wrapping requested'
      },
      {
        userId: customer1!.id,
        total: 1209.99, // Samsung phone
        status: OrderStatus.PAID,
        shippingAddress: JSON.stringify({
          street: 'Jl. Customer No. 123',
          city: 'Bandung',
          province: 'West Java',
          postalCode: '40111',
          country: 'Indonesia'
        }),
        paymentMethod: 'ewallet',
        paymentId: 'pay_555555555',
        shippingCost: 10.00,
        tax: 0.00
      }
    ],
    skipDuplicates: true
  })

  // Get created orders
  const order1 = await prisma.order.findFirst({
    where: { userId: customer1!.id, status: OrderStatus.DELIVERED }
  })
  const order2 = await prisma.order.findFirst({
    where: { userId: customer2!.id, status: OrderStatus.PROCESSING }
  })
  const order3 = await prisma.order.findFirst({
    where: { userId: customer1!.id, status: OrderStatus.PAID }
  })

  console.log('✅ Orders seeded')

  // 7. Seed Order Items
  await prisma.orderItem.createMany({
    data: [
      // Order 1 items
      {
        orderId: order1!.id,
        productId: iphone!.id,
        quantity: 1,
        price: 1299.99,
        selectedVariants: JSON.stringify({
          color: 'Space Black',
          storage: '256GB'
        })
      },
      // Order 2 items
      {
        orderId: order2!.id,
        productId: macbook!.id,
        quantity: 1,
        price: 3499.99,
        selectedVariants: JSON.stringify({
          chip: 'M2 Max',
          memory: '32GB',
          storage: '1TB'
        })
      },
      {
        orderId: order2!.id,
        productId: shirt!.id,
        quantity: 2,
        price: 29.99,
        selectedVariants: JSON.stringify({
          size: 'L',
          color: 'Blue'
        })
      },
      // Order 3 items
      {
        orderId: order3!.id,
        productId: samsung!.id,
        quantity: 1,
        price: 1199.99,
        selectedVariants: JSON.stringify({
          color: 'Phantom Black',
          storage: '512GB'
        })
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Order items seeded')

  // 8. Seed Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: customer1!.id,
        productId: iphone!.id,
        orderId: order1!.id,
        rating: 5,
        comment: 'Excellent phone! The camera quality is amazing and battery life lasts all day.',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        userId: customer1!.id,
        productId: samsung!.id,
        orderId: order3!.id,
        rating: 4,
        comment: 'Great phone but a bit heavy. Camera is exceptional though.',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        userId: customer2!.id,
        productId: shirt!.id,
        orderId: order2!.id,
        rating: 5,
        comment: 'Very comfortable and fits perfectly. Will buy again!',
        isVerifiedPurchase: true,
        isApproved: true
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Reviews seeded')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Roles: 2`)
  console.log(`   - Users: 3`)
  console.log(`   - Categories: 6 (2 parents + 4 children)`)
  console.log(`   - Products: 5`)
  console.log(`   - Orders: 3`)
  console.log(`   - Order Items: 4`)
  console.log(`   - Reviews: 3`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })