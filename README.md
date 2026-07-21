# RentNest 🏠

**Find & List Rental Properties with Ease** — a rental property marketplace REST API.

Landlords list properties and decide on rental requests. Tenants browse listings, submit rental requests, pay with Stripe and leave reviews. Admins moderate the entire platform.

---

## 🔗 Submission Links

| Item | Link |
|---|---|
| Live API | https://assingment4-nu.vercel.app |
| API Documentation (Postman) | `<postman published docs link>` |
| Demo Video | `<google drive / loom link>` |
| GitHub Repo | https://github.com/MDboni/assingment4 |

## 🔑 Admin Credentials

```
Email    : admin@rentnest.com
Password : admin123
```

Other seeded demo accounts (password `Admin@12345`):

| Role | Email |
|---|---|
| LANDLORD | demo.landlord@rentnest.com |
| TENANT | demo.tenant@rentnest.com |

> The ADMIN account cannot be created through public registration — it is created only by the seed script.

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
# 1. Clone and install
git clone https://github.com/MDboni/assingment4.git
cd assingment4
npm install

# 2. Environment
cp .env.example .env      # then fill in your own values

# 3. Database
npx prisma migrate deploy   # for development: npx prisma migrate dev
npx prisma generate
npm run seed                # admin, demo users, categories, sample properties

# 4. Run
npm run dev                 # http://localhost:5000
```

Production build:

```bash
npm run build
npm start
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with tsx watch |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |
| `npm run type-check` | Type checking only |
| `npm run seed` | Insert demo data |
| `npm run prisma:migrate` | Create a new migration |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run prisma:studio` | Open Prisma Studio |

---

## 🔐 Environment Variables

See `.env.example` for the full list.

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default 5000) |
| `APP_URL` | CORS origin (frontend URL) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetime (`1d`, `7d`) |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds (12) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | Checkout redirect URLs |
| `PAYMENT_CURRENCY` | Stripe currency (default `USD`) |

---

## 👥 Roles & Permissions

| Role | Permissions |
|---|---|
| **TENANT** | Browse listings, submit and cancel rental requests, make payments, leave reviews, manage profile |
| **LANDLORD** | Create/update/delete own listings, approve/reject/complete requests on own properties |
| **ADMIN** | View all users, properties and rentals, ban/unban users, manage categories |

Users select their role during registration — but **ADMIN cannot be selected**.

---

## 📡 API Endpoints

Base URL: `http://localhost:5000`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (TENANT / LANDLORD) |
| POST | `/api/auth/login` | Public | Login, returns JWT and sets cookie |
| GET | `/api/auth/me` | Auth | Current authenticated user |
| POST | `/api/auth/logout` | Public | Clear auth cookies |

### User Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Auth | Own profile with activity counts |
| PATCH | `/api/users/me` | Auth | Update name / phone / bio |
| PATCH | `/api/users/me/password` | Auth | Change password |

### Properties (Public)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | Filter, search, sort, pagination |
| GET | `/api/properties/:id` | Public | Details with reviews and rating summary |
| GET | `/api/categories` | Public | Active categories |

**Query parameters for `/api/properties`:** `search`, `city`, `area`, `categoryId`, `categorySlug`, `bedrooms`, `bathrooms`, `minPrice`, `maxPrice`, `amenity`, `sortBy` (`monthlyRent` / `createdAt` / `bedrooms` / `sizeSqft` / `title`), `sortOrder`, `page`, `limit`

Example:
```
GET /api/properties?city=Dhaka&minPrice=10000&maxPrice=50000&sortBy=monthlyRent&sortOrder=asc&page=1&limit=10
```

### Landlord Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/landlord/properties` | LANDLORD | Create a new listing |
| PUT | `/api/landlord/properties/:id` | LANDLORD | Update own listing |
| DELETE | `/api/landlord/properties/:id` | LANDLORD | Delete (or archive) own listing |
| GET | `/api/landlord/requests` | LANDLORD | Rental requests on own properties |
| PATCH | `/api/landlord/requests/:id` | LANDLORD | Approve or reject a request |
| PATCH | `/api/landlord/requests/:id/complete` | LANDLORD | Mark an ACTIVE rental as COMPLETED |

### Rental Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rentals` | TENANT | Submit a rental request |
| GET | `/api/rentals` | TENANT | Own rental history |
| GET | `/api/rentals/:id` | Related / ADMIN | Rental request details |
| PATCH | `/api/rentals/:id/cancel` | TENANT | Cancel a PENDING or APPROVED request |

### Payments (Stripe)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create` | TENANT | Create a Stripe Checkout session |
| POST | `/api/payments/confirm` | Stripe webhook | Verify event and update payment status |
| GET | `/api/payments` | Auth | Payment history (ADMIN sees all) |
| GET | `/api/payments/:id` | Related / ADMIN | Payment details |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | TENANT | Create a review for a COMPLETED rental |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | All users (search and filter) |
| PATCH | `/api/admin/users/:id` | ADMIN | Ban / unban a user |
| GET | `/api/admin/properties` | ADMIN | All properties (every status) |
| GET | `/api/admin/rentals` | ADMIN | All rental requests |
| GET | `/api/admin/categories` | ADMIN | All categories including inactive |
| POST | `/api/admin/categories` | ADMIN | Create a category |
| PATCH | `/api/admin/categories/:id` | ADMIN | Update a category |
| DELETE | `/api/admin/categories/:id` | ADMIN | Delete or deactivate a category |

### Utility
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check including database |
| GET | `/payment/success`, `/payment/cancel` | Stripe redirect landing pages |

---

## 📦 Response Format

Success:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 14 }
}
```

Error:

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

| Code | When |
|---|---|
| 400 | Validation failure or invalid state transition |
| 401 | Missing/invalid token, wrong credentials |
| 403 | Role or ownership check failed |
| 404 | Resource not found |
| 409 | Duplicate (email, rental request, review) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

## 💳 Payment Testing (Stripe)

1. Forward webhooks in a separate terminal:

   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```

   Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in `.env`.

2. Full flow:

   | Step | Request |
   |---|---|
   | 1 | Tenant login → `POST /api/rentals` |
   | 2 | Landlord login → `PATCH /api/landlord/requests/:id` → `{"status":"APPROVED"}` |
   | 3 | Tenant login → `POST /api/payments/create` → returns `checkoutUrl` |
   | 4 | Open `checkoutUrl` in a browser → test card `4242 4242 4242 4242`, any future expiry, any CVC |
   | 5 | Webhook fires → Payment `COMPLETED`, Rental `ACTIVE`, Property `RENTED` |
   | 6 | Landlord → `PATCH /api/landlord/requests/:id/complete` → `COMPLETED` |
   | 7 | Tenant → `POST /api/reviews` |

### Webhook verification

The database is never updated from the success URL — only from a verified webhook event. A session is marked paid only when Stripe reports `payment_status: "paid"`, and the handler is idempotent so duplicate deliveries are safe.

Events are verified in one of two ways:

1. **Signature verification** (default) — raw request body plus the `stripe-signature` header, checked against `STRIPE_WEBHOOK_SECRET`.
2. **Stripe API verification** (fallback) — serverless platforms such as Vercel parse the request body before it reaches Express, so the exact raw bytes are not available. In that case the event id is read from the payload and the event is fetched directly from the Stripe API. A forged event is rejected because Stripe does not return it.

**Currency:** Stripe does not support BDT, so amounts are sent as `USD` in this demo (configurable via `PAYMENT_CURRENCY`).

---

## 🗄️ Database Schema

Six models — `User`, `Category`, `Property`, `RentalRequest`, `Payment`, `Review`.

Relations:
- One LANDLORD → many Properties
- One TENANT → many RentalRequests
- One Category → many Properties
- One Property → many RentalRequests and Reviews
- One RentalRequest → one or more Payments, at most one Review

### Rental status flow

```
PENDING ──approve──> APPROVED ──payment──> PAYMENT_PENDING ──webhook──> ACTIVE ──> COMPLETED
   │                     │                                                            │
   ├──reject──> REJECTED │                                                    review allowed here
   └──cancel──> CANCELLED <──cancel──┘
```

---

## ✅ Business Rules

- Emails are unique and stored lowercase; passwords are bcrypt hashed and never returned in responses
- ADMIN registration through the public endpoint is disabled
- BANNED users cannot log in or access protected routes
- Landlords can only modify their own properties; `landlordId` always comes from the token, never the request body
- The public property list only returns `AVAILABLE` properties
- Tenants cannot rent their own property, and cannot have two ongoing requests on the same property
- Only `PENDING` requests can be approved or rejected
- `quotedAmount` and payment amounts always come from the database, never from the client
- Only `APPROVED` rentals can be paid, and only once
- Reviews require a `COMPLETED` rental owned by the tenant; one review per rental, rating 1–5
- Admins cannot ban themselves or other admins

---

## ☁️ Deployment (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repository
3. Add every key from `.env.example` under **Environment Variables** (`NODE_ENV=production` and the production `STRIPE_WEBHOOK_SECRET`)
4. Deploy
5. In Stripe Dashboard → Developers → Webhooks, add the endpoint:
   `https://<your-app>.vercel.app/api/payments/confirm` with event `checkout.session.completed`
6. Put the resulting `whsec_...` into the Vercel environment variables and redeploy

`vercel.json` and `api/index.ts` are already in the repo — Vercel runs the Express app as a serverless function.

---

## ⚠️ Known Limitations

- SSLCommerz is not integrated — the assignment allows Stripe **or** SSLCommerz, and Stripe was chosen
- No image upload endpoint — property images are provided as URLs
- A refresh token cookie is issued, but there is no separate refresh endpoint yet
- Being serverless, the first request after idle may have a short cold start delay
