import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'farmer@qazaqtamaq.kz',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'Ақтоты Бай',
    description: 'Full name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: ['FARMER', 'B2B_BUYER', 'B2C_BUYER'],
    example: 'FARMER',
    description: 'User role',
  })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({
    example: '091550002451',
    description: 'Tax ID (BIN for businesses/farmers)',
    required: false,
  })
  @IsOptional()
  @IsString()
  binIin?: string;

  @ApiProperty({
    example: 'ул. Сарыарқа, 15, Алматы',
    description: 'Address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'Алматы',
    description: 'City',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    example: '+7 700 123 4567',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}