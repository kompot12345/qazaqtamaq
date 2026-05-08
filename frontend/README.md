# QazaqTamaq Frontend

Next.js 14 (App Router) приложение для QazaqTamaq маркетплейса. Premium UI с Tailwind CSS, адаптивный дизайн, интеграция с NestJS API.

## 🚀 Быстрый Старт

### Установка

```bash
npm install
```

### Конфигурация

1. Скопировать `.env.example` в `.env.local`:
```bash
cp .env.example .env.local
```

2. Указать API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Запуск

```bash
# Development режим
npm run dev

# Production сборка
npm run build
npm run start

# Лintinг
npm run lint
```

Приложение будет доступно на `http://localhost:3000`

## 📁 Структура Проекта

```
app/
├── page.tsx                   # Главная страница (Landing)
├── layout.tsx                 # Root layout с Navbar
├── globals.css                # Глобальные стили + CSS переменные
│
├── (auth)/                    # Route Group для auth страниц
│   ├── login/
│   │   └── page.tsx          # Страница входа
│   └── register/
│       └── page.tsx          # Страница регистрации
│
├── (protected)/               # Route Group для защищенных страниц
│   ├── dashboard/            # Панель фермера
│   ├── cart/                 # Корзина
│   └── checkout/             # Оформление заказа
│
└── products/                 # Публичный раздел продуктов
    ├── page.tsx              # Список продуктов
    └── [id]/
        └── page.tsx          # Деталь продукта

components/
├── layout/
│   ├── Navbar.tsx            # Навигационная панель
│   └── Footer.tsx            # Подвал
│
├── products/
│   ├── ProductCard.tsx       # Карточка продукта
│   ├── ProductGrid.tsx       # Сетка продуктов
│   └── ProductDetail.tsx     # Деталь продукта
│
├── auth/
│   ├── LoginForm.tsx         # Форма входа
│   └── RegisterForm.tsx      # Форма регистрации
│
├── cart/
│   ├── CartSidebar.tsx       # Боковая панель корзины
│   └── CartItem.tsx          # Элемент корзины
│
├── shared/
│   ├── Button.tsx            # Кнопка компонент
│   ├── Input.tsx             # Input компонент
│   ├── Modal.tsx             # Модальное окно
│   └── Toast.tsx             # Уведомление
│
└── ui/                       # shadcn/ui компоненты (если используется)

lib/
├── api.ts                    # API клиент (axios + interceptors)
└── utils.ts                  # Утилит функции

types/
└── index.ts                  # TypeScript интерфейсы

public/
└── images/                   # Статические изображения
```

## 🎨 Дизайн Система

### Цветовая схема

```css
:root {
  /* QazaqTamaq Palette */
  --primary: #1A2F23;         /* Deep Forest Green */
  --primary-light: #2D4A3B;
  --primary-dark: #0F1A16;
  
  --accent: #D4AF37;          /* Gold */
  --accent-light: #E8C547;
  
  --off-white: #F5F3F0;
  --text-dark: #1A1A1A;
  --text-light: #666666;
  --border: #E0E0E0;
  
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### Использование классов

```html
<!-- Кнопка -->
<button class="btn-primary">Действие</button>
<button class="btn-secondary">Альтернатива</button>

<!-- Карточка -->
<div class="card p-6">Контент</div>

<!-- Бейдж -->
<span class="badge-primary">Primary</span>
<span class="badge-accent">Accent</span>
<span class="badge-warning">Warning</span>

<!-- Input -->
<input class="input-field" type="text" />

<!-- Заголовки -->
<h1 class="section-title">Заголовок</h1>
<p class="section-subtitle">Подзаголовок</p>
```

## 📡 API Интеграция

### API Клиент

Все API запросы идут через `lib/api.ts`:

```typescript
import { authAPI, productsAPI, ordersAPI } from '@/lib/api';

// Аутентификация
const { data } = await authAPI.login({ email, password });
localStorage.setItem('token', data.accessToken);

// Продукты
const products = await productsAPI.getAll(page, limit);
const product = await productsAPI.getById(id);

// Заказы
const orders = await ordersAPI.getAll();
```

### Перехватчики

- ✅ Автоматический добавление JWT токена в headers
- ✅ Перенаправление на login при 401 ошибке
- ✅ Обработка ошибок

## 🔐 Аутентификация

### Flow

1. **Регистрация** (`/auth/register`)
   - Выбор роли (FARMER, B2B_BUYER, B2C_BUYER)
   - Заполнение формы
   - Получение JWT токена
   - Редирект на `/products`

2. **Вход** (`/auth/login`)
   - Email + Password
   - Получение JWT токена
   - Сохранение в localStorage
   - Редирект на лучшую страницу

3. **Защита маршрутов**
   - Проверка токена при загрузке страницы
   - Редирект на `/auth/login` если токена нет

### Хранилище

```typescript
// Сохранить после login/register
localStorage.setItem('token', response.accessToken);
localStorage.setItem('user', JSON.stringify(response.user));

// Загрузить при загрузке страницы
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
```

## 🛍️ Функциональность

### Главная страница (`/`)
- ✅ Hero секция с CTA
- ✅ Ключевые особенности (4 функции)
- ✅ Избранные продукты (6 товаров)
- ✅ Категории
- ✅ CTA секция
- ✅ Footer

### Страница продуктов (`/products`)
- ✅ Сетка продуктов (3 колонки на desktop)
- ✅ Пагинация (10 товаров на странице)
- ✅ Фильтрация по категориям
- ✅ Поиск
- ✅ Сортировка (цена, свежесть)
- ✅ Role-based pricing отображение

### Деталь продукта (`/products/:id`)
- ✅ Фото галерея
- ✅ Описание, атрибуты (жирность, тип откорма)
- ✅ Три цены (B2C, B2B, Export) с тумблером
- ✅ Expiration Guard бейдж (оранжевый если ≤5 дней)
- ✅ Кнопка "Чат с фермером"
- ✅ Отзывы (5 звезд + текст)
- ✅ Добавить в корзину

### Корзина (`/cart`)
- ✅ Список товаров от разных фермеров
- ✅ Возможность удаления
- ✅ Редактирование количества
- ✅ Калькулятор итога
- ✅ Multi-vendor checkout

### Оформление заказа (`/checkout`)
- ✅ Выбор адреса доставки
- ✅ Выбор города (dropdown)
- ✅ Номер телефона (+7 маска)
- ✅ Сводка заказа
- ✅ Кнопка оплаты

### Панель фермера (`/dashboard`)
- ✅ Статистика (продажи, запасы, рейтинг)
- ✅ Таблица мои продукты
- ✅ Кнопка добавить продукт
- ✅ Редактирование/удаление продукта
- ✅ Раздел заказов

## 📱 Адаптивность

Приложение полностью адаптивно:
- ✅ Mobile (375px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

Используются Tailwind breakpoints:
- `sm` (640px)
- `md` (768px)
- `lg` (1024px)
- `xl` (1280px)

## 🧩 Компоненты

### ProductCard
```tsx
<ProductCard
  product={{
    id: "123",
    name: "Рибай",
    price: 3500,
    image: "url",
    discount: true
  }}
/>
```

### Button
```tsx
<Button variant="primary" size="lg">
  Действие
</Button>
```

### Modal
```tsx
<Modal isOpen={true} onClose={handleClose}>
  Контент модального окна
</Modal>
```

## 🎯 Performance

- ✅ Image Optimization (Next.js Image)
- ✅ Code Splitting (Dynamic imports)
- ✅ Lazy Loading (Intersection Observer)
- ✅ Caching (API response caching)

## 🔍 SEO

- ✅ Meta tags в каждой странице
- ✅ Открытый граф (OG) теги
- ✅ Структурированные данные (Schema.org)
- ✅ XML Sitemap
- ✅ robots.txt

## 🌐 Деплой на Vercel

### Шаг 1: Подготовка репозитория

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Шаг 2: Подключить к Vercel

1. Откройте https://vercel.com
2. Нажмите "Import Project"
3. Выберите GitHub репозиторий
4. Установите переменные окружения:
   - `NEXT_PUBLIC_API_URL`: https://your-api.railway.app

### Шаг 3: Deploy

Нажмите "Deploy" - Vercel автоматически:
- Установит зависимости
- Соберет проект
- Запустит на CDN

### Результат

- Live: https://your-app.vercel.app
- Автоматический деплой при push в main

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage отчет
npm run test:coverage
```

## 📊 Папка Структура - Best Practices

```
✅ Хорошо:
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── products/
    ├── page.tsx
    └── [id]/
        └── page.tsx

✅ Структура компонентов:
components/
├── products/
│   ├── ProductCard.tsx
│   ├── ProductCard.module.css  (если нужно)
│   └── index.ts                (экспорт)
└── index.ts                    (barrel export)
```

## 🚨 Частые проблемы

### API Connection Error
```
Ошибка: "Cannot POST http://localhost:3001/api/..."
Решение: Убедитесь что backend запущен на порте 3001
```

### 401 Unauthorized
```
Ошибка: При обращении к защищенным маршрутам
Решение: Проверьте что JWT токен сохранен в localStorage
```

### CORS Error
```
Ошибка: "Access to XMLHttpRequest blocked by CORS policy"
Решение: Backend должен иметь CORS_ORIGIN=http://localhost:3000
```

## 📚 Ресурсы

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Lucide Icons](https://lucide.dev)

## 🤝 Контрибьютинг

1. Fork репозиторий
2. Создать feature ветку
3. Сделать изменения
4. Коммитить с понятным сообщением
5. Push и Open Pull Request

## 📄 Лицензия

MIT © 2026 QazaqTamaq
