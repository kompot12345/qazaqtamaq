import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

export interface TattibekeResponse {
  reply: string;
  suggestions: string[];
  data?: any;
}

const SYSTEM_PROMPT = `Сен — QazaqTamaq платформасының AI-көмекшісі Таттібексің.
QazaqTamaq — Қазақстанның агротехнологиялық маркетплейсі: фермерлер өз өнімдерін (ет, сүт, т.б.) тікелей сатып алушыларға сатады.

Ережелер:
- Пайдаланушы қай тілде жазса, сол тілде жауап бер (қазақ / орыс / ағылшын)
- Достық, жылы, эмодзимен жауаптар бер
- Тек QazaqTamaq тақырыбына жауап бер: өнімдер, тапсырыстар, фермерлер, жеңілдіктер, платформа
- Жауапты ТІКЕЛЕЙ қысқа сөйлеммен бер, 3-4 сөйлемнен аспасын
- Міндетті түрде JSON форматында жауап бер (басқа ештеңе жоқ):
{"reply":"...жауап мәтіні...","suggestions":["қысқа сұрақ 1","қысқа сұрақ 2","қысқа сұрақ 3"]}`;

@Injectable()
export class ChatService {
  private anthropic: Anthropic | null = null;

  constructor(private prisma: PrismaService) {
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async tattibeke(message: string, userId?: string): Promise<TattibekeResponse> {
    const context = await this.gatherContext(message);
    const userContent = context ? `${message}\n\n[Мәліметмет: ${context}]` : message;

    if (this.anthropic) {
      try {
        const resp = await this.anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userContent }],
        });

        const raw = resp.content[0].type === 'text' ? resp.content[0].text.trim() : '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { reply: parsed.reply ?? raw, suggestions: parsed.suggestions ?? [], data: context ?? undefined };
        }
        return { reply: raw, suggestions: ['Өнімдер?', 'Тапсырыс беру', 'Жеңілдіктер?'] };
      } catch (err) {
        console.warn('[Tattibek] Anthropic API error, falling back to rule-based:', (err as Error).message);
      }
    }

    return this.ruleBased(message, context);
  }

  private async gatherContext(message: string): Promise<string | null> {
    const lower = message.toLowerCase();

    if (lower.includes('өнім') || lower.includes('мясо') || lower.includes('ет') || lower.includes('продукт') || lower.includes('product')) {
      const products = await this.prisma.product.findMany({
        where: { isAvailableRetail: true, retailStock: { gt: 0 } },
        take: 5,
        select: { name: true, retailPrice: true },
      });
      return `Қолжетімді өнімдер: ${products.map((p) => `${p.name} (${p.retailPrice}₸/кг)`).join(', ')}`;
    }

    if (lower.includes('жеңілдік') || lower.includes('скидка') || lower.includes('арзан') || lower.includes('discount')) {
      const discounted = await this.prisma.product.findMany({ where: { discountActive: true }, take: 5, select: { name: true, retailPrice: true } });
      if (discounted.length > 0) {
        return `Flash Sale өнімдері (−30%): ${discounted.map((p) => `${p.name} → ${Math.round(p.retailPrice * 0.7)}₸`).join(', ')}`;
      }
      return 'Қазір белсенді жеңілдіктер жоқ';
    }

    if (lower.includes('фермер') || lower.includes('шаруа') || lower.includes('farmer')) {
      const count = await this.prisma.farm.count({ where: { verifiedAt: { not: null } } }).catch(() => 0);
      return `Верификацияланған фермерлер: ${count}`;
    }

    if (lower.includes('сүт') || lower.includes('молоко') || lower.includes('dairy')) {
      const dairy = await this.prisma.product.findMany({
        where: { category: { slug: 'dairy' }, retailStock: { gt: 0 } },
        take: 5,
        select: { name: true, retailPrice: true },
      });
      return dairy.length > 0
        ? `Сүт өнімдері: ${dairy.map((p) => `${p.name} (${p.retailPrice}₸)`).join(', ')}`
        : 'Қазір сүт өнімдері жоқ';
    }

    return null;
  }

  private ruleBased(message: string, context: string | null): TattibekeResponse {
    const lower = message.toLowerCase();

    if (lower.includes('сәлем') || lower.includes('привет') || lower.includes('hello')) {
      return { reply: 'Сәлем! Мен Таттібек 🌾 — QazaqTamaq-тың AI-көмекшісімін. Өнімдер, тапсырыстар немесе жеңілдіктер туралы сұраңыз!', suggestions: ['Өнімдер қандай?', 'Жеңілдіктер бар ма?', 'Ашуата ойыны?'] };
    }
    if (context) {
      return { reply: `Міне ақпарат: ${context} 📋`, suggestions: ['Тапсырыс беру', 'Барлық өнімдер', 'Фермерлер'] };
    }
    if (lower.includes('ашуата') || lower.includes('asyq') || lower.includes('ойын')) {
      return { reply: 'Ашуата ойыны — 30 секундта ашу тас лақтырып Номад Кредиттер жинайсыз! 🎮 80+ ұпай → 15% жеңілдік, 50+ → 10%, 20+ → 5%.', suggestions: ['Ойнауға өту', 'Жетекшілер', 'Өнімдерге өту'] };
    }
    return { reply: 'Кешіріңіз, сұрағыңызды түсінбедім 🤔 Мына тақырыптар бойынша сұраңыз:', suggestions: ['Өнімдер қандай?', 'Жеңілдіктер бар ма?', 'Тапсырыс беру'] };
  }
}
