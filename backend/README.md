# QazaqTamaq Backend API

NestJS-приложение для QazaqTamaq маркетплейса. Полнофункциональный REST API с JWT-аутентификацией, управлением продуктами и заказами.

## 🚀 Быстрый Старт

### Установка

```bash
npm install
```

### Конфигурация

1. Скопировать `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Заполнить переменные окружения (особенно `DATABASE_URL` и `JWT_SECRET`)

### Миграции и Seed

```bash
# Создать/применить миграции
npx prisma migrate dev

# Заполнить БД тестовыми данными
npx prisma db seed
```

### Запуск

```bash
# Development режим (с auto-reload)
npm run start:dev

# Production режим
npm run build
npm run start:prod
```

API будет доступен на `http://localhost:3001`

## 📊 Структура Проекта

```
src/
├── auth/
│   ├── auth.controller.ts       # Endpoints: /auth/register, /auth/login, /auth/me
│   ├── auth.service.ts          # JWT логика, регистрация, вход
│   ├── dto/
│   │   ├── register.dto.ts      # Регистрация (email, password, role, address)
│   │   └── login.dto.ts         # Вход (email, password)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # Guard для защиты маршрутов
│   │   └── roles.guard.ts       # Role-based Access Control (RBAC)
│   ├── strategies/
│   │   └── jwt.strategy.ts      # Passport JWT strategy
│   └── auth.module.ts           # Auth модуль
│
├── products/
│   ├── products.controller.ts   # CRUD endpoints + search
│   ├── products.service.ts      # Dual-Inventory логика, Expiration Guard
│   ├── dto/
│   │   └── create-product.dto.ts # CreateProductDto, UpdateProductDto
│   └── products.module.ts
│
├── orders/
│   ├── orders.controller.ts     # Order endpoints
│   ├── orders.service.ts        # Order logic
│   └── orders.module.ts
│
├── prisma/
│   ├── prisma.service.ts        # Database connection
│   └── prisma.module.ts         # Prisma модуль
│
├── app.module.ts                # Root модуль (импорт всех модулей)
└── main.ts                      # Entry point (Swagger, CORS, Bootstrap)
```

## 🔌 API Документация

### Swagger UI

Откройте `http://localhost:3001/api/docs` для интерактивной документации.

Все эндпоинты задокументированы с примерами request/response.

### Auth Endpoints

#### POST `/api/auth/register`
Регистрация нового пользователя

**Request:**
```json
{
  "email": "farmer@qazaqtamaq.kz",
  "password": "password123",
  "name": "Ақтоты Бай",
  "role": "FARMER",
  "binIin": "091550002451",
  "address": "ул. Сарыарқа, 15, Алматы",
  "city": "Алматы",
  "phone": "+7 700 123 4567"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "user-123",
    "email": "farmer@qazaqtamaq.kz",
    "name": "Ақтоты Бай",
    "role": "FARMER",
    "isVerified": false
  }
}
```

#### POST `/api/auth/login`
Вход в систему

**Request:**
```json
{
  "email": "farmer@qazaqtamaq.kz",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Получить текущего пользователя (требуется JWT)

**Headers:**
```
Authorization: Bearer eyJhbGci...
```

### Products Endpoints

#### GET `/api/products?page=1&limit=10&categoryId=...`
Список продуктов с пагинацией

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `categoryId` (string, optional)

**Features:**
- ✅ Role-based filtering (B2C видит только retail, B2B видит export)
- ✅ Expiration Guard скидки автоматически применяются
- ✅ Dynamic pricing по роли

**Response:**
```json
{
  "data": [
    {
      "id": "product-1",
      "name": "Рибай (Ребро)",
      "retailPrice": 3500,
      "wholesalePrice": 2800,
      "exportPrice": 2200,
      "retailStock": 25,
      "exportStock": 100,
      "discountActive": false,
      "daysUntilExpiry": 7,
      "price": 3500,
      "farmer": { "name": "Ақтоты Бай" },
      "category": { "name": "Говядина" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### GET `/api/products/:id`
Деталь продукта

**Features:**
- Отзывы (последние 5)
- Рейтинг (среднее)
- Информация о фермере

#### POST `/api/products` (FARMER)
Создать продукт

**Authorization:** Bearer token (FARMER role)

**Request:**
```json
{
  "name": "Новый продукт",
  "description": "Описание",
  "categoryId": "category-id",
  "retailPrice": 5000,
  "wholesalePrice": 4000,
  "exportPrice": 3000,
  "retailStock": 10,
  "exportStock": 50,
  "fatContent": "5%",
  "feedingType": "Трава-вскормленная",
  "expirationDate": "2026-05-30T23:59:59Z",
  "imageUrl": "https://example.com/image.jpg",
  "isAvailableRetail": true,
  "isAvailableExport": true
}
```

#### PUT `/api/products/:id` (FARMER/ADMIN)
Обновить продукт

**Authorization:** Bearer token (FARMER или ADMIN)

#### DELETE `/api/products/:id` (FARMER/ADMIN)
Удалить продукт

## 🔐 Аутентификация и Авторизация

### JWT Strategy

Все защищенные маршруты требуют `Authorization: Bearer <token>` заголовок.

```typescript
// Пример с Guard
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected(@Req() req) {
  // req.user содержит информацию из JWT payload
  return req.user;
}
```

### Role-Based Access Control (RBAC)

```typescript
// Только для FARMER
@Roles(Role.FARMER)
@UseGuards(RolesGuard)
@Post()
createProduct(...) {}

// Для FARMER или ADMIN
@Roles(Role.FARMER, Role.ADMIN)
@UseGuards(RolesGuard)
@Put(':id')
updateProduct(...) {}
```

## 🏭 Бизнес-Логика

### Dual-Inventory Engine

**Цель:** Предотвратить B2C покупателей от покупки товара, зарезервированного для экспорта.

```typescript
// products.service.ts
if (userRole === Role.B2C_BUYER) {
  // B2C видит только retailStock
  where.isAvailableRetail = true;
  where.retailStock = { gt: 0 };
} else if (userRole === Role.B2B_BUYER) {
  // B2B видит только exportStock
  where.isAvailableExport = true;
  where.exportStock = { gt: 0 };
}
```

### Expiration Guard (30% Скидка)

**Цель:** Помочь фермерам избежать потерь, предлагая скидку на товары близкие к сроку годности.

```typescript
// products.service.ts
private checkExpirationGuard(expirationDate: Date): boolean {
  const daysUntilExpiry = (expirationDate - now) / (1000 * 60 * 60 * 24);
  // Если ≤ 5 дней до истечения - включить скидку
  return daysUntilExpiry <= 5 && daysUntilExpiry > 0;
}

// Применение скидки
if (checkExpirationGuard(product.expirationDate) && role === Role.B2C_BUYER) {
  price = product.retailPrice * 0.7; // 30% скидка
}
```

### Dynamic Pricing

```typescript
private getPriceByRole(product: Product, role: Role): number {
  switch (role) {
    case Role.B2C_BUYER:
      return product.retailPrice; // (с Expiration Guard если применимо)
    case Role.B2B_BUYER:
      return product.wholesalePrice;
    default:
      return product.exportPrice;
  }
}
```

## 📊 Prisma Schema Ключевые Модели

### User
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(B2C_BUYER)  // FARMER, B2B_BUYER, B2C_BUYER, ADMIN
  binIin       String?  // Tax ID
  // ... relations
}
```

### Product (Dual-Inventory)
```prisma
model Product {
  retailPrice   Float   // B2C цена
  wholesalePrice Float  // B2B цена
  exportPrice    Float? // Export цена
  
  retailStock    Int    // Доступно для розницы
  exportStock    Int    // Зарезервировано для экспорта
  
  discountActive Boolean  // Expiration Guard флаг
  discountPercent Int     // % скидки
  
  expirationDate DateTime? // Для Expiration Guard
  // ... fields
}
```

## 🧪 Тестирование

### Локальное тестирование с Swagger

1. Откройте http://localhost:3001/api/docs
2. Нажмите кнопку "Authorize"
3. Введите JWT token после регистрации
4. Попробуйте endpoints

### Интеграционное тестирование

```bash
# (TODO: добавить Jest tests)
npm run test
npm run test:e2e
```

## 📦 Зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| @nestjs/core | 10+ | NestJS фреймворк |
| @nestjs/passport | 10+ | Passport интеграция |
| passport-jwt | 4+ | JWT стратегия |
| @prisma/client | 5+ | ORM |
| bcryptjs | 2+ | Хеширование паролей |
| class-validator | 0.14+ | Валидация DTO |
| @nestjs/swagger | 7+ | OpenAPI документация |

## 🔧 NPM Scripts

```bash
npm run start        # Запустить приложение
npm run start:dev    # Development с auto-reload (Используется)
npm run build        # Собрать для production
npm run lint         # ESLint проверка
npm run format       # Prettier форматирование
```

## 🐛 Деплой

### Railway

1. Создать проект на Railway
2. Подключить PostgreSQL БД
3. Установить переменные окружения в Railway Dashboard:
   - DATABASE_URL
   - JWT_SECRET
   - CORS_ORIGIN
   - PORT (может быть 8000)

4. Связать с GitHub репозиторием
5. Автоматический деплой при push в main

### Локальный Docker

```bash
docker build -t qazaqtamaq-backend .
docker run -p 3001:3001 --env-file .env qazaqtamaq-backend
```

## 📝 Лог Изменений

### v1.0.0
- ✅ Аутентификация JWT
- ✅ CRUD продуктов с Dual-Inventory
- ✅ Expiration Guard (30% скидка)
- ✅ Dynamic Pricing
- ✅ Swagger документация
- ✅ CORS настройка
- ✅ Prisma миграции и seed

## 🤝 Контрибьютинг

Для контрибьютинга:
1. Fork репозиторий
2. Создать feature ветку (`git checkout -b feature/amazing`)
3. Коммитить изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 Лицензия

MIT © 2026 QazaqTamaq
