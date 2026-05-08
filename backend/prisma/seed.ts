/**
 * Seed script for QazaqTamaq database
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role, OrderType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding QazaqTamaq database...');

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // ─── Categories ───────────────────────────────────────────────────────────

  // Root categories
  const catMeat = await prisma.category.create({
    data: { name: 'Мясо', slug: 'meat', description: 'Свежее мясо от казахстанских фермеров' },
  });
  const catDairy = await prisma.category.create({
    data: { name: 'Сүт өнімдері', slug: 'dairy', description: 'Свежие молочные и кисломолочные продукты' },
  });
  const catGrain = await prisma.category.create({
    data: { name: 'Дәнді-дақылдар', slug: 'grain', description: 'Зерновые и бобовые культуры' },
  });
  const catVeg = await prisma.category.create({
    data: { name: 'Көкөністер', slug: 'vegetables', description: 'Свежие овощи с казахстанских полей' },
  });
  const catFruit = await prisma.category.create({
    data: { name: 'Жемістер', slug: 'fruits', description: 'Сезонные фрукты и ягоды' },
  });
  const catEggs = await prisma.category.create({
    data: { name: 'Жұмыртқа', slug: 'eggs', description: 'Свежие яйца от фермерских птицефабрик' },
  });
  const catHoney = await prisma.category.create({
    data: { name: 'Бал өнімдері', slug: 'honey', description: 'Натуральный мёд и продукты пчеловодства' },
  });
  const catTraditional = await prisma.category.create({
    data: { name: 'Дәстүрлі өнімдер', slug: 'traditional', description: 'Традиционные казахские продукты' },
  });

  // Meat sub-categories
  const catBeef = await prisma.category.create({
    data: { name: 'Сиыр еті (Говядина)', slug: 'beef', parentId: catMeat.id, description: 'Качественная казахстанская говядина' },
  });
  const catLamb = await prisma.category.create({
    data: { name: 'Қой еті (Баранина)', slug: 'lamb', parentId: catMeat.id, description: 'Нежная баранина с предгорий и степей' },
  });
  const catHorse = await prisma.category.create({
    data: { name: 'Жылқы еті (Конина)', slug: 'horse-meat', parentId: catMeat.id, description: 'Традиционная казахская конина и деликатесы' },
  });
  const catPoultry = await prisma.category.create({
    data: { name: 'Құс еті (Птица)', slug: 'poultry', parentId: catMeat.id, description: 'Домашняя птица — курица, индейка' },
  });

  // Dairy sub-categories
  const catMilk = await prisma.category.create({
    data: { name: 'Сүт (Молоко)', slug: 'milk', parentId: catDairy.id, description: 'Свежее цельное молоко' },
  });
  const catFermented = await prisma.category.create({
    data: { name: 'Ашытқы өнімдер', slug: 'fermented-dairy', parentId: catDairy.id, description: 'Кефир, айран, қаймақ' },
  });
  const catCheese = await prisma.category.create({
    data: { name: 'Ірімшік (Сыр)', slug: 'cheese', parentId: catDairy.id, description: 'Домашние и фермерские сыры' },
  });

  console.log('✅ Created 15 categories');

  // ─── Users ────────────────────────────────────────────────────────────────

  const farmerPw = await bcrypt.hash('password123', 10);
  const buyerPw = await bcrypt.hash('buyer123', 10);
  const adminPw = await bcrypt.hash('admin123', 10);

  // Farmer 1 — Алматы, beef specialist
  const farmer1 = await prisma.user.create({
    data: {
      email: 'farmer@qazaqtamaq.kz',
      passwordHash: farmerPw,
      name: 'Ақтоты Бай',
      phone: '+7 700 123 4567',
      role: Role.FARMER,
      binIin: '091550002451',
      address: 'ауыл Ақши, Алматы облысы',
      city: 'Алматы',
      isVerified: true,
    },
  });

  // Farmer 2 — Капшагай, dairy specialist
  const farmer2 = await prisma.user.create({
    data: {
      email: 'farmer2@qazaqtamaq.kz',
      passwordHash: farmerPw,
      name: 'Нұрбол Еспеев',
      phone: '+7 700 234 5678',
      role: Role.FARMER,
      binIin: '091550002452',
      address: 'Қапшағай қаласы',
      city: 'Қапшағай',
      isVerified: true,
    },
  });

  // Farmer 3 — Шымкент, traditional meats (kazy, lamb, shubat)
  const farmer3 = await prisma.user.create({
    data: {
      email: 'farmer3@qazaqtamaq.kz',
      passwordHash: farmerPw,
      name: 'Аманжол Сейітов',
      phone: '+7 701 345 6789',
      role: Role.FARMER,
      binIin: '091550002453',
      address: 'Сайрам ауданы, Шымкент облысы',
      city: 'Шымкент',
      isVerified: true,
    },
  });

  // Farmer 4 — Қарағанды, grains & vegetables
  const farmer4 = await prisma.user.create({
    data: {
      email: 'farmer4@qazaqtamaq.kz',
      passwordHash: farmerPw,
      name: 'Гүлмира Нұрқызы',
      phone: '+7 702 456 7890',
      role: Role.FARMER,
      binIin: '091550002454',
      address: 'Нұра ауданы, Қарағанды облысы',
      city: 'Қарағанды',
      isVerified: true,
    },
  });

  // Farmer 5 — Өскемен, honey & fruits
  const farmer5 = await prisma.user.create({
    data: {
      email: 'farmer5@qazaqtamaq.kz',
      passwordHash: farmerPw,
      name: 'Берік Жаксыбеков',
      phone: '+7 705 567 8901',
      role: Role.FARMER,
      binIin: '091550002455',
      address: 'Алтай ауылы, Өскемен облысы',
      city: 'Өскемен',
      isVerified: true,
    },
  });

  const b2bBuyer = await prisma.user.create({
    data: {
      email: 'b2b@wholesale.kz',
      passwordHash: buyerPw,
      name: 'ТОО Балта Трейд',
      phone: '+7 700 555 6666',
      role: Role.B2B_BUYER,
      binIin: '091550003333',
      address: 'Абай даңғылы, 100, Алматы',
      city: 'Алматы',
      isVerified: true,
    },
  });

  const b2cBuyer = await prisma.user.create({
    data: {
      email: 'ayagoz@gmail.com',
      passwordHash: buyerPw,
      name: 'Аяғоз Айтенова',
      phone: '+7 705 777 8888',
      role: Role.B2C_BUYER,
      address: 'Төле би көшесі, 50, Алматы',
      city: 'Алматы',
      isVerified: false,
    },
  });

  const b2cBuyer2 = await prisma.user.create({
    data: {
      email: 'daniyar@gmail.com',
      passwordHash: buyerPw,
      name: 'Данияр Сейтқали',
      phone: '+7 707 888 9999',
      role: Role.B2C_BUYER,
      address: 'Достық даңғылы, 123, Алматы',
      city: 'Алматы',
      isVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@qazaqtamaq.kz',
      passwordHash: adminPw,
      name: 'Администратор',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log('✅ Created 8 users (5 Farmers, 2 B2C, 1 B2B, 1 Admin)');

  // ─── Farms ────────────────────────────────────────────────────────────────

  const farm1 = await prisma.farm.create({
    data: {
      userId: farmer1.id,
      licenseUrl: 'https://example.com/license1.pdf',
      description: 'Дәстүрлі қазақ шаруашылығы. 25 жылдық тәжірибе. Органикалық сиыр еті өндіреміз.',
      location: 'Алматы облысы, Ақши ауылы',
      rating: 4.8,
      totalReviews: 45,
      verifiedAt: new Date(),
    },
  });

  const farm2 = await prisma.farm.create({
    data: {
      userId: farmer2.id,
      licenseUrl: 'https://example.com/license2.pdf',
      description: 'А класынды сүт фермасы. ISO 9001 сертификатталған. Күнделікті сауу.',
      location: 'Қапшағай, Алматы облысы',
      rating: 4.9,
      totalReviews: 78,
      verifiedAt: new Date(),
    },
  });

  const farm3 = await prisma.farm.create({
    data: {
      userId: farmer3.id,
      licenseUrl: 'https://example.com/license3.pdf',
      description: 'Дәстүрлі қазақ тағамдарын өндіреміз — қазы, жая, шұжық. Оңтүстік Қазақстанның дәмі.',
      location: 'Шымкент, Сайрам ауданы',
      rating: 4.7,
      totalReviews: 62,
      verifiedAt: new Date(),
    },
  });

  const farm4 = await prisma.farm.create({
    data: {
      userId: farmer4.id,
      licenseUrl: 'https://example.com/license4.pdf',
      description: 'Органикалық егін шаруашылығы. Астық, көкөніс, бұршақ дақылдары. Пестицидсіз өнімдер.',
      location: 'Қарағанды, Нұра ауданы',
      rating: 4.6,
      totalReviews: 31,
      verifiedAt: new Date(),
    },
  });

  const farm5 = await prisma.farm.create({
    data: {
      userId: farmer5.id,
      licenseUrl: 'https://example.com/license5.pdf',
      description: 'Алтай тауларының табиғи балы. 200 ұясы бар апиаризм. Өрік, алма, жүзім бақтары.',
      location: 'Өскемен, Алтай ауылы',
      rating: 4.9,
      totalReviews: 93,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created 5 farm profiles');

  // ─── Products ─────────────────────────────────────────────────────────────

  const d = (days: number) => new Date(Date.now() + days * 86_400_000);

  // ── BEEF (farmer1) ────────────────────────────────────────────────────────

  const pRibeye = await prisma.product.create({
    data: {
      name: 'Қабырға (Рибай)',
      description: 'Премиум сиыр қабырғасы, шөппен қоректендірілген, мраморлылық 5-6. Гриль немесе пеш үшін ең жақсы таңдау.',
      categoryId: catBeef.id,
      farmerId: farmer1.id,
      retailPrice: 3500,
      wholesalePrice: 2800,
      exportPrice: 2200,
      retailStock: 30,
      exportStock: 200,
      moq: 50,
      fatContent: '6%',
      feedingType: 'Шөппен қоректендірілген',
      expirationDate: d(7),
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pFillet = await prisma.product.create({
    data: {
      name: 'Белі (Вырезка)',
      description: 'Жұмсақ филе, стейк үшін идеал. Майлылығы аз, жоғары ақуыз.',
      categoryId: catBeef.id,
      farmerId: farmer1.id,
      retailPrice: 5200,
      wholesalePrice: 4200,
      exportPrice: 3300,
      retailStock: 15,
      exportStock: 80,
      moq: 30,
      fatContent: '3%',
      feedingType: 'Шөппен қоректендірілген',
      expirationDate: d(3),
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
      discountActive: true,
      discountPercent: 30,
    },
  });

  const pBrisket = await prisma.product.create({
    data: {
      name: 'Кеуде еті (Грудинка)',
      description: 'Дәмді кеуде еті, ұзақ пісіру үшін тамаша. Сорпа мен бесбармақ үшін жиі пайдаланылады.',
      categoryId: catBeef.id,
      farmerId: farmer1.id,
      retailPrice: 2200,
      wholesalePrice: 1800,
      exportPrice: 1400,
      retailStock: 40,
      exportStock: 150,
      moq: 40,
      fatContent: '8%',
      feedingType: 'Аралас қоректендіру',
      expirationDate: d(6),
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pMinced = await prisma.product.create({
    data: {
      name: 'Сиыр еті фаршы',
      description: 'Таза сиыр еті фаршы, тұздалмаған. Манты, тұшпара, котлет үшін.',
      categoryId: catBeef.id,
      farmerId: farmer1.id,
      retailPrice: 1800,
      wholesalePrice: 1450,
      exportPrice: 1100,
      retailStock: 50,
      exportStock: 300,
      moq: 50,
      fatContent: '15%',
      feedingType: 'Аралас қоректендіру',
      expirationDate: d(2),
      imageUrl: 'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
      discountActive: true,
      discountPercent: 20,
    },
  });

  const pLiver = await prisma.product.create({
    data: {
      name: 'Сиыр бауыры',
      description: 'Жаңа сиыр бауыры, темірге бай. Куырдак үшін дәстүрлі таңдау.',
      categoryId: catBeef.id,
      farmerId: farmer1.id,
      retailPrice: 900,
      wholesalePrice: 720,
      exportPrice: 550,
      retailStock: 20,
      exportStock: 80,
      moq: 20,
      expirationDate: d(2),
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  // ── LAMB (farmer3) ────────────────────────────────────────────────────────

  const pLambLeg = await prisma.product.create({
    data: {
      name: 'Қой санжілігі (Баранья нога)',
      description: 'Бүтін қой санжілігі. Тойларға арналған ең дәмді ет. Ауыл шаруашылығы малы.',
      categoryId: catLamb.id,
      farmerId: farmer3.id,
      retailPrice: 3200,
      wholesalePrice: 2600,
      exportPrice: 2000,
      retailStock: 20,
      exportStock: 100,
      moq: 30,
      fatContent: '12%',
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(5),
      imageUrl: 'https://images.unsplash.com/photo-1602473525002-5eae3b3e1ad4?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pLambRack = await prisma.product.create({
    data: {
      name: 'Қой арқасы (Корейка)',
      description: 'Премиум қой арқасы, 8 қабырға. Мейрамханалар үшін таңдаулы кесілген ет.',
      categoryId: catLamb.id,
      farmerId: farmer3.id,
      retailPrice: 4200,
      wholesalePrice: 3400,
      exportPrice: 2700,
      retailStock: 12,
      exportStock: 60,
      moq: 20,
      fatContent: '9%',
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(5),
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pLambMinced = await prisma.product.create({
    data: {
      name: 'Қой еті фаршы',
      description: 'Таза қой еті фаршы. Шашлык, манты, тұшпара жасауға өте ыңғайлы.',
      categoryId: catLamb.id,
      farmerId: farmer3.id,
      retailPrice: 2400,
      wholesalePrice: 1950,
      exportPrice: 1500,
      retailStock: 35,
      exportStock: 200,
      moq: 50,
      fatContent: '18%',
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(3),
      imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── HORSE MEAT / TRADITIONAL (farmer3) ───────────────────────────────────

  const pKazy = await prisma.product.create({
    data: {
      name: 'Қазы (Жылқы шұжығы)',
      description: 'Дәстүрлі қазақ қазы шұжығы, жылқы қабырға еті мен майынан жасалған. Наурыз мерекесіне, тойларға арналған.',
      categoryId: catHorse.id,
      farmerId: farmer3.id,
      retailPrice: 5500,
      wholesalePrice: 4500,
      exportPrice: 3600,
      retailStock: 15,
      exportStock: 60,
      moq: 20,
      fatContent: '28%',
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(14),
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pZhaya = await prisma.product.create({
    data: {
      name: 'Жая (Тұздалған жылқы еті)',
      description: 'Жылқының жамбас бөлігінен дайындалған дәстүрлі тағам. Ерекше дәмі мен хош иісі бар.',
      categoryId: catHorse.id,
      farmerId: farmer3.id,
      retailPrice: 4800,
      wholesalePrice: 3900,
      exportPrice: 3100,
      retailStock: 10,
      exportStock: 40,
      moq: 15,
      fatContent: '22%',
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(21),
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pHorseSausage = await prisma.product.create({
    data: {
      name: 'Шұжық (Жылқы еті)',
      description: 'Үй жасалған жылқы еті шұжығы, таза табиғи қабықта. Тұтқыр заттарсыз.',
      categoryId: catHorse.id,
      farmerId: farmer3.id,
      retailPrice: 3800,
      wholesalePrice: 3100,
      exportPrice: 2500,
      retailStock: 18,
      exportStock: 80,
      moq: 20,
      feedingType: 'Жайылымда өсірілген',
      expirationDate: d(10),
      imageUrl: 'https://images.unsplash.com/photo-1551446591-142875a901a1?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── POULTRY (farmer4) ─────────────────────────────────────────────────────

  const pChicken = await prisma.product.create({
    data: {
      name: 'Бройлер тауық (Бүтін)',
      description: 'Үй тауығы, гормонсыз, зиянды заттарсыз өсірілген. Орташа салмағы 1.8-2.2 кг.',
      categoryId: catPoultry.id,
      farmerId: farmer4.id,
      retailPrice: 1350,
      wholesalePrice: 1080,
      exportPrice: 850,
      retailStock: 40,
      exportStock: 200,
      moq: 50,
      feedingType: 'Органикалық жем',
      expirationDate: d(4),
      imageUrl: 'https://images.unsplash.com/photo-1588347785102-2944b3776c2e?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pChickenBreast = await prisma.product.create({
    data: {
      name: 'Тауық кеудесі (Куриная грудка)',
      description: 'Жаңа тауық кеудесі, тері мен сүйексіз. Дұрыс тамақтану мен спортшыларға арналған.',
      categoryId: catPoultry.id,
      farmerId: farmer4.id,
      retailPrice: 1900,
      wholesalePrice: 1520,
      exportPrice: 1200,
      retailStock: 50,
      exportStock: 250,
      moq: 40,
      fatContent: '1.5%',
      feedingType: 'Органикалық жем',
      expirationDate: d(3),
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── MILK & DAIRY (farmer2) ────────────────────────────────────────────────

  const pMilk = await prisma.product.create({
    data: {
      name: 'Сиыр сүті (Цельное молоко)',
      description: 'Күнделікті сауылатын таза сиыр сүті, 3.6% май. Пастерлеусіз, тікелей фермадан.',
      categoryId: catMilk.id,
      farmerId: farmer2.id,
      retailPrice: 450,
      wholesalePrice: 360,
      exportPrice: 280,
      retailStock: 150,
      exportStock: 600,
      moq: 100,
      fatContent: '3.6%',
      feedingType: 'Табиғи',
      expirationDate: d(3),
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  const pKaymak = await prisma.product.create({
    data: {
      name: 'Қаймақ (Сметана)',
      description: 'Үй қаймағы, 25% майлылық. Бесбармақ, баурсаққа арналған дәстүрлі қаймақ.',
      categoryId: catFermented.id,
      farmerId: farmer2.id,
      retailPrice: 850,
      wholesalePrice: 680,
      exportPrice: 530,
      retailStock: 60,
      exportStock: 200,
      moq: 30,
      fatContent: '25%',
      feedingType: 'Табиғи',
      expirationDate: d(7),
      imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  const pAiran = await prisma.product.create({
    data: {
      name: 'Айран (Кефир)',
      description: 'Дәстүрлі қазақ айраны, живые бактериялар мен пробиотиктер. 2.5% май.',
      categoryId: catFermented.id,
      farmerId: farmer2.id,
      retailPrice: 420,
      wholesalePrice: 340,
      exportPrice: 260,
      retailStock: 100,
      exportStock: 400,
      moq: 50,
      fatContent: '2.5%',
      feedingType: 'Табиғи',
      expirationDate: d(5),
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  const pCottage = await prisma.product.create({
    data: {
      name: 'Сүзбе (Творог)',
      description: 'Жаңа үй сүзбесі, 9% май. Балалар мен спортшылар үшін ақуызға бай тағам.',
      categoryId: catFermented.id,
      farmerId: farmer2.id,
      retailPrice: 700,
      wholesalePrice: 560,
      exportPrice: 430,
      retailStock: 45,
      exportStock: 150,
      moq: 20,
      fatContent: '9%',
      feedingType: 'Табиғи',
      expirationDate: d(4),
      imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  const pButter = await prisma.product.create({
    data: {
      name: 'Сарымай (Сливочное масло)',
      description: 'Табиғи сарымай, 82.5% май. Консерванттар мен бояғыштарсыз.',
      categoryId: catCheese.id,
      farmerId: farmer2.id,
      retailPrice: 1300,
      wholesalePrice: 1040,
      exportPrice: 820,
      retailStock: 30,
      exportStock: 120,
      moq: 20,
      fatContent: '82.5%',
      feedingType: 'Табиғи',
      expirationDate: d(30),
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── TRADITIONAL (farmer3, farmer2) ───────────────────────────────────────

  const pQymyz = await prisma.product.create({
    data: {
      name: 'Қымыз (Кобыл сүтінен)',
      description: 'Дәстүрлі қазақ қымызы, биенің жаңа сауылған сүтінен дайындалған. Маусым: мамыр-тамыз.',
      categoryId: catTraditional.id,
      farmerId: farmer3.id,
      retailPrice: 1400,
      wholesalePrice: 1100,
      exportPrice: 880,
      retailStock: 40,
      exportStock: 0,
      moq: 10,
      fatContent: '1.9%',
      feedingType: 'Табиғи жайылым',
      expirationDate: d(2),
      imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  const pShubat = await prisma.product.create({
    data: {
      name: 'Шұбат (Түйе сүті)',
      description: 'Ашытылған түйе сүті, табиғи пробиотик. Иммунитетті нығайтады, витаминдерге бай.',
      categoryId: catTraditional.id,
      farmerId: farmer3.id,
      retailPrice: 1800,
      wholesalePrice: 1450,
      exportPrice: 1150,
      retailStock: 25,
      exportStock: 60,
      moq: 10,
      fatContent: '4.5%',
      feedingType: 'Табиғи',
      expirationDate: d(3),
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pKurt = await prisma.product.create({
    data: {
      name: 'Құрт (Кептірілген сыр)',
      description: 'Ащы немесе тұздалған құрт шарлары. Ұзақ сақталатын дәстүрлі тағам. 500 г қаптама.',
      categoryId: catTraditional.id,
      farmerId: farmer2.id,
      retailPrice: 2800,
      wholesalePrice: 2240,
      exportPrice: 1780,
      retailStock: 50,
      exportStock: 200,
      moq: 20,
      feedingType: 'Табиғи',
      expirationDate: d(180),
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── GRAINS (farmer4) ──────────────────────────────────────────────────────

  const pWheat = await prisma.product.create({
    data: {
      name: 'Бидай (Пшеница)',
      description: 'Қатты бидай, 1-сорт. Ұн тарту немесе егін үшін. Суармалы жерде өсірілген.',
      categoryId: catGrain.id,
      farmerId: farmer4.id,
      retailPrice: 160,
      wholesalePrice: 130,
      exportPrice: 98,
      retailStock: 500,
      exportStock: 5000,
      moq: 500,
      feedingType: 'Органикалық',
      expirationDate: d(365),
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pBarley = await prisma.product.create({
    data: {
      name: 'Арпа (Ячмень)',
      description: 'Азықтық арпа, жоғары сапалы. Мал азығы немесе алкогольсіз сусын жасауға.',
      categoryId: catGrain.id,
      farmerId: farmer4.id,
      retailPrice: 130,
      wholesalePrice: 105,
      exportPrice: 80,
      retailStock: 400,
      exportStock: 3000,
      moq: 500,
      feedingType: 'Органикалық',
      expirationDate: d(365),
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500',
      isVerified: true,
      isAvailableRetail: false,
      isAvailableExport: true,
    },
  });

  const pMillet = await prisma.product.create({
    data: {
      name: 'Тары (Просо)',
      description: 'Органикалық тары дәні. Борщ, ботқа жасауға немесе мал азығы ретінде.',
      categoryId: catGrain.id,
      farmerId: farmer4.id,
      retailPrice: 200,
      wholesalePrice: 160,
      exportPrice: 125,
      retailStock: 200,
      exportStock: 1500,
      moq: 200,
      feedingType: 'Органикалық',
      expirationDate: d(365),
      imageUrl: 'https://images.unsplash.com/photo-1602347642703-7c787f37b680?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── VEGETABLES (farmer4) ──────────────────────────────────────────────────

  const pPotato = await prisma.product.create({
    data: {
      name: 'Картоп (Картофель)',
      description: 'Қызыл картоп, органикалық өсіру. Тығыз, дәмді. Бесбармак пен сорпаға жақсы.',
      categoryId: catVeg.id,
      farmerId: farmer4.id,
      retailPrice: 190,
      wholesalePrice: 152,
      exportPrice: 115,
      retailStock: 300,
      exportStock: 2000,
      moq: 200,
      feedingType: 'Органикалық',
      expirationDate: d(60),
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pCarrot = await prisma.product.create({
    data: {
      name: 'Сәбіз (Морковь)',
      description: 'Тәтті сәбіз, каротинге бай. Сорпа, плов, салат үшін.',
      categoryId: catVeg.id,
      farmerId: farmer4.id,
      retailPrice: 220,
      wholesalePrice: 175,
      exportPrice: 135,
      retailStock: 200,
      exportStock: 1000,
      moq: 100,
      feedingType: 'Органикалық',
      expirationDate: d(21),
      imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pOnion = await prisma.product.create({
    data: {
      name: 'Пияз (Репчатый лук)',
      description: 'Тіке піяз, өткір дәмі. Барлық тағамдарда қолданылатын негізгі жарма.',
      categoryId: catVeg.id,
      farmerId: farmer4.id,
      retailPrice: 170,
      wholesalePrice: 136,
      exportPrice: 104,
      retailStock: 400,
      exportStock: 2500,
      moq: 200,
      feedingType: 'Органикалық',
      expirationDate: d(45),
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pCabbage = await prisma.product.create({
    data: {
      name: 'Қырыққабат (Капуста)',
      description: 'Ақ қырыққабат, тығыз кочандар. Қышқыл қырыққабат, лагман, борщ үшін.',
      categoryId: catVeg.id,
      farmerId: farmer4.id,
      retailPrice: 160,
      wholesalePrice: 128,
      exportPrice: 98,
      retailStock: 250,
      exportStock: 1500,
      moq: 150,
      feedingType: 'Органикалық',
      expirationDate: d(30),
      imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pTomato = await prisma.product.create({
    data: {
      name: 'Қызанақ (Помидор)',
      description: 'Гүлжайнар (қызанақ) Шымкент сорты, тәтті және шырынды. Тікелей жеу мен дайындауға.',
      categoryId: catVeg.id,
      farmerId: farmer3.id,
      retailPrice: 420,
      wholesalePrice: 336,
      exportPrice: 260,
      retailStock: 100,
      exportStock: 500,
      moq: 100,
      expirationDate: d(7),
      imageUrl: 'https://images.unsplash.com/photo-1546470427-227c4b8b7f5e?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pCucumber = await prisma.product.create({
    data: {
      name: 'Қияр (Огурец)',
      description: 'Жаңа қияр, хош иісті. Тікелей жеу, салат немесе консервілеу үшін.',
      categoryId: catVeg.id,
      farmerId: farmer3.id,
      retailPrice: 350,
      wholesalePrice: 280,
      exportPrice: 215,
      retailStock: 80,
      exportStock: 400,
      moq: 80,
      expirationDate: d(5),
      imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  // ── FRUITS (farmer5) ──────────────────────────────────────────────────────

  const pApple = await prisma.product.create({
    data: {
      name: 'Алма (Яблоки Апорт)',
      description: 'Алматы Апорты — Алматының символы. Ірі, қызыл, тәтті-қышқылды дәм. Тікелей Алтайдан.',
      categoryId: catFruit.id,
      farmerId: farmer5.id,
      retailPrice: 320,
      wholesalePrice: 256,
      exportPrice: 200,
      retailStock: 150,
      exportStock: 800,
      moq: 100,
      feedingType: 'Органикалық',
      expirationDate: d(20),
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pWatermelon = await prisma.product.create({
    data: {
      name: 'Қарбыз (Арбуз)',
      description: 'Шымкент қарбызы, тәтті және суды. Маусым: шілде-қыркүйек. Орташа салмағы 8-12 кг.',
      categoryId: catFruit.id,
      farmerId: farmer3.id,
      retailPrice: 130,
      wholesalePrice: 104,
      exportPrice: 80,
      retailStock: 200,
      exportStock: 1000,
      moq: 200,
      expirationDate: d(14),
      imageUrl: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── HONEY (farmer5) ───────────────────────────────────────────────────────

  const pWildHoney = await prisma.product.create({
    data: {
      name: 'Жабайы гүл балы (Разнотравный мёд)',
      description: 'Алтай тауларының жабайы гүлдерінен жиналған бал. 100% табиғи, ысытылмаған. 1 кг шыны банка.',
      categoryId: catHoney.id,
      farmerId: farmer5.id,
      retailPrice: 3800,
      wholesalePrice: 3040,
      exportPrice: 2400,
      retailStock: 60,
      exportStock: 300,
      moq: 20,
      expirationDate: d(730),
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pBuckwheatHoney = await prisma.product.create({
    data: {
      name: 'Қарабидай балы (Гречишный мёд)',
      description: 'Қарабидай гүлінен жиналған қою қоңыр бал. Темірге бай, антибактериалды қасиеті жоғары.',
      categoryId: catHoney.id,
      farmerId: farmer5.id,
      retailPrice: 4500,
      wholesalePrice: 3600,
      exportPrice: 2900,
      retailStock: 40,
      exportStock: 200,
      moq: 20,
      expirationDate: d(730),
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pPropolis = await prisma.product.create({
    data: {
      name: 'Прополис (Арашай балауыз)',
      description: 'Табиғи прополис, 30% экстракт. Иммунитет, антибактериалды, жараны тез жазады.',
      categoryId: catHoney.id,
      farmerId: farmer5.id,
      retailPrice: 5500,
      wholesalePrice: 4400,
      exportPrice: 3500,
      retailStock: 20,
      exportStock: 100,
      moq: 10,
      expirationDate: d(1095),
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  // ── EGGS (farmer4) ────────────────────────────────────────────────────────

  const pEggs = await prisma.product.create({
    data: {
      name: 'Тауық жұмыртқасы (C0 категория)',
      description: 'Сарауызды үй тауықтарының жұмыртқасы. 10 дана қаптама. Еркін жүрісті тауықтар.',
      categoryId: catEggs.id,
      farmerId: farmer4.id,
      retailPrice: 320,
      wholesalePrice: 256,
      exportPrice: 200,
      retailStock: 500,
      exportStock: 2000,
      moq: 100,
      feedingType: 'Органикалық жем',
      expirationDate: d(25),
      imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9701be63f?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: true,
    },
  });

  const pQuailEggs = await prisma.product.create({
    data: {
      name: 'Бедана жұмыртқасы (Перепелиные)',
      description: 'Бедана жұмыртқасы, 20 дана қаптама. Д витамині мен ақуызға бай, балаларға пайдалы.',
      categoryId: catEggs.id,
      farmerId: farmer4.id,
      retailPrice: 380,
      wholesalePrice: 304,
      exportPrice: 240,
      retailStock: 200,
      exportStock: 800,
      moq: 50,
      feedingType: 'Органикалық жем',
      expirationDate: d(30),
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
      isVerified: true,
      isAvailableRetail: true,
      isAvailableExport: false,
    },
  });

  console.log('✅ Created 35 products across all categories');

  // ─── Reviews ──────────────────────────────────────────────────────────────

  const reviewData = [
    { productId: pRibeye.id, userId: b2cBuyer.id, rating: 5, comment: 'Тамаша сапалы ет! Жаңа және дәмді. Ұсынамын!', isVerifiedPurchase: true },
    { productId: pRibeye.id, userId: b2bBuyer.id, rating: 4, comment: 'Сенімді жеткізуші, тұрақты сапа. Ай сайын тапсырыс береміз.', isVerifiedPurchase: true },
    { productId: pRibeye.id, userId: b2cBuyer2.id, rating: 5, comment: 'Мраморлы ет стейкке керемет! Отбасым өте жақсы көрді.', isVerifiedPurchase: true },
    { productId: pFillet.id, userId: b2cBuyer.id, rating: 5, comment: 'Ең жұмсақ ет осы! Балалар да жақсы жеді.', isVerifiedPurchase: true },
    { productId: pKazy.id, userId: b2cBuyer2.id, rating: 5, comment: 'Наурыз дастарқанында қоямыз! Нағыз дәстүрлі дәм.', isVerifiedPurchase: true },
    { productId: pKazy.id, userId: b2cBuyer.id, rating: 4, comment: 'Дәмді, бірақ бағасы біраз қымбат. Сапасы жоғары.', isVerifiedPurchase: false },
    { productId: pQymyz.id, userId: b2cBuyer.id, rating: 5, comment: 'Нағыз қымыз! Базардағыдан мың есе жақсы. Осы жазда жиі алдым.', isVerifiedPurchase: true },
    { productId: pQymyz.id, userId: b2cBuyer2.id, rating: 5, comment: 'Салауатты тіршілік үшін міндетті тағам! Сіңімді, дәмді.', isVerifiedPurchase: true },
    { productId: pMilk.id, userId: b2cBuyer.id, rating: 5, comment: 'Таза сүт, жаңа. Балаларыма береміз.', isVerifiedPurchase: true },
    { productId: pMilk.id, userId: b2cBuyer2.id, rating: 4, comment: 'Сапасы жақсы, жеткізу уақытылы. Алдағы уақытта да алатынбыз.', isVerifiedPurchase: true },
    { productId: pKurt.id, userId: b2cBuyer.id, rating: 5, comment: 'Ешбір қоспасыз табиғи құрт. Дала дәмі. Алыс туыстарыма сыйлыққа алдым.', isVerifiedPurchase: true },
    { productId: pWildHoney.id, userId: b2cBuyer2.id, rating: 5, comment: 'Алтай балы дегенде шын! Таза, хош иісті. Бүкіл отбасы жейміз.', isVerifiedPurchase: true },
    { productId: pWildHoney.id, userId: b2cBuyer.id, rating: 5, comment: 'Бұл балды тапқаным бақыт! Тамаша сапа, жылдам жеткізу.', isVerifiedPurchase: true },
    { productId: pApple.id, userId: b2cBuyer.id, rating: 5, comment: 'Нағыз Алматы Апорты! Базардан алып жүргенімнен анағұрлым дәмді.', isVerifiedPurchase: true },
    { productId: pLambLeg.id, userId: b2bBuyer.id, rating: 4, comment: 'Мейрамхана үшін тұрақты тапсырыс береміз. Сапа тұрақты.', isVerifiedPurchase: true },
    { productId: pChickenBreast.id, userId: b2cBuyer2.id, rating: 4, comment: 'Спорт тамағы үшін тамаша. Жаңа, таза.', isVerifiedPurchase: true },
    { productId: pBuckwheatHoney.id, userId: b2cBuyer2.id, rating: 5, comment: 'Қою, хош иісті, нағыз гречишный бал! Тамыздан тапсырыс беріп жүрмін.', isVerifiedPurchase: true },
    { productId: pEggs.id, userId: b2cBuyer.id, rating: 5, comment: 'Сарауызы қоңыр-қызыл, нағыз үй жұмыртқасы. Супермаркеттен алмаймыз енді.', isVerifiedPurchase: true },
    { productId: pShubat.id, userId: b2cBuyer2.id, rating: 5, comment: 'Аурудан кейін иммунитет үшін ішемін. Шынымен көмектесті!', isVerifiedPurchase: true },
    { productId: pKaymak.id, userId: b2cBuyer.id, rating: 5, comment: 'Бесбармаққа тамаша қаймақ! Дәмі шынайы, үй қаймағы тәрізді.', isVerifiedPurchase: true },
  ];

  for (const r of reviewData) {
    await prisma.review.create({ data: r });
  }

  console.log(`✅ Created ${reviewData.length} reviews`);

  // ─── Orders ───────────────────────────────────────────────────────────────

  const order1 = await prisma.order.create({
    data: {
      userId: b2cBuyer.id,
      type: OrderType.RETAIL,
      status: 'DELIVERED',
      totalAmount: 12300,
      deliveryAddress: 'Төле би көшесі, 50, пәтер 12',
      deliveryCity: 'Алматы',
      phone: '+7 705 777 8888',
    },
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: pRibeye.id, quantity: 2, price: 3500 },
      { orderId: order1.id, productId: pMilk.id, quantity: 3, price: 450 },
      { orderId: order1.id, productId: pEggs.id, quantity: 5, price: 320 },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      userId: b2bBuyer.id,
      type: OrderType.EXPORT,
      status: 'CONFIRMED',
      totalAmount: 440000,
      deliveryAddress: 'Порт терминалы, Ақтау',
      deliveryCity: 'Ақтау',
      phone: '+7 700 555 6666',
    },
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: order2.id, productId: pRibeye.id, quantity: 100, price: 2200 },
      { orderId: order2.id, productId: pWheat.id, quantity: 500, price: 98 },
    ],
  });

  const order3 = await prisma.order.create({
    data: {
      userId: b2cBuyer2.id,
      type: OrderType.RETAIL,
      status: 'SHIPPED',
      totalAmount: 9750,
      deliveryAddress: 'Достық даңғылы, 123, пәтер 8',
      deliveryCity: 'Алматы',
      phone: '+7 707 888 9999',
    },
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: order3.id, productId: pWildHoney.id, quantity: 2, price: 3800 },
      { orderId: order3.id, productId: pKurt.id, quantity: 1, price: 2800 },
    ],
  });

  console.log('✅ Created 3 orders');

  // ─── Chat rooms ───────────────────────────────────────────────────────────

  const chat1 = await prisma.chatRoom.create({
    data: { buyerId: b2bBuyer.id, sellerId: farmer1.id },
  });
  await prisma.message.createMany({
    data: [
      { chatRoomId: chat1.id, userId: b2bBuyer.id, content: 'Сәлем! Рибай бойынша оптовый бағаны сұрайын. Айына 500 кг керек.' },
      { chatRoomId: chat1.id, userId: farmer1.id, content: 'Сәлем! 2200 ₸/кг ұсынамыз. Ақтауға жеткізу — 150 000 ₸.', isRead: true },
      { chatRoomId: chat1.id, userId: b2bBuyer.id, content: 'Жарайды, тапсырыс береміз. Шарт жасаймыз.' },
    ],
  });

  const chat2 = await prisma.chatRoom.create({
    data: { buyerId: b2cBuyer.id, sellerId: farmer5.id },
  });
  await prisma.message.createMany({
    data: [
      { chatRoomId: chat2.id, userId: b2cBuyer.id, content: 'Алтай балы бар ма? Сыйлыққа алғым келеді.' },
      { chatRoomId: chat2.id, userId: farmer5.id, content: 'Иә, жабайы гүл балы мен гречишный бал бар. Қайсысы керек?', isRead: true },
    ],
  });

  console.log('✅ Created 2 chat rooms with messages');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('👨‍🌾 Farmer 1 (Алматы, Beef): farmer@qazaqtamaq.kz / password123');
  console.log('👨‍🌾 Farmer 2 (Қапшағай, Dairy): farmer2@qazaqtamaq.kz / password123');
  console.log('👨‍🌾 Farmer 3 (Шымкент, Traditional): farmer3@qazaqtamaq.kz / password123');
  console.log('👨‍🌾 Farmer 4 (Қарағанды, Grains/Veg): farmer4@qazaqtamaq.kz / password123');
  console.log('👨‍🌾 Farmer 5 (Өскемен, Honey/Fruit): farmer5@qazaqtamaq.kz / password123');
  console.log('🏢 B2B Buyer: b2b@wholesale.kz / buyer123');
  console.log('👩 B2C Buyer 1: ayagoz@gmail.com / buyer123');
  console.log('👩 B2C Buyer 2: daniyar@gmail.com / buyer123');
  console.log('🔑 Admin: admin@qazaqtamaq.kz / admin123');
  console.log('\n📦 Products summary:');
  console.log('   5 Beef cuts  |  3 Lamb  |  3 Horse meat (traditional)');
  console.log('   2 Poultry  |  7 Dairy/Fermented  |  3 Traditional (qymyz, shubat, kurt)');
  console.log('   3 Grains  |  6 Vegetables  |  2 Fruits  |  2 Eggs  |  3 Honey');
  console.log('   Total: 35 products');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
