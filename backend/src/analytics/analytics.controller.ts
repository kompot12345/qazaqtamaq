import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('restock-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restock report' })
  getRestockReport() {
    return this.analyticsService.getRestockReport();
  }

  @Get('export-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get export stats' })
  getExportStats() {
    return this.analyticsService.getExportStats();
  }

  @Get('trigger-expiration-guard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger expiration discount cron' })
  triggerExpirationGuard() {
    return this.analyticsService.triggerExpirationGuard();
  }
}