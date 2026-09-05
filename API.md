# DealFlow360 — Backend API Reference

Base URL: `http://localhost:5000/api/v1`

---

## Overview & Architecture

DealFlow360 backend is built with **Node.js, Express, MongoDB (Mongoose), and Razorpay**, providing quote-to-cash workflows matching the React frontend's exact data shapes without needing frontend UI/CSS modifications.

### Architecture Core: Quotation vs SalesOrder Separation
- **Quotation**: Mutable draft proposals that undergo internal discount engine approvals and customer negotiations. Quotation lifecycle terminates at status `ACCEPTED` (or `REJECTED`/`CANCELLED`).
- **SalesOrder**: Frozen, immutable post-acceptance deal snapshot. Created upon Quotation acceptance, powering downstream operational workflows (Warehouse Inventory Allocation, Billing/Invoicing, Subscriptions, and Audit Trails).

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

---

### 2. Products (`/api/v1/products`)
Matches frontend `Products.jsx` and `ProductDetail.jsx` shapes.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List all products (supports `?category=...&billingType=...&search=...`) |
| `GET` | `/api/v1/products/:id` | Get single product by SKU or ObjectId |
| `POST` | `/api/v1/products` | Create product |
| `PUT` | `/api/v1/products/:id` | Update product |

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

**Status Lifecycle**: `DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `SENT_TO_CUSTOMER` $\rightarrow$ `NEGOTIATION` $\rightarrow$ `RE_APPROVAL` $\rightarrow$ `ACCEPTED` (or `REJECTED`/`CANCELLED`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/quotations` | List quotations (supports `?status=...&search=...&customerId=...`) |
| `GET` | `/api/v1/quotations/:id` | Full quotation detail with multi-item array, customer info, and activity log |
| `POST` | `/api/v1/quotations` | Create draft quotation with bulk line items and dynamic margin calculation |
| `PUT` | `/api/v1/quotations/:id` | Update quotation items or stage |
| `POST` | `/api/v1/quotations/:id/items` | Append line item to quotation |
| `POST` | `/api/v1/quotations/:id/submit` | Evaluate discount rules per line item via Discount Engine and advance state |
| `POST` | `/api/v1/quotations/:id/accept` | Accept quotation and convert to frozen `SalesOrder` |

---

### 5. Sales Orders (`/api/v1/sales-orders`) — NEW

Immutable post-acceptance deal records.

**Status Lifecycle**: `CONFIRMED` $\rightarrow$ `IN_FULFILLMENT` $\rightarrow$ `PARTIALLY_FULFILLED` $\rightarrow$ `BILLED` $\rightarrow$ `PAID` $\rightarrow$ `CLOSED` (or `CANCELLED`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sales-orders` | List sales orders (supports `?status=...&search=...&customerId=...`) |
| `GET` | `/api/v1/sales-orders/:id` | Detailed SalesOrder view with frozen items, history, fulfillments, invoices, subscriptions |
| `PATCH` | `/api/v1/sales-orders/:id/status` | Advance SalesOrder status (Strict immutability: pricing/items cannot be changed) |

#### Sample SalesOrder Object:
```json
{
  "_id": "6a9bfe41b4d64e74a82b9012",
  "orderNumber": "SO-2026-8942",
  "quotationId": "6a9bfe41b4d64e74a82b60e4",
  "customer": "Vertex Enterprises",
  "salesperson": "Atharva K.",
  "totalAmount": 925000,
  "totalMargin": 290000,
  "status": "IN_FULFILLMENT",
  "confirmedAt": "2026-09-05T19:15:00.000Z",
  "items": [
    {
      "quotationItemId": "6a9bfe41b4d64e74a82b60e5",
      "productId": "6a9bfe41b4d64e74a82b6010",
      "product": "NovaBook Ultra 16",
      "quantity": 5,
      "unitPrice": 1850,
      "discountPercent": 10,
      "lineTotal": 8325,
      "lineMargin": 2162,
      "billingType": "ONE_TIME"
    }
  ]
}
```

---

### 6. Approvals (`/api/v1/approvals`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/approvals` | List approvals with line-item reference (`quotationItemId`) |
| `GET` | `/api/v1/approvals/:id` | Single approval detail with margin impact |
| `PATCH` | `/api/v1/approvals/:id` | Approve or reject discount exception, updates Quotation status |

---

### 7. Recommendations (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/quotations/:id/recommendations` | Generate category-based cross-sell & upsell suggestions |
| `POST` | `/api/v1/recommendations/:id/accept` | Add recommended item to quotation, recalculate totals |
| `POST` | `/api/v1/recommendations/:id/reject` | Dismiss recommendation |

---

### 8. Customer Portal (`/api/v1/portal`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/portal/quotation/:id` | Customer-safe view of quotation |
| `POST` | `/api/v1/portal/quotation/:id/accept` | Confirm quote $\rightarrow$ creates `SalesOrder`, triggers warehouse allocation & billing |
| `POST` | `/api/v1/portal/quotation/:id/reject` | Customer cancels/rejects quotation |
| `POST` | `/api/v1/portal/quotation/:id/negotiate` | Counter-offer: auto-accepts if <=12% threshold, else triggers re-approval |

---

### 9. Fulfillment (`/api/v1/fulfillments`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/fulfillments` | List fulfillment items referencing `salesOrderId` and `salesOrderItemId` |
| `GET` | `/api/v1/fulfillments/:id` | Single fulfillment detail |
| `PATCH` | `/api/v1/fulfillments/:id` | Advance status (`RESERVED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`), updates SalesOrder status |

---

### 10. Subscriptions (`/api/v1/subscriptions`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/subscriptions` | List subscriptions linked to `salesOrderId` |
| `GET` | `/api/v1/subscriptions/:id` | Subscription detail |
| `PATCH` | `/api/v1/subscriptions/:id` | Update status (`ACTIVE`, `PAUSED`, `CANCELLED`) |

---

### 11. Invoices (`/api/v1/invoices`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/invoices` | List invoices linked to `salesOrderId` |
| `GET` | `/api/v1/invoices/:id` | Invoice detail with linked deal and payment history |
| `GET` | `/api/v1/invoices/:id/pdf` | Stream generated PDF document (PDFKit) |
| `POST` | `/api/v1/invoices/:id/payments` | Record offline/manual payment |

---

### 12. Deal Health (`/api/v1/deal-health`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/deal-health` | Aggregates health summary, distribution, anomalies, and at-risk deals across Quotations & SalesOrders |
| `POST` | `/api/v1/deal-health/recalculate/:id` | Trigger real-time score recalculation for Quotation or SalesOrder |

---

### 13. Reports & Admin Dashboard (`/api/v1/reports`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/reports/kpis` | `activeDeals`, `revenuePipeline`, `pendingApprovals`, `paymentsCollected` |
| `GET` | `/api/v1/reports/lifecycle` | Deal stage progression counts and completion rates |
| `GET` | `/api/v1/reports/analytics` | Sales conversion, negotiation stats, fulfillment & finance metrics |
| `GET` | `/api/v1/reports/attention` | Approval bottlenecks, delayed fulfillment, and overdue invoice items |
| `GET` | `/api/v1/reports/activity` | Recent audit events across QuotationHistory and SalesOrderHistory |

---

### 14. Razorpay Payments (`/api/v1/payments`)

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

# Run the endpoint test suite
node scripts/test-endpoints.js

# Run payment test suite
node scripts/test-payment.js

# Start development server
npm run dev

# Start production server
npm start
```
