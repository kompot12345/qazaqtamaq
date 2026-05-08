import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getRestockReport() {
    const lowStock = await this.prisma.product.findMany({
      where: { OR: [{ retailStock: { lt: 10 } }, { exportStock: { lt: 50 } }] },
      include: { farmer: { select: { name: true, email: true } } },
      orderBy: { retailStock: 'asc' },
    });
    return { products: lowStock, count: lowStock.length };
  }

  async getExportStats() {
    const [exportOrders, retailOrders] = await Promise.all([
      this.prisma.order.count({ where: { type: 'EXPORT' } }),
      this.prisma.order.count({ where: { type: 'RETAIL' } }),
    ]);
    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'DELIVERED' },
    });
    return {
      exportOrders,
      retailOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    };
  }

  // Flash Sale: auto-discount products expiring within 48 hours
  @Cron('0 */6 * * *')
  async applyExpirationDiscounts() {
    const now = new Date();
    const threshold48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [activated, deactivated] = await Promise.all([
      // Activate 30% discount for products expiring within 48h
      this.prisma.product.updateMany({
        where: {
          expirationDate: { gt: now, lte: threshold48h },
          discountActive: false,
        },
        data: { discountActive: true, discountPercent: 30 },
      }),
      // Remove discount from expired products
      this.prisma.product.updateMany({
        where: { expirationDate: { lte: now }, discountActive: true },
        data: { discountActive: false, discountPercent: 0 },
      }),
    ]);

    if (activated.count > 0 || deactivated.count > 0) {
      this.logger.log(
        `Expiration Guard: activated ${activated.count} flash sales, cleared ${deactivated.count} expired discounts`,
      );
    }

    return { activated: activated.count, deactivated: deactivated.count };
  }

  async triggerExpirationGuard() {
    return this.applyExpirationDiscounts();
  }
}