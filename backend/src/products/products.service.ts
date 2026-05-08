import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all products with pagination, filtering, and role-based pricing
   * DUAL-INVENTORY LOGIC: B2C buyers only see products with retailStock > 0
   * B2B buyers see export prices and exportStock
   */
  async getProducts(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    userId?: string,
    userRole?: Role,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // DUAL-INVENTORY: Role-based filtering
    if (userRole === Role.B2C_BUYER) {
      where.isAvailableRetail = true;
      where.retailStock = { gt: 0 };
    } else if (userRole === Role.B2B_BUYER) {
      where.isAvailableExport = true;
      where.exportStock = { gt: 0 };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          farmer: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Apply Expiration Guard and role-specific pricing
    const enrichedProducts = products.map((product) => ({
      ...product,
      price: this.getPriceByRole(product, userRole),
      daysUntilExpiry: this.calculateDaysUntilExpiry(product.expirationDate),
      discountActive: this.checkExpirationGuard(product.expirationDate),
    }));

    return {
      data: enrichedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string, userRole?: Role) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        farmer: { select: { id: true, name: true, email: true, address: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      price: this.getPriceByRole(product, userRole),
      daysUntilExpiry: this.calculateDaysUntilExpiry(product.expirationDate),
      discountActive: this.checkExpirationGuard(product.expirationDate),
      averageRating: product.reviews.length > 0
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
        : null,
    };
  }

  /**
   * Create new product (FARMER only)
   */
  async createProduct(farmerId: string, dto: CreateProductDto) {
    const farmer = await this.prisma.user.findUnique({
      where: { id: farmerId },
    });

    if (!farmer || farmer.role !== Role.FARMER) {
      throw new ForbiddenException('Only farmers can create products');
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        farmerId,
        retailPrice: dto.retailPrice,
        wholesalePrice: dto.wholesalePrice,
        exportPrice: dto.exportPrice || dto.wholesalePrice,
        retailStock: dto.retailStock,
        exportStock: dto.exportStock,
        moq: dto.moq,
        fatContent: dto.fatContent,
        feedingType: dto.feedingType,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        imageUrl: dto.imageUrl,
        isAvailableRetail: dto.isAvailableRetail !== false,
        isAvailableExport: dto.isAvailableExport || false,
      },
      include: { category: true, farmer: { select: { name: true } } },
    });

    return product;
  }

  /**
   * Update product (FARMER or ADMIN only)
   */
  async updateProduct(productId: string, userId: string, userRole: Role, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userRole !== Role.ADMIN && product.farmerId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: dto,
      include: { category: true },
    });

    return updated;
  }

  /**
   * Delete product (FARMER or ADMIN only)
   */
  async deleteProduct(productId: string, userId: string, userRole: Role) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userRole !== Role.ADMIN && product.farmerId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get products by farmer (farmer dashboard)
   */
  async getFarmerProducts(farmerId: string) {
    return this.prisma.product.findMany({
      where: { farmerId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * EXPIRATION GUARD: Check if product is within 5 days of expiry
   */
  private checkExpirationGuard(expirationDate: Date | null): boolean {
    if (!expirationDate) return false;

    const now = new Date();
    const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry <= 5 && daysUntilExpiry > 0;
  }

  /**
   * Calculate days until expiry
   */
  private calculateDaysUntilExpiry(expirationDate: Date | null): number | null {
    if (!expirationDate) return null;

    const now = new Date();
    const days = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }

  /**
   * Get price based on user role (Dynamic Pricing Service)
   */
  private getPriceByRole(product: any, role?: Role): number {
    let basePrice: number;

    switch (role) {
      case Role.B2C_BUYER:
        basePrice = product.retailPrice;
        // EXPIRATION GUARD: 30% discount for B2C buyers
        if (this.checkExpirationGuard(product.expirationDate)) {
          basePrice = basePrice * 0.7;
        }
        break;
      case Role.B2B_BUYER:
        basePrice = product.wholesalePrice;
        break;
      default:
        basePrice = product.exportPrice || product.wholesalePrice;
    }

    return Math.round(basePrice * 100) / 100;
  }

  /**
   * DUAL-INVENTORY SYNC: Farmer allocates total stock between retail and export
   */
  async syncInventory(
    productId: string,
    farmerId: string,
    retailStock: number,
    exportStock: number,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });

    if (!product) throw new NotFoundException('Product not found');
    if (product.farmerId !== farmerId)
      throw new ForbiddenException('You can only manage your own products');

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        retailStock,
        exportStock,
        isAvailableRetail: retailStock > 0,
        isAvailableExport: exportStock > 0,
      },
    });
  }

  /**
   * Get reviews for a product
   */
  async getReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a review (one per user per product)
   */
  async createReview(productId: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

    const existing = await this.prisma.review.findFirst({ where: { productId, userId } });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.review.create({
      data: { productId, userId, rating, comment, isVerifiedPurchase: false },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  /**
   * Search products
   */
  async searchProducts(query: string, userRole?: Role) {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (userRole === Role.B2C_BUYER) {
      where.AND = [
        { isAvailableRetail: true },
        { retailStock: { gt: 0 } },
      ];
    } else if (userRole === Role.B2B_BUYER) {
      where.AND = [
        { isAvailableExport: true },
        { exportStock: { gt: 0 } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      take: 20,
      include: {
        category: true,
        farmer: { select: { name: true } },
      },
    });
  }
}