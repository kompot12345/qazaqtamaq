import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Рибай (Ребро)',
    description: 'Product name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Премиум говядина, трава-вскормленная',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'beef-category-id',
    description: 'Category ID',
  })
  @IsString()
  categoryId!: string;

  @ApiProperty({
    example: 3500,
    description: 'Retail price in Tenge (₸)',
  })
  @IsNumber()
  @Min(0)
  retailPrice!: number;

  @ApiProperty({
    example: 2800,
    description: 'Wholesale price in Tenge (₸)',
  })
  @IsNumber()
  @Min(0)
  wholesalePrice!: number;

  @ApiProperty({
    example: 2200,
    description: 'Export price in Tenge (₸)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exportPrice?: number;

  @ApiProperty({
    example: 25,
    description: 'Retail stock quantity',
  })
  @IsNumber()
  @Min(0)
  retailStock!: number;

  @ApiProperty({
    example: 100,
    description: 'Export stock quantity',
  })
  @IsNumber()
  @Min(0)
  exportStock!: number;

  @ApiProperty({
    example: 50,
    description: 'Minimum order quantity for export',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  moq?: number;

  @ApiProperty({
    example: '6%',
    description: 'Fat content percentage',
    required: false,
  })
  @IsOptional()
  @IsString()
  fatContent?: string;

  @ApiProperty({
    example: 'Трава-вскормленная',
    description: 'Feeding type (e.g., Grass-fed, Organic)',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedingType?: string;

  @ApiProperty({
    example: '2026-05-30T23:59:59Z',
    description: 'Expiration date (ISO 8601 format)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    description: 'Product image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Is available for retail',
  })
  @IsOptional()
  @IsBoolean()
  isAvailableRetail?: boolean;

  @ApiProperty({
    example: true,
    description: 'Is available for export',
  })
  @IsOptional()
  @IsBoolean()
  isAvailableExport?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retailPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exportPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retailStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exportStock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailableRetail?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableExport?: boolean;
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  retailPrice!: number;

  @ApiProperty()
  wholesalePrice!: number;

  @ApiProperty()
  exportPrice?: number;

  @ApiProperty()
  retailStock!: number;

  @ApiProperty()
  exportStock!: number;

  @ApiProperty()
  discountActive!: boolean;

  @ApiProperty()
  discountPercent!: number;

  @ApiProperty()
  daysUntilExpiry?: number;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  isVerified!: boolean;
}