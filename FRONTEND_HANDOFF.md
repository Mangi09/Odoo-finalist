# DealFlow360 Frontend Handoff

## 1. Project Overview
DealFlow360 is a sales and operations management web application. It handles the entire lifecycle of a deal, from dashboard overview and quotations to discount approvals, fulfillment, invoicing, and subscription tracking. The frontend acts as the user interface for sales reps, managers, and fulfillment teams to interact with this pipeline.

## 2. Tech Stack
- **Framework:** React (v19.2.8)
- **Build Tool:** Vite (v8.2.2)
- **Styling:** Vanilla CSS (`App.css`, `index.css`)
- **Icons:** `lucide-react`
- **Routing:** Custom state-based routing (no `react-router-dom`)
- **Animations/Libraries:** None strictly implemented beyond standard React/CSS.

## 3. Project Structure
The `client` folder is structured as a standard React Vite application:
- `src/`
  - `components/` - Shared UI components (e.g., `Navbar.jsx`).
  - `pages/` - Individual page views for different features.
  - `App.jsx` - Root application component handling state-based routing and layout wrapper.
  - `App.css` - Global design system and layout styling.
  - `main.jsx` - React entry point.
- `package.json` - Dependency and script definitions.

## 4. Architecture
- **Component Structure:** A main `App.jsx` layout wrapper that renders a global `<Navbar />` and dynamically loads page components inside a `<main className="content">` tag based on state.
- **State Management:** Handled locally via `useState` in `App.jsx` (`currentTab`, `selectedSubscription`, `selectedApproval`, `selectedFulfillment`).
- **Data Flow:** Parent `App.jsx` passes state data and an `onNavigate` function down to child pages.
- **Backend/API:** Currently completely mocked. Data is hardcoded as arrays within the individual page components. Not connected to any live backend.

## 5. Routes & Navigation
Navigation is handled by a custom `onNavigate` function passed down from `App.jsx`. 

| Route | Page/Component | Purpose | Navigation/Access |
|---|---|---|---|
| `dashboard` | `Dashboard.jsx` | Main entry view for metrics | Navbar > Dashboard |
| `quotations` | `QuotationsPage.jsx` | Kanban board for deals | Navbar > Quotations |
| `approvals` | `approval5.jsx` | List of items needing discount approval | Navbar > Approvals |
| `approval-detail` | `ApprovalDetail.jsx` | Specific approval item view | Row click in Approvals |
| `fulfillment-list` | `FulfillmentList.jsx` | List of fulfilled/pending orders | Navbar > Fulfillment |
| `fulfillment-detail`| `FulfillmentDetail.jsx`| Specific fulfillment item view | Row click in Fulfillment |
| `subscriptions` | `Subscriptions.jsx` | Recurring subscription management | Navbar > Subscriptions |
| `invoices` | `Invoices.jsx` | Billing and invoicing list | Navbar > Invoices |
| `deal-health` | `DealHealthPage.jsx` | AI-driven deal health overview | Navbar > Deal Health |
| `reports` | `AdminDashboardPage.jsx`| Administrator metrics & KPIs | Navbar > Reports |
| `product` | `Products.jsx` | Product and pricing catalog | Navbar > Product |
| `customer-portal` | `CustomerPortal.jsx` | External customer-facing view | Navbar > Customer Portal |
| `billing-detail` | `BillingDetail.jsx` | Detailed billing (Screen 10) | Row click in Subscriptions |

## 6. Page Breakdown
- **Dashboard (`Dashboard.jsx`):** Intended as a high-level overview. Currently acts as a placeholder as UI layout components are missing.
- **Quotations (`QuotationsPage.jsx`):** Intended for deal tracking. Currently a placeholder.
- **Approvals (`approval5.jsx`):** Shows a table of pending and approved discounts with colored status pills.
- **Approval Detail (`ApprovalDetail.jsx`):** Detailed view of a discount request, including margin impact and workflow stages.
- **Fulfillment List (`FulfillmentList.jsx`):** Table showing hardware and service fulfillment statuses.
- **Fulfillment Detail (`FulfillmentDetail.jsx`):** Breakdown of line items for a specific order's delivery.
- **Subscriptions (`Subscriptions.jsx`):** Table showing recurring software/service plans and their statuses.
- **Invoices (`Invoices.jsx`):** Table of financial documents and payment states.
- **Products (`Products.jsx`):** Table of SKUs and categories for hardware and software.
- **Deal Health (`DealHealthPage.jsx`):** Placeholder page for AI insights.
- **Reports (`AdminDashboardPage.jsx`):** Placeholder page for admin metrics.
- **Customer Portal (`CustomerPortal.jsx`):** Mock view of what the end customer sees when reviewing quotes.

## 7. User Workflow
The intended DealFlow360 business workflow (though currently disjointed by mocks) is:
1. Sales rep views **Dashboard** (Missing UI).
2. Generates quote in **Quotations** (Missing UI).
3. Requests discount, pushing quote to **Approvals**.
4. Manager clicks an approval row, opening **Approval Detail**, and approves.
5. Deal is closed; hardware goes to **Fulfillment** (List -> Detail).
6. Software generates a **Subscription** (List -> Detail).
7. Finance views **Invoices**.
8. Customers view their quotes in the **Customer Portal**.

## 8. UI/UX Design System
- **Typography:** Uses Google Font `Nunito` for a clean, rounded, modern look.
- **Colors:** 
  - Background: Off-white (`#fcfcfc`)
  - Primary Theme/Navbar: Purple-gray (`#714b67`)
  - Text: Dark slate (`#2c3e50`)
  - Status Indicators: Amber (`#f49a00`), Red (`#e82d32`), Green (`#299b45`).
- **Components:** Standardized around a top global `Navbar` with horizontally scrolling items. Pages utilize a max-width centered `<main className="content">` container.
- **Tables:** Extensive use of data tables with subtle hover states and distinct, bold headers.

## 9. Landing Page
Currently, the application defaults to the `approvals` tab upon load. There is no traditional "marketing" landing page implemented in the `client/src` directory.

## 10. Reusable Components
- `Navbar.jsx`: The single source of navigation logic. Uses `lucide-react` icons and maps over a `navItems` array to render links dynamically. Updates the global `currentTab` state.

## 11. Functional Status
- **Implemented:** Custom routing, layout wrappers, global CSS.
- **Partial:** Page rendering logic.
- **Mocked/UI only:** Approvals, Fulfillment, Subscriptions, Invoices, Products, Customer Portal. (Tables render static data, row clicks pass mock data objects).
- **Not connected to backend:** The entire application.
- **Missing/Placeholders:** Dashboard, Quotations, Deal Health, and Reports pages are currently missing their child components and display "Coming Soon" info boxes.

## 12. Important Files
| File | Purpose | When to Modify |
|---|---|---|
| `App.jsx` | Global state, routing switch statement. | Adding new pages or altering global data flow. |
| `App.css` | Design system and layout classes. | Tweaking colors, spacing, or table layouts. |
| `components/Navbar.jsx` | Navigation mapping. | Adding new tabs or changing icons. |

## 13. Setup & Commands
Based on `package.json`:
- **Install dependencies:** `npm install`
- **Run local dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint:** `npm run lint`

## 14. Known Issues / Technical Debt
- **Missing Layout Components:** Four major pages (`Dashboard`, `Quotations`, `DealHealth`, `Reports`) have their component imports commented out and display placeholders because the components (e.g. `<MetricCard>`) do not exist in the codebase.
- **Hardcoded Data:** All tables rely on `const mockData = [...]` defined directly inside the component files. 
- **Routing:** Uses `useState` for routing instead of a proper history API wrapper (like `react-router-dom`), meaning browser back/forward buttons do not work.

## 15. Next Steps
- **High Priority:** Implement a routing library (`react-router-dom`) to support deep-linking and browser history.
- **Medium Priority:** Build the missing UI components for the Dashboard, Quotations, Deal Health, and Reports pages.
- **Medium Priority:** Extract mock data into a central service file or mock API to prepare for backend integration.
- **Polish:** Create reusable generic `<Table>` and `<StatusBadge>` components to DRY up the individual page files.

## 16. Quick Start for Developers
New developers should begin by running `npm run dev` and exploring the `client/src/App.jsx` file to understand the state-based routing. From there, inspect `client/src/App.css` to grasp the design system before attempting to build out the missing components for the placeholder pages.
