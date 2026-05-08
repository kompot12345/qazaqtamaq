import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'farmer@qazaqtamaq.kz',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    example: {
      id: 'user-id-123',
      email: 'farmer@qazaqtamaq.kz',
      name: 'Ақтоты Бай',
      role: 'FARMER',
      isVerified: true,
    },
    description: 'User information',
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
}