import { Injectable } from '@nestjs/common';

const CREDIT_TIERS = [
  { minScore: 80, credits: 100, discount: 15 },
  { minScore: 50, credits: 50, discount: 10 },
  { minScore: 20, credits: 20, discount: 5 },
  { minScore: 0, credits: 5, discount: 2 },
];

function generateCode(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

@Injectable()
export class GamificationService {
  claim(userId: string, score: number, duration: number) {
    const tier = CREDIT_TIERS.find((t) => score >= t.minScore) ?? CREDIT_TIERS[3];
    const code = generateCode('NOMAD');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    return {
      userId,
      score,
      duration,
      nomadCredits: tier.credits,
      discountPercent: tier.discount,
      discountCode: code,
      expiresAt,
      message:
        score >= 80
          ? 'Сенсей деңгейі! Сіз нағыз ашуаға лайықсыз!'
          : score >= 50
            ? 'Жақсы ойын! Номад кредиттері берілді.'
            : 'Жалғастырыңыз! Келесі жолы жақсырақ болады.',
    };
  }

  getLeaderboard() {
    return {
      entries: [
        { rank: 1, name: 'Ақтоты Б.', score: 94, credits: 100 },
        { rank: 2, name: 'Нұрбол Е.', score: 87, credits: 100 },
        { rank: 3, name: 'Аяғоз А.', score: 72, credits: 50 },
      ],
    };
  }
}
