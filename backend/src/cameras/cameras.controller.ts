import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';

@ApiTags('cameras')
@Controller('cameras')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FARMER)
@ApiBearerAuth()
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  @ApiOperation({ summary: 'List farmer camera feeds' })
  findAll(@Req() req: Request) {
    return this.camerasService.findAll((req.user as any).id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a camera feed' })
  create(@Req() req: Request, @Body() body: { name: string; streamUrl: string; location?: string }) {
    return this.camerasService.create((req.user as any).id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a camera feed' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { name?: string; streamUrl?: string; location?: string; isActive?: boolean },
  ) {
    return this.camerasService.update(id, (req.user as any).id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a camera feed' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.camerasService.remove(id, (req.user as any).id);
  }
}
