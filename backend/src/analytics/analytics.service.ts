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

  // --- Farmer-specific analytics ---

  async getFarmerSales(farmerId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // All order items for this farmer's products in last 30 days
    const items = await this.prisma.orderItem.findMany({
      where: {
        product: { farmerId },
        order: { createdAt: { gte: since } },
      },
      include: {
        order: { select: { createdAt: true, status: true } },
        product: { select: { name: true } },
      },
    });

    // Group revenue by date (YYYY-MM-DD)
    const byDay: Record<string, number> = {};
    for (const item of items) {
      const day = item.order.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + item.price * item.quantity;
    }

    // Fill all 30 days
    const salesByDay = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      salesByDay.push({ date: key, revenue: Math.round(byDay[key] ?? 0) });
    }

    // Top products by revenue
    const byProduct: Record<string, { name: string; revenue: number; qty: number }> = {};
    for (const item of items) {
      const pid = item.productId;
      if (!byProduct[pid]) byProduct[pid] = { name: item.product.name, revenue: 0, qty: 0 };
      byProduct[pid].revenue += item.price * item.quantity;
      byProduct[pid].qty += item.quantity;
    }
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));

    // Summary KPIs
    const totalRevenue = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalOrders = new Set(items.map((i) => i.orderId)).size;
    const totalKg = items.reduce((s, i) => s + i.quantity, 0);

    return {
      salesByDay,
      topProducts,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalKg,
      },
    };
  }

  async getFarmerDeliveries(farmerId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        items: { some: { product: { farmerId } } },
        status: { not: 'CANCELLED' },
      },
      select: {
        deliveryCity: true,
        status: true,
        totalAmount: true,
      },
    });

    // Group by city
    const byCity: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      const city = o.deliveryCity || 'Не указан';
      if (!byCity[city]) byCity[city] = { count: 0, revenue: 0 };
      byCity[city].count += 1;
      byCity[city].revenue += o.totalAmount;
    }

    const deliveryByCity = Object.entries(byCity)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([city, d]) => ({ city, count: d.count, revenue: Math.round(d.revenue) }));

    // Status distribution
    const statusMap: Record<string, number> = {};
    for (const o of orders) {
      statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
    }
    const statusDist = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    return { deliveryByCity, statusDist, total: orders.length };
  }

  // Flash Sale: auto-discount products expiring within 48 hours
  @Cron('0 */6 * * *')
  async applyExpirationDiscounts() {
    const now = new Date();
    const threshold48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [activated, deactivated] = await Promise.all([
      this.prisma.product.updateMany({
        where: { expirationDate: { gt: now, lte: threshold48h }, discountActive: false },
        data: { discountActive: true, discountPercent: 30 },
      }),
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
