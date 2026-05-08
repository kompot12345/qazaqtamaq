# QazaqTamaq — Capstone Defense Guide

---

## PART 1 — PROJECT PITCH (2 minutes, say this first)

"QazaqTamaq is a hybrid agritech marketplace built for Kazakhstan. It connects three groups of people: Kazakh farmers who grow and sell food, B2C individual buyers who want fresh produce delivered to their door, and B2B exporters who buy in bulk. The platform is fully bilingual — Kazakh, Russian, and English — and has an AI assistant named Таттібек powered by Anthropic Claude that answers questions in whatever language the user writes in. The backend is a REST API built with NestJS and PostgreSQL. The frontend is built with Next.js 15. The system is Dockerized and ready to deploy on Render and Vercel."

---

## PART 2 — ARCHITECTURE OVERVIEW

### System diagram (draw this on a whiteboard)

```
Browser (Next.js 15, port 3000)
        │
        │  HTTP / REST  (axios, JWT in Authorization header)
        ▼
NestJS API (port 3001)
        │
        │  Prisma ORM
        ▼
Neon PostgreSQL (cloud)
        │
        └── Anthropic Claude API (for Таттібек chat)
```

### Why these technologies?

| Choice | Reason |
|--------|--------|
| NestJS | Opinionated structure, built-in DI, decorators for guards/pipes, Swagger auto-generation |
| Prisma | Type-safe ORM, migrations, schema-first, works great with TypeScript |
| Neon PostgreSQL | Serverless Postgres — free tier, no cold-start DB, branching for dev/prod |
| Next.js 15 App Router | Server components, file-based routing, image optimization, easy Vercel deploy |
| Tailwind CSS | Utility-first, no separate CSS files, consistent design tokens |
| JWT + bcrypt | Stateless authentication, no session storage needed, industry standard |

---

## PART 3 — FEATURE-BY-FEATURE EXPLANATION

### 3.1 Authentication

**What it does:** Users register with one of three roles — FARMER, B2B_BUYER, B2C_BUYER. After registration they receive a JWT token. Every protected route requires `Authorization: Bearer <token>`.

**How it works technically:**
1. User submits form → POST `/api/auth/register`
2. Backend checks if email already exists (throws 400 if yes)
3. Password is hashed with `bcrypt.hash(password, 10)` — 10 salt rounds means ~100ms per hash, making brute-force attacks very slow
4. If role is FARMER, a `Farm` record is also created in the same transaction
5. JWT is signed with `{ sub: userId, email, role }` payload, expires in 7 days
6. Frontend stores the token in `localStorage` and the user object for fast reads

**Security measures:**
- Passwords are never stored in plain text
- The error message for wrong login is always "Invalid email or password" — never "email not found" — to prevent user enumeration attacks
- CORS is configured to only allow requests from the frontend origin
- `whitelist: true` on ValidationPipe strips any fields not in the DTO, preventing mass-assignment attacks

---

### 3.2 Dual-Inventory System (the main unique feature)

**Problem it solves:** A farmer has 100 kg of beef. Some goes to the local B2C market (small quantities, higher price), the rest goes to a B2B exporter (bulk, lower price). These two pools must never overlap.

**How it works:**
- Every `Product` in the database has two stock fields: `retailStock` (for B2C) and `exportStock` (for B2B)
- The farmer uses sliders in the dashboard to split their total stock between the two channels
- The API endpoint `PATCH /api/products/:id/sync-inventory` takes `{ retailStock, exportStock }` and updates both fields atomically
- When a B2C buyer views products, they only see items where `retailStock > 0` and `isAvailableRetail = true`
- When a B2B buyer views products, they only see items where `exportStock > 0` and `isAvailableExport = true`

**Code location:** `backend/src/products/products.service.ts` — `syncInventory()` method and the `getProducts()` where clause logic

---

### 3.3 Expiration Guard (automatic discount system)

**Problem it solves:** Agricultural products expire. Instead of products going to waste, the system automatically applies a 30% discount for B2C buyers when a product is within 5 days of its expiration date.

**How it works:**
- Every product has an optional `expirationDate` field
- `checkExpirationGuard(date)` calculates `(expirationDate - now) / milliseconds per day`
- If result is ≤ 5 days AND > 0 days, the guard activates
- `getPriceByRole()` reduces the B2C price by 30% automatically: `basePrice * 0.7`
- The `discountActive: true` flag is returned in the API response so the frontend can show the discount badge
- This runs on every GET request — no cron job needed, no stale data

**Code location:** `backend/src/products/products.service.ts` — `checkExpirationGuard()` and `getPriceByRole()`

---

### 3.4 Role-Based Access Control (RBAC)

**Three roles and what they can do:**

| Action | FARMER | B2B_BUYER | B2C_BUYER | ADMIN |
|--------|--------|-----------|-----------|-------|
| Create products | ✅ | ❌ | ❌ | ✅ |
| Edit own products | ✅ | ❌ | ❌ | ✅ |
| Delete own products | ✅ | ❌ | ❌ | ✅ |
| See retail prices | ❌ | ❌ | ✅ | ✅ |
| See wholesale prices | ❌ | ✅ | ❌ | ✅ |
| Place orders | ❌ | ✅ | ✅ | ✅ |
| Update order status | ✅ | ❌ | ❌ | ✅ |
| Access /dashboard | ✅ | ❌ | ❌ | ✅ |

**How it works technically:**
- NestJS `JwtAuthGuard` validates the token on protected routes
- `RolesGuard` reads the `@Roles(Role.FARMER)` decorator on the controller method
- The current user's role comes from the JWT payload — no database lookup needed for each request
- Frontend also checks `user.role` from localStorage to show/hide UI elements (e.g., "Фермер кабинеті" link only shows for FARMER)

---

### 3.5 Таттібек AI Chat

**What it does:** A floating chat widget in the bottom-right corner of every page. Users can ask questions in Kazakh, Russian, or English. The AI responds in the same language.

**How it works:**
1. User types a message → POST `/api/chat/tattibeke`
2. `ChatService.gatherContext()` inspects keywords in the message and queries the database for relevant data (e.g., if message contains "өнім" or "product", it fetches the 5 cheapest available products)
3. The real product data is injected into the message as context before sending to Claude
4. `claude-haiku-4-5-20251001` (fastest, cheapest Claude model) is called with a Kazakh-language system prompt
5. The system prompt forces JSON output: `{ "reply": "...", "suggestions": ["...", "..."] }`
6. The suggestions array becomes the clickable chip buttons below the message
7. If the Anthropic API key is not configured or the call fails, it falls back to a rule-based response system

**Why Claude Haiku specifically:** It has the lowest latency and lowest cost per token — a chat widget needs fast responses. The context window is more than enough for this use case.

**Code location:** `backend/src/chat/chat.service.ts`

---

### 3.6 Gamification — Асық ату

**What it is:** Асық (аsyq) is a traditional Kazakh game played with sheep ankle bones. The digital version is a 30-second mini-game where users earn "Nomad Credits" that convert to discount codes.

**Scoring tiers:**
- 80+ points → 100 Nomad Credits → 15% discount code
- 50-79 → 50 credits → 10% discount
- 20-49 → 20 credits → 5% discount
- 0-19 → 5 credits → 2% discount

**Technical flow:**
1. User plays the game on `/gamification` (Three.js 3D animation)
2. On game end → POST `/api/gamification/claim` with `{ score, duration }`
3. Backend generates a unique discount code: `NOMAD-XXXXXX` (random 6-character suffix)
4. Code expires in 24 hours
5. User can apply the code at checkout

**Cultural significance:** This is intentional — the project aims to preserve Kazakh identity in a tech product. The game page uses a Kazakh geometric ornament pattern (lozenge chain, gold on dark background) that references traditional felt decoration (shyrdak/syrmak).

---

### 3.7 Internationalization (i18n)

**Three languages:** English, Russian, Kazakh

**Implementation approach:** Built from scratch without any i18n library.

**How it works:**
- `translations.ts` — a large nested object: `{ nav: { home: { en: "Home", ru: "Главная", kk: "Басты бет" } } }`
- `LanguageContext.tsx` — React Context that stores the current language in `localStorage`, exposes `{ lang, setLang, t }`
- `t('nav.home')` — splits on the first `.`, looks up the section and key, returns the string for the current language
- `LanguageProvider` wraps the entire app via `Providers.tsx` — this wrapper is a `'use client'` component so `layout.tsx` can remain a server component with `export const metadata`
- Language switcher in the Navbar saves the choice to `localStorage` so it persists across page reloads

**Why not use next-intl or react-i18next?** Simplicity. This project has a manageable number of strings, and building it from scratch demonstrates understanding of React Context, TypeScript generics, and how localization actually works under the hood.

---

### 3.8 Shopping Cart

**How it works:**
- Cart is stored in `localStorage` as `CartItem[]` — no backend cart table needed
- On page load, each cart item's `productId` is validated against the live API to confirm the product still exists and stock is available
- Items for products that no longer exist are silently removed, and the user sees a toast notification
- Checkout opens a modal collecting name, phone, city, address
- On submit → POST `/api/orders` with all items and delivery info
- After successful order, cart is cleared from localStorage

**Why localStorage instead of a database cart?** Simpler UX — the cart works immediately without login. For a production system, you'd sync to DB on login, but for this MVP it's appropriate.

---

### 3.9 Farmer Dashboard

**Features:**
- Overview tab: last 4 products, last 4 orders, revenue stats
- Products tab: full product list with edit/delete (delete has a confirmation modal)
- Orders tab: incoming orders with status update buttons (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Inventory tab: dual-stock sliders for each product

**Delete confirmation:** Uses a custom React modal (not `window.confirm()`) with "Болдырмау" (Cancel) and "Жою" (Delete) buttons. This is important because `window.confirm()` is blocked in some embedded browser environments and cannot be styled.

---

### 3.10 Database Schema

**10 models in Prisma:**

| Model | Purpose |
|-------|---------|
| User | All user accounts, role field |
| Farm | Farmer profile (1:1 with FARMER users) |
| Category | Product categories, self-referencing for hierarchy |
| Product | Products with dual-inventory fields |
| Order | Customer orders (RETAIL or EXPORT type) |
| OrderItem | Line items within an order |
| Review | Product reviews (1 per user per product) |
| ChatRoom | Direct messaging rooms between buyer and farmer |
| Message | Individual messages within a ChatRoom |

**Key design decisions:**
- UUIDs as primary keys (not auto-increment integers) — safe to expose in URLs, no enumeration attacks
- `passwordHash` field name makes it impossible to accidentally send the hash in a SELECT * query context
- `OrderItem.price` stores the price at the time of purchase — if the farmer changes the price later, old orders are not affected
- `@@index` on all foreign keys and frequently queried fields (email, status, type) for query performance
- `onDelete: Cascade` on OrderItem → Order so deleting an order removes its items automatically

---

## PART 4 — POTENTIAL QUESTIONS AND ANSWERS

---

**Q: Why did you choose NestJS over Express?**

Express is minimalist — you have to wire up everything yourself (routing, validation, DI, documentation). NestJS gives you a structured opinionated framework with decorators. The `@Controller`, `@Get`, `@UseGuards`, `@ApiBearerAuth` pattern makes the code self-documenting and the Swagger integration generates OpenAPI docs automatically from the same decorators. For a team project or anything that scales, NestJS's structure wins clearly.

---

**Q: How does JWT authentication work? Why not sessions?**

JWT (JSON Web Token) is stateless. When a user logs in, the server signs a token with a secret key. Every subsequent request includes that token in the `Authorization: Bearer` header. The server validates the signature mathematically — no database lookup, no session store. This means the API can scale horizontally (multiple server instances) without sharing session state. The token payload contains `{ sub: userId, email, role }` so the server knows who the user is and what they can do from the token alone.

Sessions require a session store (Redis, database) that all server instances must share. JWT doesn't.

---

**Q: Is storing JWT in localStorage safe?**

It is vulnerable to XSS (cross-site scripting) — if an attacker injects JavaScript into the page, they can read localStorage. The alternative is `httpOnly` cookies, which JavaScript cannot read.

For this project, localStorage is a reasonable choice because: (1) Next.js escapes all JSX output by default, significantly reducing XSS risk, (2) the data is not highly sensitive (marketplace, not banking), (3) it's simpler to implement. A production version would move to httpOnly cookies.

---

**Q: Why bcrypt? Why saltRounds=10?**

Bcrypt is a password hashing function specifically designed to be slow. MD5 and SHA-256 are designed for speed — you can compute billions per second. Bcrypt at saltRounds=10 takes about 100ms per hash, which is imperceptible for a login but makes brute-force attacks 10 million times harder. The salt is a random value mixed into the hash — two users with the same password get different hashes, so rainbow table attacks don't work.

saltRounds=10 is the recommended default in the bcrypt documentation. saltRounds=12 is safer but doubles compute time on every login. 10 is the right balance for a web application.

---

**Q: What is Prisma and why use it instead of raw SQL?**

Prisma is a type-safe ORM (Object-Relational Mapper). You define your schema in `schema.prisma` and Prisma generates a TypeScript client. Instead of writing `SELECT * FROM products WHERE id = $1`, you write `prisma.product.findUnique({ where: { id } })`. The TypeScript compiler knows the exact shape of the returned object.

Benefits: no SQL injection (queries are parameterized automatically), TypeScript autocomplete for every field and relation, migrations are version-controlled files, easy to switch databases.

---

**Q: What is the Dual-Inventory system and why is it unique?**

Most e-commerce platforms have a single stock number. In agricultural export, the same physical product (say, 500 kg of beef) needs to be split between the local retail market and an international export contract. These two pools cannot overlap — if 300 kg is reserved for export, only 200 kg should be available for retail buyers.

The implementation has two fields — `retailStock` and `exportStock` — on every product. The farmer uses sliders in their dashboard to split their total stock. The API filters products by the buyer's role: B2C buyers only see `retailStock > 0` products, B2B buyers only see `exportStock > 0`. When an order is placed, only the appropriate stock field is decremented.

---

**Q: How does the Expiration Guard work?**

Every product can have an optional `expirationDate`. On every GET request for products, the `checkExpirationGuard()` function calculates the number of days until expiry. If it is 5 days or less (and the product hasn't expired yet), the system returns `discountActive: true` in the API response and calculates the price at 70% of the retail price. No scheduled job is needed — the check is real-time. The frontend displays a "30% OFF" badge and shows the discounted price.

---

**Q: How does the Таттібек AI chat work?**

The chat widget sends user messages to the NestJS backend. Before calling Claude, the service inspects keywords in the message. If the user asks about products, it queries the database for the 5 most available products and injects that data as context. If they ask about discounts, it fetches currently discounted products. This context is appended to the message before sending to `claude-haiku-4-5-20251001`.

The system prompt is written in Kazakh and instructs the AI to: respond in the user's language (Kazakh, Russian, or English), keep answers to 3-4 sentences, and always return a JSON object with `reply` and `suggestions`. The suggestions become the clickable chip buttons below each message.

If the API key is missing or the call fails, the service falls back to a rule-based system that pattern-matches keywords and returns hardcoded responses.

---

**Q: Why Next.js 15 App Router instead of Pages Router?**

App Router is the new paradigm in Next.js. It supports React Server Components, which means components that fetch data on the server and send HTML to the client — no JavaScript bundle for that component, better performance. The `layout.tsx` file applies to all nested routes automatically, making it easy to add the Navbar and Providers once.

The trade-off is that all interactive components must be explicitly marked `'use client'`. All pages in this project are client components because they use browser APIs (localStorage, event handlers), which is fine.

---

**Q: Explain the i18n implementation.**

Three languages are supported: English, Russian, Kazakh. All strings live in `frontend/lib/i18n/translations.ts` — a TypeScript object where each string key maps to `{ en: "...", ru: "...", kk: "..." }`. The `LanguageContext` stores the active language in React state and syncs it to `localStorage`. The `t('section.key')` function splits the path on the first dot, looks up the section and key, and returns the localized string. If a translation is missing it falls back to Russian.

The `LanguageProvider` is a `'use client'` component. Since `layout.tsx` is a server component (needed for `export const metadata`), a `Providers.tsx` wrapper was created — a thin client component that only wraps children with the provider. This is a common Next.js pattern.

---

**Q: How did you handle CORS?**

The NestJS backend calls `app.enableCors()` in `main.ts` with an explicit origin list from the `CORS_ORIGIN` environment variable. Only the frontend's domain is allowed. Credentials are enabled so cookies can be sent (future-proofing). Allowed methods are explicitly listed — no wildcard. The `OPTIONS` method is included for preflight requests that browsers send before cross-origin requests with Authorization headers.

---

**Q: What is the difference between B2B and B2C orders in your system?**

The `Order` model has a `type` field: `RETAIL` or `EXPORT`. B2C buyers place RETAIL orders — they pay the retail price, quantities are in consumer units (1-10 kg), delivery address is required. B2B buyers place EXPORT orders — they pay the wholesale price, there is a minimum order quantity (`moq`) field on products, and the order may involve a separate logistics arrangement.

The price each buyer sees is determined server-side by `getPriceByRole()` — the backend never sends all prices at once, only the price appropriate for the logged-in user's role.

---

**Q: Why did you build i18n from scratch instead of using a library?**

Two reasons. First, it demonstrates real understanding of React Context, TypeScript types, and how localization works — using a library hides all of that. Second, the project has a manageable number of strings and adding a library like `next-intl` would introduce route-based file structure changes that were unnecessary for this scope.

The custom implementation is under 50 lines of code, fully typed, and handles the fallback case. For a larger production app with hundreds of pages and professional translators, a library would be the right choice.

---

**Q: What validation do you have on the backend?**

NestJS `ValidationPipe` is set globally with `whitelist: true` and `forbidNonWhitelisted: true`. This means:
- Any field not declared in the DTO is silently stripped (`whitelist: true`)
- If a non-whitelisted field is present, the request is rejected with 400 (`forbidNonWhitelisted: true`)
- `class-validator` decorators on DTOs enforce types, lengths, formats (e.g., `@IsEmail()`, `@MinLength(6)`, `@IsEnum(Role)`)
- The custom `exceptionFactory` in `main.ts` formats all validation errors into a readable single string

---

**Q: How does the order status workflow work?**

Orders move through a defined lifecycle:

`PENDING → CONFIRMED → SHIPPED → DELIVERED`

or

`PENDING → CANCELLED`

Only FARMER users (or ADMIN) can update the status. The update endpoint `PATCH /api/orders/:id/status` accepts a `status` field. The frontend shows different action buttons based on current status: "Confirm" when PENDING, "Ship" when CONFIRMED, "Mark Delivered" when SHIPPED. This prevents status from jumping backwards or skipping states — the UI only shows the next valid transition.

---

**Q: How is the project deployed?**

- **Backend:** Render.com Web Service. `render.yaml` in the repo root defines the build command (`npm install && npx prisma generate && npm run build`) and start command (`npx prisma migrate deploy && node dist/main`). Environment variables (DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY) are set in the Render dashboard.

- **Frontend:** Vercel. The `vercel.json` in `/frontend` configures an API proxy rewrite — all requests to `/api/*` are forwarded to the Render backend URL. The `NEXT_PUBLIC_API_URL` environment variable is set in Vercel's dashboard.

- **Database:** Neon PostgreSQL — a serverless cloud Postgres service. The connection string is stored as `DATABASE_URL` in both local `.env` and production environment variables.

---

**Q: What would you improve if you had more time?**

1. **Real-time features:** Use WebSockets (Socket.IO with NestJS) for live order status updates instead of requiring a page refresh.
2. **Payment integration:** Integrate Kaspi Pay or Stripe for actual transactions.
3. **Image upload:** Currently products use image URLs. A real system would use Cloudinary or AWS S3 for farmer-uploaded product photos.
4. **Email notifications:** Send order confirmation emails with Nodemailer/Resend.
5. **Refresh tokens:** Replace single JWT with access token (15 min) + refresh token (30 days) pair for better security.
6. **Tests:** Add unit tests for services and integration tests for critical endpoints (auth, order creation).
7. **Admin panel:** A dedicated admin interface for verifying farmers, managing categories, and viewing analytics.

---

**Q: What was the hardest technical problem you solved?**

The hardest was the PORT conflict issue in local development. macOS had a system-level environment variable `PORT=54112` set, which was overriding the `.env` file's `PORT=3001`. NestJS was starting on port 54112, while the Next.js proxy was calling `localhost:3001` — so every API call returned a network error. The fix was to hardcode `PORT=3001` directly in all `package.json` start scripts (`"start:dev": "PORT=3001 nest start --watch"`) so the explicit value always wins regardless of the shell environment.

The lesson: environment variable precedence matters. Process environment beats `.env` files. Explicitly setting it in the script is the safest approach.

---

**Q: Why Neon PostgreSQL and not a local database or another cloud service?**

Neon is serverless PostgreSQL — it scales to zero when not in use (no idle charges), has a generous free tier, and supports database branching (separate branch for dev, one for prod). It gives a standard `DATABASE_URL` connection string, so Prisma works with it identically to any other Postgres instance. For a student project that doesn't have 24/7 traffic, it's the most economical choice while still using a production-grade database.

---

**Q: What does your Prisma schema's `@@index` accomplish?**

An index is a data structure the database builds alongside the table to speed up lookups. Without an index, querying `WHERE farmerId = 'xyz'` requires scanning every row in the products table. With `@@index([farmerId])`, Postgres can find all products for that farmer in O(log n) time using a B-tree index.

In this schema, indexes are placed on: `User.email` (login lookup), `Product.farmerId` (dashboard product list), `Product.categoryId` (category filter), `Product.expirationDate` (expiration guard scheduling), `Order.userId` (user's order history), `Order.status` (status-based filtering).

---

**Q: What is the difference between `@UseGuards(JwtAuthGuard)` and public routes?**

`JwtAuthGuard` is a NestJS guard that intercepts the request before the controller method runs. It extracts the `Authorization: Bearer <token>` header, validates the JWT signature using the secret key, and attaches the user payload to `request.user`. If the token is missing or invalid, it throws a 401 Unauthorized error before the controller code even runs.

Routes without this decorator are public — anyone can call them without a token. In this project, public routes include: GET products (browsing), GET categories, POST auth/register, POST auth/login. Everything else requires authentication.

---

**Q: How does the Three.js 3D character work?**

`FarmerCanvas` uses `@react-three/fiber` (React bindings for Three.js) and `@react-three/drei` (helpers). It renders a glTF/3D model of a Kazakh farmer character inside an HTML canvas element. The `waving` prop triggers an animation loop using `useFrame`. The `cameraY` and `cameraZ` props control where the virtual camera is positioned — this is how the same component shows a face-only crop (in the chat avatar) versus a full-body view (in the chat header) — same model, different camera angle.

`dynamic(() => import(...), { ssr: false })` is used to load the component — Three.js uses browser APIs (`window`, `WebGL`) that don't exist on the server, so it must be disabled for server-side rendering.

---

**Q: How many API endpoints does your backend have?**

The Swagger documentation at `/api/docs` lists all endpoints. The main groups are:
- **Auth:** register, login, /me (get current user)
- **Products:** list, getById, create, update, delete, syncInventory, search, getReviews, createReview, getFarmerProducts
- **Orders:** create, getUserOrders, getFarmerOrders, updateStatus
- **Categories:** list, create
- **Chat:** tattibeke (POST)
- **Gamification:** claim, leaderboard
- **Analytics:** summary (revenue, order counts by date range)

Approximately 25 endpoints in total.

---

**Q: Did you write tests?**

The backend TypeScript compiles with zero errors (`npx tsc --noEmit` passes). The frontend also compiles clean with `"strict": true` enabled. For a capstone project on this timeline, automated tests were not implemented, but the code is structured for testability — services are injected via NestJS DI, so they can be mocked in unit tests. If time allowed, the priority tests would be: auth service (register/login logic), product service (dual-inventory sync, expiration guard), and order service (status transition validation).

---

## PART 5 — DEMO FLOW (follow this order)

1. Open `http://localhost:3000` — show the landing page, point out the language switcher (EN/RU/KK)
2. Click "Тіркелу" — show the 3-step registration: role picker, credentials, details
3. Register as B2C_BUYER → show automatic redirect to home, Navbar shows "Жеке кабинет"
4. Go to /products — show the product catalogue, category filters
5. Click a product — show the detail page with price, stock, expiry badge if active
6. Add to cart — show cart badge update in Navbar
7. Go to /cart — show cart items, click "Тапсырыс беру", fill delivery form
8. Open Таттібек chat (bottom right) — type "Өнімдер қандай?" — show the AI response with suggestion chips
9. Open a new tab, register as FARMER → go to /dashboard
10. Show product creation form, then inventory sliders tab
11. Go to /gamification — show the Асық ату page design
12. Switch language to KK, then EN — show all UI strings updating live
13. Open `http://localhost:3001/api/docs` — show Swagger documentation

---

## PART 6 — QUICK REFERENCE NUMBERS

- **Lines of code:** ~8,000+ (frontend) + ~3,000+ (backend)
- **Database models:** 9 (User, Farm, Category, Product, Order, OrderItem, Review, ChatRoom, Message)
- **API endpoints:** ~25
- **Languages supported:** 3 (English, Russian, Kazakh)
- **Git commits:** 21 (conventional commits: feat/chore/fix)
- **Frontend pages:** 9 (home, login, register, products, product detail, cart, orders, dashboard, gamification, profile)
- **Npm packages (backend):** NestJS, Prisma, bcrypt, @anthropic-ai/sdk, passport-jwt, class-validator, swagger
- **Npm packages (frontend):** Next.js, Tailwind, Three.js/@react-three, sonner, axios, lucide-react
