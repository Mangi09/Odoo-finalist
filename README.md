# DealFlow360

An internal B2B quote-to-cash platform — from quotation to payment, with discount governance, upsell/cross-sell recommendations, warehouse fulfillment, subscription billing, deal health monitoring, and role-based dashboards for sales, management, finance, and customers.

Built for a hackathon demo using the **Pravaah** product catalog (laptops, monitors, accessories, cloud software, and services).

---

## 1. Overview

A salesperson creates a quotation for a customer. A discount rule engine decides whether it needs manager approval. The system recommends relevant upsell/cross-sell products. The customer reviews the quote in a restricted portal — accepting, rejecting, or negotiating. Once accepted, the deal becomes a locked **Sales Order**, which flows into warehouse allocation, one-time/recurring billing, and payment (via Razorpay). Throughout, the system tracks **deal health** so managers can spot at-risk deals early.

### End-to-end workflow

```
Requirement → Quotation → Discount Rule Engine → Approval (if needed) → Upsell/Cross-sell
→ Customer Portal → Accept / Negotiate → Re-check Rules → Sales Order (Confirmed)
→ Warehouse Allocation → Billing (One-time / Recurring) → Payment → Deal Health Monitoring
```

### Quotation state machine

```
DRAFT → PENDING_APPROVAL → APPROVED → SENT_TO_CUSTOMER → NEGOTIATION → RE_APPROVAL → ACCEPTED
(→ becomes a Sales Order) → CONFIRMED → IN_FULFILLMENT → PARTIALLY_FULFILLED → BILLED → PAID → CLOSED
```
(`REJECTED` / `CANCELLED` are terminal states at either stage.)

---

## 2. Roles

| Role | What they do |
|---|---|
| **Salesperson** | Create and edit quotations, add products, apply discounts, accept recommendations. |
| **Sales Manager** | Approve/reject discount exceptions, monitor deal health across all salespeople. |
| **Finance / Operations** | Track fulfillment, invoices, subscriptions, and payments. |
| **Customer** | View only their own deals/quotes, accept/reject, negotiate, track their own deal health. |
| **Admin** | Configure products, warehouses, tiers, discount rules; review rejected quotations. |

> Role-based login is not yet wired into the frontend UI — the backend supports full RBAC and is ready to enable multi-role login once the frontend adds it.

---

## 3. Tech Stack

**Frontend:** React 19 (Vite), vanilla CSS, `lucide-react` icons, custom state-based routing (no `react-router-dom` yet).

**Backend:** Node.js, Express, MongoDB Atlas (Mongoose), JWT auth, bcrypt, `pdfkit` (invoice PDFs), Razorpay (payments).

---

## 4. Core Modules

- **Quotations** — bulk multi-line-item quotes, editable while in draft/negotiation.
- **Discount Rule Engine** — effective limit = `min(customer-tier limit, category limit)`; auto-approves or routes to a manager; every decision is logged, never overwritten.
- **Recommendations** — upsell (e.g. NovaBook Pro → NovaBook Ultra) and cross-sell (e.g. laptop → monitor/dock/warranty) suggestions, validated server-side before becoming real quote lines.
- **Sales Orders** — an immutable, frozen snapshot of the deal created once a quotation is accepted; the source of truth for fulfillment, billing, and payment.
- **Warehouse Allocation** — allocates stock across warehouses by priority; creates backorders for shortfalls.
- **Billing** — one-time items → invoices; recurring items → subscriptions; mixed quotes split automatically. Invoices are downloadable as PDF.
- **Payments** — Razorpay integration (order creation, signature verification, webhook fallback).
- **Deal Health** — recalculated on key events (approval delay, negotiation delay, backorders, inactivity); shows score, status (HEALTHY / AT_RISK / CRITICAL), and reasons.
- **Audit Trail** — every quotation/sales-order status change and discount decision is stored as an append-only history record.

---

## 5. Product Catalog (Pravaah)

| Category | Products | Billing |
|---|---|---|
| Hardware | NovaBook Pro 14, NovaBook Ultra 16, NovaMonitor 27, NovaDock Pro, NovaKeyboard, NovaMouse Pro, Enterprise Router, Managed Switch 24-Port | One-time |
| Software | NovaCloud Pro, SecureDesk, Data Backup Pro | Monthly |
| Services | Extended Warranty, Installation Service | One-time |
| Services | Premium Support | Monthly |

**Demo story:** NovaBook Pro 14 → Monitor/Dock (cross-sell) → Warranty/Support (upsell) → NovaCloud Pro (recurring) → discount triggers approval → warehouse fulfillment → customer negotiation → billing → payment.

---

## 6. Project Structure

```
Odoo-finalist/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Navbar, shared UI
│       ├── pages/         # Dashboard, Quotations, Approvals, Fulfillment,
│       │                  # Subscriptions, Invoices, Deal Health, Reports,
│       │                  # Products, Customer Portal
│       ├── App.jsx
│       └── App.css
├── config/          # DB connection, Razorpay config, env loader
├── models/          # Mongoose schemas (Users, Quotations, SalesOrders,
│                    #   Approvals, Recommendations, Inventory, Fulfillments,
│                    #   Backorders, Negotiations, Subscriptions, Invoices,
│                    #   Payments, DealHealth, history collections, etc.)
├── middleware/      # auth, RBAC, error handling, validation
├── services/        # discountEngine, recommendationService, warehouseAllocator,
│                    #   billingService, dealHealthService, invoicePdfService,
│                    #   reportsService, paymentService
├── controllers/     # one per resource
├── routes/          # /api/v1/... endpoints
├── utils/           # apiResponse, stateMachine, logger
├── scripts/         # seed.js (loads Pravaah catalog + demo-story data)
├── .env
├── server.js
└── package.json
```

---

## 7. Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (connection string)
- Razorpay account (Test Mode keys are enough for local dev)

### Environment variables (`.env`)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

### Install & run

**Backend** (from `Odoo-finalist/` root):
```bash
npm install
npm run seed     # loads product catalog + demo-story quotation
npm run dev      # or: node server.js
```

**Frontend** (from `Odoo-finalist/client/`):
```bash
npm install
npm run dev
```

---

## 8. API Conventions

- All routes under `/api/v1/...`, JSON only.
- Response envelope: `{ success: true, data }` or `{ success: false, error: { message, code } }`.
- List endpoints support `?page=&limit=` with a `pagination` object in the response.
- Status/enum values returned exactly as stored (`UPPER_SNAKE_CASE`).
- Full endpoint reference: see `API.md` (generated alongside backend development).

---

## 9. Payments (Razorpay)

- Test Mode keys are used for local development — no real money moves.
- `POST /api/v1/payments/create-order` → returns `order_id` + `key_id` for the frontend checkout widget.
- `POST /api/v1/payments/verify` → verifies the payment signature and marks the invoice paid.
- `POST /api/v1/payments/webhook` → fallback source of truth for payment events (use `ngrok` to expose localhost during local testing).
- No secrets are ever sent to the frontend.

---

## 10. Known Limitations / Next Steps

- Role-based login UI not yet built on the frontend (backend RBAC is ready).
- `react-router-dom` not yet adopted — routing is custom state-based, so browser back/forward doesn't work yet.
- Dashboard, Deal Health, and Reports pages need their remaining UI components wired to live data.
- Razorpay is integrated last in the backend roadmap, after all other modules are verified working end to end.
