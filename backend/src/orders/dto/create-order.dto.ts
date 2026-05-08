import { IsArray, IsNumber, IsEnum, ValidateNested, IsString, IsOptional, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '@prisma/client';

class OrderItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @IsEnum(OrderType)
  type!: OrderType;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}