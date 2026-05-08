import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, products: { take: 10 } },
    });
  }
}
