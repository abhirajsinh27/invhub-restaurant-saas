# InvHub — Multi-Tenant Restaurant Inventory Operations SaaS

InvHub is a modern full-stack Restaurant Inventory Operations SaaS platform built with React, Node.js, Express, and MongoDB.

The application supports organization-based inventory isolation, role-based workflows, stock usage tracking, request approvals, operational dashboards, notifications, and inventory activity management for restaurant teams.

---

# 🚀 Features

## Authentication & Security
- JWT Authentication
- HttpOnly Cookie-based Sessions
- Protected Backend Routes
- Role-Based Access Control (Admin / Staff)

---

## Multi-Tenant SaaS Architecture
- Organization-based workspace system
- Separate restaurant inventory isolation
- Join-code onboarding system
- Staff Management

---

## Inventory Operations
- Product Management
- Inventory Tracking
- Restaurant Measurement Units (KG, Liter, Bottle, Packet, etc.)
- Stock Usage Logging
- Restock Request Workflow
- Inventory Movement Tracking

---

## Workflow System
- Staff Request Approval System
- Admin Review Dashboard
- Activity Logging
- Operational Notifications
- Low Stock Alerts

---

## SaaS Dashboard & UI
- Modern Minimal SaaS UI
- Dark / Light Theme System
- Responsive Dashboard
- Notifications Dropdown
- Profile & Organization Overview
- Analytics & Reports

---

# 🛠️ Tech Stack

## Frontend
- React
- React Router
- TailwindCSS
- Lucide React

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Cookie Parser

---

# 🏗️ Architecture Highlights

## Multi-Tenant System
Each restaurant operates inside its own isolated organization workspace.

All:
- products
- requests
- activities
- notifications

are scoped using `organizationId`.

---

## Role-Based Access Control
The platform supports:
- Admin
- Staff

Admins can:
- manage inventory
- approve requests
- manage staff

Staff can:
- use stock
- create restock requests
- track operational activities

---

## Operational Workflow

```txt
Staff Uses Inventory
↓
Inventory Quantity Updates
↓
Low Stock Detection
↓
Request Created
↓
Admin Reviews Request
↓
Inventory Updated
↓
Notifications Generated
↓
Activities Logged
```

---

# 📦 Installation

## Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create `.env` inside server folder:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

# 🌙 Theme System

InvHub supports:
- Light Mode
- Dark Mode

Theme preferences are persisted using localStorage and applied globally using Tailwind dark mode classes.

---

# 📸 Screenshots

Add screenshots here:
- Dashboard
- Inventory
- Requests
- Notifications
- Dark Mode
- Staff Dashboard
- Admin Dashboard

---

# 🚀 Future Improvements

- Email Invitations
- Advanced Reports
- Inventory Forecasting
- Mobile Optimization
- Export Systems

---

# 👨‍💻 Author

Developed by VALA ABHIRAJSINH

Final Year Computer Engineering Project
