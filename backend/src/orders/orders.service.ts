import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Validate stock for every item before touching anything
      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new BadRequestException(`Өнім табылмады: ${item.productId}`);
        }
        if (!product.isAvailableRetail) {
          throw new BadRequestException(`${product.name} қазір сатылмайды`);
        }
        if (product.retailStock < item.quantity) {
          throw new BadRequestException(
            `${product.name}: жеткіліксіз қор (қолда бар: ${product.retailStock} кг)`
          );
        }
      }

      // Deduct stock atomically
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { retailStock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          type: dto.type,
          totalAmount: dto.totalAmount,
          deliveryAddress: dto.deliveryAddress,
          deliveryCity: dto.deliveryCity,
          phone: dto.phone,
          items: { create: dto.items },
        },
        include: { items: { include: { product: true } } },
      });
    });
  }

  async findById(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: { select: { id: true, name: true, city: true, address: true } },
              },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findMy(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async getFarmerOrders(farmerId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { farmerId },
          },
        },
      },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, farmerId: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { farmerId: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isFarmerOrder = order.items.some((item) => item.product.farmerId === userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isFarmerOrder && user?.role !== 'ADMIN') {
      throw new ForbiddenException('You do not own this order');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}