import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { items, shippingAddress } = createOrderDto;

    return this.prisma.$transaction(async (prisma) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        // Calculate total
        // Price should probably be Decimal but let's assume Float/Decimal compatible number for simple math
        const price = Number(product.price);
        total += price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price, // Store price at time of order
          selectedVariants: item.selectedVariants || {},
        });

        // Decrement stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      const order = await prisma.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          shippingAddress: shippingAddress as Prisma.InputJsonObject,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return order;
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'Admin') {
      return this.prisma.order.findMany({
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return this.prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) return null;
    if (role !== 'Admin' && order.userId !== userId) {
      throw new BadRequestException('Order not found or access denied');
    }

    return order;
  }

  async updateStatus(id: string, status: any) { // Status enum
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
