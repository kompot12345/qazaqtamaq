import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  async findAll(farmerId: string) {
    return this.prisma.cameraFeed.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(farmerId: string, data: { name: string; streamUrl: string; location?: string }) {
    return this.prisma.cameraFeed.create({
      data: { ...data, farmerId },
    });
  }

  async update(id: string, farmerId: string, data: { name?: string; streamUrl?: string; location?: string; isActive?: boolean }) {
    const cam = await this.prisma.cameraFeed.findUnique({ where: { id } });
    if (!cam) throw new NotFoundException('Camera not found');
    if (cam.farmerId !== farmerId) throw new ForbiddenException();
    return this.prisma.cameraFeed.update({ where: { id }, data });
  }

  async remove(id: string, farmerId: string) {
    const cam = await this.prisma.cameraFeed.findUnique({ where: { id } });
    if (!cam) throw new NotFoundException('Camera not found');
    if (cam.farmerId !== farmerId) throw new ForbiddenException();
    return this.prisma.cameraFeed.delete({ where: { id } });
  }
}
