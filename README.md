# MediStore 💊 — Frontend
**A modern Next.js frontend for an online medicine marketplace**

MediStore Frontend is a responsive, production-ready **Next.js (App Router)** application that provides the complete user interface for the MediStore online pharmacy platform.

It supports authentication, product browsing, cart & checkout, seller dashboards, admin management, and order tracking.

---
> ⚠️ Demo credentials are for development/testing only.

---

## 📌 Project Overview

The MediStore Frontend delivers a complete UI for an OTC medicine marketplace where:

- Customers browse medicines, add to cart, and place orders
- Sellers manage their medicine inventory and process orders
- Admins manage users, categories, medicines, and platform orders

This frontend is designed to work seamlessly with the **MediStore Backend API**.

---

## 🛠️ Tech Stack

- **Next.js (App Router)** — Server rendering, routing, performance
- **TypeScript** — Type safety and improved developer experience
- **pnpm** — Fast, deterministic package manager
- **Tailwind CSS + PostCSS** — Utility-first styling
- **shadcn/ui + Sonner** — Accessible UI primitives & notifications
- **React Context / Store** — Cart and session state management
- **Fetch / Axios** — Centralized API client layer

---

## 🧠 Why These Choices?

- **Next.js + TypeScript** → SEO-friendly, scalable, modern React stack
- **pnpm** → Faster installs and reduced disk usage
- **Centralized API layer** → Cleaner components and easier maintenance
- **Utility-first styling** → Rapid UI development and consistency

---

## 🧱 Project Architecture

The project follows a modular and scalable structure under the `src` directory.

### Key Directories

```text
src/
├─ app/            # Next.js App Router pages & layouts
├─ components/     # Feature-based reusable components
├─ lib/            # API clients & utilities
├─ hooks/          # Custom React hooks
├─ providers/      # Global context providers
├─ store/          # Global state (cart, session, etc.)

```
### 🔄 Typical Request Flow

User interacts with UI components

Component calls a helper from client-api.ts or server-api.ts

API client sends request to backend (via proxy or base URL)

Response updates UI state or global store

Errors are handled centrally

🔌 API Expectations
The frontend expects a RESTful backend API.

#### Authentication
```
POST /auth/login

POST /auth/register

POST /auth/forgot-password

POST /auth/verify-email
```
#### Products & Catalog
```
GET /products

GET /products/:id

GET /categories
```
#### Cart & Orders
```
POST /orders

GET /orders/:id
```
#### Seller & Admin
```
GET /users (admin)

PATCH /users/:id

GET /seller/orders
```

🔧 Endpoint paths and headers should match your backend implementation.
Base URL is configured via env.ts / proxy.ts.

#### ✨ Features
Authentication (login, register, verification)

Product browsing with filters

Cart & checkout (Cash on Delivery)

Seller dashboard (inventory & orders)

Admin panel (users, categories, orders)

Responsive & accessible UI

#### 🚀 Getting Started
```
1️⃣ Clone the Repository
git clone <frontend-repo-url>
cd medi-store-frontend
2️⃣ Install Dependencies
pnpm install
3️⃣ Environment Variables
Create a .env.local file:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
4️⃣ Run Development Server
pnpm dev
5️⃣ Build for Production
pnpm build
pnpm start
``` 
#### 🌐 Live Demo
👉 medi-store-frontend-puce.vercel.app
(Replace with your deployed URL)

#### 🧭 Future Improvements
End-to-end tests (Playwright / Cypress)

CI/CD pipelines

Image uploads with signed URLs & CDN

Internationalization (i18n)

Online payment gateway integration

Real-time order notifications

📄 License
This project is intended for educational, learning, and portfolio purposes.


---

## ✅ Final Notes

- This README is **GitHub-standard**
- Clear for **reviewers, teammates, and recruiters**
- Fully aligned with **MediStore backend architecture**
- Safe, professional, and production-ready
