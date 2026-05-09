# QazaqTamaq - Казахская Гибридная Агротехнологичная Платформа

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-E0234E)](https://nestjs.com/)

> **Платформа для торговли казахстанским мясом и молочной продукцией**, объединяющая местных фермеров, оптовых покупателей (B2B) и розничных потребителей (B2C) в один экосистему.

## 🎯 Концепция

QazaqTamaq - это гибридный маркетплейс, который:

- ✅ Соединяет казахстанских фермеров с глобальными рынками (экспорт B2B)
- ✅ Предоставляет локальным потребителям доступ к свежей продукции (розница B2C)
- ✅ Использует **Dual-Inventory** для управления розничным и оптовым запасом
- ✅ Внедряет **Expiration Guard** - автоматическую скидку 30% на товары, близкие к сроку годности
- ✅ Поддерживает **Dynamic Pricing** - разные цены для разных типов покупателей

## 🏗️ Архитектура

```
QazaqTamaq Workspace/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── auth/              # Authentication (JWT, Passport)
│   │   ├── products/          # Products CRUD + Dual-Inventory
│   │   ├── orders/            # Orders Management
│   │   ├── prisma/            # Database Layer
│   │   └── main.ts            # Entry Point (Swagger, CORS)
│   ├── prisma/
│   │   ├── schema.prisma      # Database Schema
│   │   ├── migrations/        # Database Migrations
│   │   └── seed.ts            # Test Data
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    ├── app/
    │   ├── page.tsx           # Landing Page
    │   ├── (auth)/            # Auth Routes Group
    │   ├── (protected)/       # Protected Routes
    │   ├── products/          # Product Pages
    │   └── layout.tsx         # Root Layout
    ├── components/
    │   ├── layout/            # Navbar, Footer
    │   ├── products/          # Product Cards, Grid
    │   ├── auth/              # Login, Register Forms
    │   └── shared/            # Reusable Components
    ├── lib/
    │   ├── api.ts             # API Client
    │   └── utils.ts           # Utilities
    └── package.json
```

## 🚀 Быстрый Старт

### Предварительные требования

- Node.js 18+
- PostgreSQL (или Neon cloud)
- npm или yarn

### 1. Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Настройка базы данных

```bash
cd backend

# Скопировать .env.example в .env
cp .env.example .env

# Запустить миграции
npx prisma migrate dev --name init

# Заполнить тестовыми данными
npx prisma db seed
```

### 3. Запуск приложения

```bash
# Terminal 1: Backend (порт 3001)
cd backend
npm run start:dev

# Terminal 2: Frontend (порт 3000)
cd frontend
npm run dev
```

### 4. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

## 📊 Учетные данные для тестирования

После запуска `npx prisma db seed` доступны следующие учетные данные:

| Роль | Email | Пароль | Назначение |
|------|-------|---------|-----------|
| Фермер | farmer@qazaqtamaq.kz | password123 | Управление продуктами и запасами |
| B2B | b2b@wholesale.kz | buyer123 | Оптовые закупки |
| B2C | ayagoz@gmail.com | buyer123 | Розничные покупки |
| Admin | admin@qazaqtamaq.kz | admin123 | Администрирование |

## 🏭 Ключевые Функции

### Аутентификация (20 баллов)
- ✅ Регистрация с выбором роли (FARMER, B2B_BUYER, B2C_BUYER)
- ✅ JWT-токены (Passport.js)
- ✅ Защита маршрутов через Guards
- ✅ Хеширование паролей (bcryptjs, 10 раундов)

### CRUD Продуктов (20 баллов)
- ✅ Создание продукта (только фермеры)
- ✅ Список с пагинацией (10 на странице)
- ✅ Детальная страница продукта
- ✅ Редактирование (фермер или администратор)
- ✅ Удаление (с подтверждением)

### Dual-Inventory (Ключевая инновация)
```typescript
// Products могут иметь разные запасы:
product.retailStock   // Доступно для розницы (B2C)
product.exportStock   // Зарезервировано для экспорта (B2B)

// Бизнес-логика:
// - B2C покупатель НЕ может купить из exportStock
// - B2B покупатель может покупать только если isAvailableExport=true
```

### Expiration Guard (30% скидка)
```typescript
// Если товар истекает в течение 5 дней:
if (daysUntilExpiry <= 5) {
  price = retailPrice * 0.7  // 30% скидка для B2C
  discountActive = true
}
```

### Dynamic Pricing
- B2C: `retailPrice` (может быть со скидкой Expiration Guard)
- B2B: `wholesalePrice`
- Export: `exportPrice`

### База данных (15 баллов)
- ✅ 10+ таблиц (User, Product, Order, Review, Farm, ChatRoom и др.)
- ✅ Связи: 1:N (User → Products) и N:M (через OrderItem)
- ✅ Миграции Prisma
- ✅ Seed-скрипт с тестовыми данными
- ✅ Индексы на часто запрашиваемые поля

### Swagger/OpenAPI (10 баллов)
- ✅ Документированы все 7+ обязательных эндпоинтов
- ✅ Request/Response схемы
- ✅ JWT SecurityScheme
- ✅ Доступен по `/api/docs`

## 📡 API Эндпоинты

### Auth
```
POST   /api/auth/register     - Регистрация
POST   /api/auth/login        - Вход
GET    /api/auth/me           - Текущий пользователь
```

### Products
```
GET    /api/products                - Список (пагинация, фильтры)
GET    /api/products/:id            - Деталь
POST   /api/products                - Создать (FARMER)
PUT    /api/products/:id            - Обновить
DELETE /api/products/:id            - Удалить
GET    /api/products/farmer/me      - Мои продукты (FARMER)
```

### Orders
```
GET    /api/orders                  - Мои заказы
GET    /api/orders/:id              - Деталь заказа
POST   /api/orders                  - Создать заказ
PATCH  /api/orders/:id/status       - Обновить статус
```

### Categories
```
GET    /api/categories              - Список категорий
GET    /api/categories/:id          - Деталь
```

## 🎨 Дизайн и Цвета

| Элемент | Цвет | HEX | Назначение |
|---------|------|-----|-----------|
| Основной | Deep Forest Green | #1A2F23 | Основные элементы UI |
| Акцент | Gold | #D4AF37 | Выделение, бейджи |
| Фон | Off-White | #F5F3F0 | Фоновые блоки |
| Ошибка | Red | #EF4444 | Предупреждения |
| Успех | Green | #10B981 | Положительные действия |

## 📱 Ключевые страницы

| Страница | Путь | Функции |
|----------|------|---------|
| Главная | `/` | Герой-секция, лучшие продукты, CTA |
| Вход | `/auth/login` | Email + Password |
| Регистрация | `/auth/register` | Multi-step: роль → данные → верификация |
| Продукты | `/products` | Grid, фильтры, поиск, пагинация |
| Деталь продукта | `/products/:id` | Описание, отзывы, кнопка "Чат с фермером" |
| Мой кабинет (Фермер) | `/dashboard` | Аналитика, управление продуктами |
| Корзина | `/cart` | Multi-vendor checkout |
| Чат | `/messages` | Переговоры между фермером и покупателем |

## 🔒 Безопасность

- ✅ JWT-токены с истечением
- ✅ Хеширование паролей (bcryptjs 10 раундов)
- ✅ CORS настроен на конкретные origins
- ✅ Валидация входных данных (Zod/class-validator)
- ✅ SQL-инъекции невозможны (Prisma параметризует запросы)
- ✅ Guards защищают приватные маршруты

## 📦 Деплой

### Frontend (Vercel)
```bash
# Подключить репозиторий в Vercel
# Указать переменные:
NEXT_PUBLIC_API_URL=https://your-api.railway.app

# Автоматический деплой из main ветки
```

### Backend (Railway)
```bash
# Создать проект на Railway
# Подключить PostgreSQL базу
# Переменные окружения:
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=https://your-app.vercel.app
PORT=8000

# Деплой: push в main (git)
```


## 🤖 AI-Инструменты

Этот проект использовал:
- **GitHub Copilot** - Автодополнение кода
- **Claude** - Архитектура и логика
- **v0.dev** - Генерация UI компонентов

> Все код проверен и понимается разработчиком на 100%.

## ✅ Чек-лист Перед Сдачей

- [ ] Все ошибки TypeScript исправлены (`npx tsc --noEmit`)
- [ ] ESLint без ошибок (`npx eslint .`)
- [ ] Миграции Prisma применены
- [ ] Seed работает без ошибок
- [ ] .env.local в .gitignore
- [ ] .env.example закоммичен
- [ ] Swagger документирует все эндпоинты
- [ ] Функциональность протестирована (auth, CRUD, корзина)
- [ ] App задеплоена на Vercel
- [ ] API задеплоен на Railway
- [ ] BD в облаке (Neon/Railway/Supabase)
- [ ] README.md имеет описание, скриншоты, ссылку на live-demo
- [ ] Минимум 10 осмысленных коммитов

## 📞 Контакты

- **GitHub**: [your-github-repo](https://github.com)
- **Live Demo**: [[your-vercel-url](https://your-domain.vercel.app)](https://qazaqtamaq.vercel.app/products)
- **Live Demo**: https://qazaqtamaq-production.up.railway.app 

