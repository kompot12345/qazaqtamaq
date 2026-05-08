import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Claim Nomad Credits after Asyq-Atu game' })
  claim(
    @Body() body: { score: number; duration: number },
    @Req() req: Request,
  ) {
    return this.gamificationService.claim(
      (req.user as any).id,
      body.score ?? 0,
      body.duration ?? 30,
    );
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get Asyq-Atu top players' })
  getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }
}
