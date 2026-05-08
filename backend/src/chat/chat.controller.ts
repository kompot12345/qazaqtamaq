import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('tattibek')
  @ApiOperation({ summary: 'Message Tattibek AI assistant' })
  tattibek(@Body() body: { message: string }, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.chatService.tattibeke(body.message ?? '', userId);
  }
}
