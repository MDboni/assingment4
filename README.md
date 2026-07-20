# RentNest 🏠

**Find & List Rental Properties with Ease** — a rental property marketplace REST API.

Landlords list properties and decide on rental requests, tenants browse listings, request rentals, pay with Stripe and leave reviews, and admins moderate the whole platform.

---

## 🔗 Links

| Item | Link |
|---|---|
| Live API | `https://<your-app>.vercel.app` |
| API Documentation (Postman) | `<postman published docs link>` |
| Demo Video | `<google drive / loom link>` |
| GitHub Repo | https://github.com/MDboni/assingment4 |

## 🔑 Admin Credentials

```
Email    : admin@rentnest.com
Password : admin123
```

Other seeded demo accounts (same password `Admin@12345`):

| Role | Email |
|---|---|
| LANDLORD | demo.landlord@rentnest.com |
| TENANT | demo.tenant@rentnest.com |

> ADMIN account public registration দিয়ে বানানো যায় না — শুধু seed script থেকে তৈরি হয়।

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT (httpOnly cookie + Bearer header) |
| Validation | Zod 4 |
| Payment | Stripe Checkout + Webhook |
| Security | helmet, cors, express-rate-limit, bcrypt |
| Deployment | Vercel |

---

## 🚀 Local Setup

```bash
# 1. clone & install
git clone https://github.com/MDboni/assingment4.git
cd assingment4
npm install

# 2. environment
cp .env.example .env      # তারপর নিজের value গুলো বসাও

# 3. database
npx prisma migrate deploy   # অথবা dev-এ: npx prisma migrate dev
npx prisma generate
npm run seed                # admin, demo users, categories, sample properties

# 4. run
npm run dev                 # http://localhost:5000
```

Production build:

```bash
npm run build
npm start
```

### Scripts

| Command | কাজ |
|---|---|
| `npm run dev` | tsx watch দিয়ে development server |
| `npm run build` | TypeScript → `dist/` |
| `npm start` | compiled server চালায় |
| `npm run type-check` | শুধু টাইপ যাচাই |
| `npm run seed` | demo data ঢোকায় |
| `npm run prisma:migrate` | নতুন migration |
| `npm run prisma:deploy` | production-এ migration চালায় |
| `npm run prisma:studio` | Prisma Studio |

---

## 🔐 Environment Variables

`.env.example` দেখো। সংক্ষেপে:

| Variable | কাজ |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | server port (default 5000) |
| `APP_URL` | CORS origin (frontend URL) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | token signing |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | মেয়াদ (`1d`, `7d`) |
| `BCRYPT_SALT_ROUNDS` | password hashing (12) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | webhook signature verify |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | checkout redirect |
| `PAYMENT_CURRENCY` | Stripe currency (default `USD`) |

---

## 👥 Roles

| Role | পারে |
|---|---|
| **TENANT** | listing দেখা, rental request পাঠানো/বাতিল করা, payment, review |
| **LANDLORD** | property CRUD, নিজের property-র request approve/reject/complete |
| **ADMIN** | সব user/property/rental দেখা, user ban/unban, category management |

Registration-এ user নিজের role বেছে নেয় — তবে **ADMIN বেছে নেওয়া যায় না**।

---

## 📡 API Endpoints

Base URL: `http://localhost:5000`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (TENANT / LANDLORD) |
| POST | `/api/auth/login` | Public | Login, JWT + cookie |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/auth/logout` | Public | Cookie clear |

### User Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Auth | নিজের profile + activity count |
| PATCH | `/api/users/me` | Auth | name / phone / bio update |
| PATCH | `/api/users/me/password` | Auth | password change |

### Properties (Public)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | Filter, search, sort, pagination |
| GET | `/api/properties/:id` | Public | Details + reviews + rating summary |
| GET | `/api/categories` | Public | Active categories |

`/api/properties` query: `search`, `city`, `area`, `categoryId`, `categorySlug`, `bedrooms`, `bathrooms`, `minPrice`, `maxPrice`, `amenity`, `sortBy` (`monthlyRent`/`createdAt`/`bedrooms`/`sizeSqft`/`title`), `sortOrder`, `page`, `limit`

### Landlord
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/landlord/properties` | LANDLORD | নতুন listing |
| PUT | `/api/landlord/properties/:id` | LANDLORD | listing update |
| DELETE | `/api/landlord/properties/:id` | LANDLORD | delete / archive |
| GET | `/api/landlord/requests` | LANDLORD | নিজের property-র request |
| PATCH | `/api/landlord/requests/:id` | LANDLORD | approve / reject |
| PATCH | `/api/landlord/requests/:id/complete` | LANDLORD | ACTIVE → COMPLETED |

### Rental Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rentals` | TENANT | request পাঠানো |
| GET | `/api/rentals` | TENANT | নিজের history |
| GET | `/api/rentals/:id` | Related / ADMIN | details |
| PATCH | `/api/rentals/:id/cancel` | TENANT | PENDING/APPROVED cancel |

### Payments (Stripe)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create` | TENANT | Checkout session তৈরি |
| POST | `/api/payments/confirm` | Stripe webhook | signature verify + status update |
| GET | `/api/payments` | Auth | payment history (ADMIN = সব) |
| GET | `/api/payments/:id` | Related / ADMIN | payment details |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | TENANT | COMPLETED rental-এর review |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | সব user (filter/search) |
| PATCH | `/api/admin/users/:id` | ADMIN | ban / unban |
| GET | `/api/admin/properties` | ADMIN | সব property (সব status) |
| GET | `/api/admin/rentals` | ADMIN | সব rental request |
| GET | `/api/admin/categories` | ADMIN | inactive সহ সব category |
| POST | `/api/admin/categories` | ADMIN | নতুন category |
| PATCH | `/api/admin/categories/:id` | ADMIN | category update |
| DELETE | `/api/admin/categories/:id` | ADMIN | delete / deactivate |

### Utility
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | DB সহ health check |
| GET | `/payment/success`, `/payment/cancel` | Stripe redirect landing |

---

## 📦 Response Format

সফল:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 14 }
}
```

ব্যর্থ:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorDetails": [
    { "path": "body.email", "message": "Invalid email address" }
  ]
}
```

| Code | কখন |
|---|---|
| 400 | validation / invalid state transition |
| 401 | token নেই বা ভুল credentials |
| 403 | role বা ownership মেলেনি |
| 404 | resource নেই |
| 409 | duplicate (email, request, review) |
| 429 | rate limit |
| 500 | unexpected |

---

## 💳 Payment Testing (Stripe)

1. আলাদা টার্মিনালে webhook forward করো:

   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```

   এটা যে `whsec_...` দেবে সেটা `.env`-এর `STRIPE_WEBHOOK_SECRET` এ বসাও।

2. Flow:

   | ধাপ | Request |
   |---|---|
   | 1 | Tenant login → `POST /api/rentals` |
   | 2 | Landlord login → `PATCH /api/landlord/requests/:id` → `{"status":"APPROVED"}` |
   | 3 | Tenant login → `POST /api/payments/create` → `checkoutUrl` |
   | 4 | ব্রাউজারে checkoutUrl → test card `4242 4242 4242 4242`, যেকোনো future expiry, যেকোনো CVC |
   | 5 | Webhook আসবে → Payment `COMPLETED`, Rental `ACTIVE`, Property `RENTED` |
   | 6 | Landlord → `PATCH /api/landlord/requests/:id/complete` → `COMPLETED` |
   | 7 | Tenant → `POST /api/reviews` |

**নিরাপত্তা:** Database কখনো success URL দেখে update হয় না — শুধু signed webhook থেকেই হয়। Webhook duplicate event পাঠালে handler idempotent, দুইবার কাজ করে না।

**Currency:** Stripe BDT সাপোর্ট করে না, তাই demo-তে amount `USD` হিসেবে পাঠানো হয় (`PAYMENT_CURRENCY` দিয়ে বদলানো যায়)।

---

## 🗄️ Database Schema

৬টা model — `User`, `Category`, `Property`, `RentalRequest`, `Payment`, `Review`।

সম্পর্ক:
- একজন LANDLORD → অনেক Property
- একজন TENANT → অনেক RentalRequest
- একটা Category → অনেক Property
- একটা Property → অনেক RentalRequest ও Review
- একটা RentalRequest → এক বা একাধিক Payment, সর্বোচ্চ একটা Review

### Rental status flow

```
PENDING ──approve──> APPROVED ──payment──> PAYMENT_PENDING ──webhook──> ACTIVE ──> COMPLETED
   │                     │                                                            │
   ├──reject──> REJECTED │                                                       review দেওয়া যায়
   └──cancel──> CANCELLED <──cancel──┘
```

---

## ✅ Business Rules

- Email unique এবং lowercase-এ সংরক্ষিত; password bcrypt দিয়ে hash; response-এ password কখনো যায় না
- ADMIN public registration বন্ধ
- BANNED user login বা protected route access করতে পারে না
- Landlord শুধু নিজের property modify করতে পারে; `landlordId` সবসময় token থেকে নেওয়া হয়
- Public property list-এ শুধু `AVAILABLE` property আসে
- Tenant নিজের property ভাড়া নিতে পারে না; একই property-তে একাধিক চলমান request নয়
- শুধু `PENDING` request approve/reject করা যায়
- `quotedAmount` ও payment amount সবসময় database থেকে আসে, client থেকে নয়
- শুধু `APPROVED` rental-এর জন্য payment করা যায়; একবার paid হলে আবার নয়
- Review শুধু নিজের `COMPLETED` rental-এ, প্রতি rental-এ একটাই, rating 1-5
- Admin নিজেকে ban করতে পারে না, অন্য admin-কেও নয়

---

## ☁️ Deployment (Vercel)

1. GitHub-এ push করো
2. [vercel.com](https://vercel.com) → **Add New Project** → repo import
3. **Environment Variables**-এ `.env.example`-এর সব key বসাও (`NODE_ENV=production`, production `STRIPE_WEBHOOK_SECRET`)
4. Deploy
5. Stripe Dashboard → Developers → Webhooks → endpoint যোগ করো:
   `https://<your-app>.vercel.app/api/payments/confirm` — event: `checkout.session.completed`
6. সেখানকার `whsec_...` টা Vercel env-এ বসিয়ে redeploy করো

`vercel.json` আর `api/index.ts` রিপোতেই আছে — Vercel Express app টাকে serverless function হিসেবে চালায়।

---

## ⚠️ Known Limitations

- SSLCommerz যোগ করা হয়নি — assignment-এ Stripe **অথবা** SSLCommerz চাওয়া হয়েছে, Stripe বেছে নেওয়া হয়েছে
- Image upload endpoint নেই — property image URL হিসেবে পাঠাতে হয়
- Refresh token cookie-তে দেওয়া হয় কিন্তু আলাদা refresh endpoint নেই
- Serverless (Vercel) হওয়ায় প্রথম request-এ সামান্য cold start delay হতে পারে
