# DealFlow360 — Backend API Reference

Base URL: `http://localhost:5000/api/v1`

---

## Overview & Architecture

DealFlow360 backend is built with **Node.js, Express, MongoDB (Mongoose), and Razorpay**, providing quote-to-cash workflows matching the React frontend's exact data shapes without needing frontend UI/CSS modifications.

### Standard Response Envelope
All endpoints return standard JSON responses:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "pagination": null
}
```

### Authentication
JWT Bearer token is supported across all endpoints via `Authorization: Bearer <token>`.
In development mode, token verification is **optional** so frontend views and testing tools can query APIs immediately.

---

## Demo Credentials (Seeded)

Run `npm run seed` to reset the database with the Pravaah catalog and demo data.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dealflow360.com` | `password123` |
| Sales Manager | `manager@dealflow360.com` | `password123` |
| Salesperson | `atharva@dealflow360.com` | `password123` |

---

## Endpoint Catalog

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Log in with email and password, returns JWT token and user info |
| `POST` | `/api/v1/auth/register` | Register new user (admin / manager) |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user |

#### Sample Login Request:
```json
POST /api/v1/auth/login
{
  "email": "admin@dealflow360.com",
  "password": "password123"
}
```

---

### 2. Products (`/api/v1/products`)
Matches frontend `Products.jsx` and `ProductDetail.jsx` shapes.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List all products (supports `?category=...&billingType=...&search=...`) |
| `GET` | `/api/v1/products/:id` | Get single product by SKU or ObjectId |
| `POST` | `/api/v1/products` | Create product |
| `PUT` | `/api/v1/products/:id` | Update product |

#### Response Item Shape:
```json
{
  "_id": "6a9bfe41b4d64e74a82b60ab",
  "id": "PROD-001",
  "name": "Laptop Pro 14",
  "category": "Hardware",
  "variants": "3 options",
  "price": "$1,200",
  "sellingPrice": 1200,
  "costPrice": 900,
  "unit": "Each",
  "tax": "15%",
  "status": "Active",
  "billingType": "ONE_TIME"
}
```

---

### 3. Dashboard (`/api/v1/dashboard`)
Powers metrics on `Dashboard.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Open deals, pipeline value (₹L), action required count |
| `GET` | `/api/v1/dashboard/recent-deals` | Latest 10 deals for Recent Deals table |

---

### 4. Quotations (`/api/v1/quotations`)
Powers `QuotationsPage.jsx` and `QuotationDetailPage.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/quotations` | List quotations (supports `?status=...&search=...&customerId=...`) |
| `GET` | `/api/v1/quotations/:id` | Full quotation detail with items, customer info, and activity log |
| `POST` | `/api/v1/quotations` | Create draft quotation with items and margin calculation |
| `PUT` | `/api/v1/quotations/:id` | Update quotation items or stage |
| `POST` | `/api/v1/quotations/:id/items` | Append line item to quotation |
| `POST` | `/api/v1/quotations/:id/submit` | Evaluate discount rules via Discount Engine and advance state |

---

### 5. Approvals (`/api/v1/approvals`)
Powers `approval5.jsx` and approval workflows.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/approvals` | List approvals (supports `?status=PENDING\|APPROVED\|REJECTED`) |
| `GET` | `/api/v1/approvals/:id` | Single approval detail with margin impact |
| `PATCH` | `/api/v1/approvals/:id` | Approve or reject discount exception, updates Quotation status |

#### Sample Approve Request:
```json
PATCH /api/v1/approvals/:id
{
  "status": "APPROVED",
  "reason": "Approved as strategic enterprise deal"
}
```

---

### 6. Recommendations (`/api/v1`)
Cross-sell and upsell engine based on quotation items.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/quotations/:id/recommendations` | Generate category-based cross-sell & upsell suggestions |
| `POST` | `/api/v1/recommendations/:id/accept` | Add recommended item to quotation, recalculate totals |
| `POST` | `/api/v1/recommendations/:id/reject` | Dismiss recommendation |

---

### 7. Customer Portal (`/api/v1/portal`)
Powers `CustomerPortal.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/portal/quotation/:id` | Customer-safe view of quotation |
| `POST` | `/api/v1/portal/quotation/:id/accept` | Confirm quote → triggers warehouse inventory allocation & billing |
| `POST` | `/api/v1/portal/quotation/:id/reject` | Customer cancels/rejects quotation |
| `POST` | `/api/v1/portal/quotation/:id/negotiate` | Counter-offer: auto-accepts if <=12% threshold, else triggers re-approval |

---

### 8. Fulfillment (`/api/v1/fulfillments`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/fulfillments` | List fulfillment items with warehouse allocation info |
| `GET` | `/api/v1/fulfillments/:id` | Single fulfillment detail |
| `PATCH` | `/api/v1/fulfillments/:id` | Advance status (`RESERVED` → `SHIPPED` → `DELIVERED`) |

---

### 9. Subscriptions (`/api/v1/subscriptions`)
Powers `Subscriptions.jsx` and `BillingDetail.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/subscriptions` | List subscriptions (supports `?status=active\|paused\|cancelled`) |
| `GET` | `/api/v1/subscriptions/:id` | Subscription detail |
| `PATCH` | `/api/v1/subscriptions/:id` | Update status (`ACTIVE`, `PAUSED`, `CANCELLED`) |

---

### 10. Invoices (`/api/v1/invoices`)
Powers `Invoices.jsx` and `InvoiceDetailPage.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/invoices` | List invoices (supports `?status=...&type=...`) |
| `GET` | `/api/v1/invoices/:id` | Invoice detail with linked deal and payment history |
| `GET` | `/api/v1/invoices/:id/pdf` | Stream generated PDF document (PDFKit) |
| `POST` | `/api/v1/invoices/:id/payments` | Record offline/manual payment |

---

### 11. Deal Health (`/api/v1/deal-health`)
Powers `DealHealthPage.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/deal-health` | Aggregates health summary, distribution, anomalies, and at-risk deals |
| `POST` | `/api/v1/deal-health/recalculate/:quotationId` | Trigger real-time score recalculation |

---

### 12. Reports & Admin Dashboard (`/api/v1/reports`)
Powers `AdminDashboardPage.jsx`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/reports/kpis` | `activeDeals`, `revenuePipeline`, `pendingApprovals`, `paymentsCollected` |
| `GET` | `/api/v1/reports/lifecycle` | Deal stage progression counts and completion rates |
| `GET` | `/api/v1/reports/analytics` | Sales conversion, negotiation stats, fulfillment & finance metrics |
| `GET` | `/api/v1/reports/attention` | Approval bottlenecks, delayed fulfillment, and overdue invoice items |
| `GET` | `/api/v1/reports/activity` | Recent audit events across the platform |

---

### 13. Razorpay Payments (`/api/v1/payments`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/create-order` | Generates Razorpay order for an invoice |
| `POST` | `/api/v1/payments/verify` | Verifies HMAC-SHA256 signature, creates Payment, updates Invoice |
| `POST` | `/api/v1/payments/webhook` | Webhook listener for `payment.captured` |

---

## Running the Backend

```bash
# Seed the database
npm run seed

# Run the test suite
node scripts/test-endpoints.js

# Start development server
npm run dev

# Start production server
npm start
```
