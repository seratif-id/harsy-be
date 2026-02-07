import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    // Verify purchase
    // Look for a PAID or DELIVERED order from this user containing the product
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, // Adjust based on strictness
        },
      },
      include: { order: true },
    });

    if (!orderItem) {
      throw new BadRequestException('You can only review products you have purchased.');
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
        orderId: orderItem.orderId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product for this order.');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        orderId: orderItem.orderId,
        rating,
        comment,
      },
    });
  }

  async findAll(productId: string) {
    if (!productId) {
      throw new BadRequestException('ProductId query parameter is required');
    }
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, avatar: true } } }, // Adjust select based on schema
      orderBy: { createdAt: 'desc' },
    });
  }
}
