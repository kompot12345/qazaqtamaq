import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import type { Request } from 'express';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create order' })
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    return this.ordersService.create(dto, (req.user as { id: string }).id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my orders as buyer' })
  findMy(@Req() req: Request) {
    return this.ordersService.findMy((req.user as { id: string }).id);
  }

  @Get('farmer/incoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get incoming orders for farmer products' })
  getFarmerOrders(@Req() req: Request) {
    return this.ordersService.getFarmerOrders((req.user as { id: string }).id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update order status (farmer or admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: OrderStatus },
    @Req() req: Request,
  ) {
    return this.ordersService.updateStatus(id, status, (req.user as { id: string }).id);
  }
}