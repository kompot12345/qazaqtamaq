import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of products' })
  getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    const userRole = (req?.user as any)?.role as Role | undefined;
    if (search) {
      return this.productsService.searchProducts(search, userRole);
    }
    return this.productsService.getProducts(+page, +limit, categoryId, (req?.user as any)?.id, userRole);
  }

  @Get('farmer/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my products (farmer dashboard)' })
  getMyProducts(@Req() req: Request) {
    return this.productsService.getFarmerProducts((req.user as any).id);
  }

  @Get('wholesale')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.B2B_BUYER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get wholesale products' })
  getWholesale() {
    return this.productsService.getProducts(1, 10, undefined, undefined, Role.B2B_BUYER);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for a product' })
  getReviews(@Param('id') id: string) {
    return this.productsService.getReviews(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit a review for a product' })
  createReview(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
    @Req() req: Request,
  ) {
    return this.productsService.createReview(id, (req.user as any).id, body.rating, body.comment);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  getOne(@Param('id') id: string, @Req() req?: Request) {
    return this.productsService.getProductById(id, (req?.user as any)?.role);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: CreateProductDto, @Req() req: Request) {
    return this.productsService.createProduct((req.user as any).id, dto);
  }

  @Patch(':id/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sync dual inventory (retail/export split)' })
  syncInventory(
    @Param('id') id: string,
    @Body() body: { retailStock: number; exportStock: number },
    @Req() req: Request,
  ) {
    return this.productsService.syncInventory(
      id,
      (req.user as any).id,
      body.retailStock,
      body.exportStock,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: Request) {
    return this.productsService.updateProduct(id, (req.user as any).id, (req.user as any).role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.productsService.deleteProduct(id, (req.user as any).id, (req.user as any).role);
  }
}
