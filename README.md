![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)

# 🍽️ InvHub – Restaurant Inventory Management SaaS

InvHub is a SaaS-based inventory management system designed for restaurants and food businesses. It helps restaurant owners and staff efficiently manage inventory, track stock levels, monitor inventory activities, and maintain accurate records through a secure role-based platform.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT Authentication
* HttpOnly Cookie-Based Sessions
* Secure Password Hashing (bcrypt)
* Protected Routes
* User Session Restoration
* Role-Based Access Control

### 👥 User Roles

#### Admin

* Add Products
* Update Products
* Delete Products
* View Inventory Activities
* Full Inventory Access

#### Staff

* View Products
* Update Product Quantities
* Add Inventory Activities
* Restricted Administrative Access

### 📦 Inventory Management

* Add New Products
* Update Existing Products
* Delete Products
* Product Quantity Tracking
* Category Management
* Inventory Value Monitoring

### 📊 Dashboard Analytics

* Total Products
* Low Stock Products
* Out of Stock Products
* Inventory Statistics
* Activity Overview

### 📝 Activity Tracking

* Stock Added Records
* Stock Removed Records
* Inventory Updates
* Activity History Logs
* User-Based Tracking

### 🎨 Modern User Interface

* Responsive Design
* SaaS Dashboard Layout
* Sidebar Navigation
* Mobile Friendly
* Reusable Components
* Clean User Experience

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Context API

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Token)
* HttpOnly Cookies
* bcrypt

---

## 📂 Project Structure

```bash
InvHub/
│
├── src/
│   |───|
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## 🔄 Application Workflow

### User Registration

1. User registers an account.
2. Password is hashed using bcrypt.
3. User information is stored in MongoDB.
4. Account is created successfully.

### User Login

1. User enters email and password.
2. Server validates credentials.
3. JWT token is generated.
4. Token is stored in an HttpOnly cookie.
5. User gains secure access to protected routes.

### Inventory Management

1. Admin adds products.
2. Products are stored in MongoDB.
3. Inventory activities are logged.
4. Dashboard statistics are updated automatically.

---

## 🔑 Authentication Flow

```text
User Login
    ↓
JWT Token Generated
    ↓
Stored in HttpOnly Cookie
    ↓
Authentication Middleware
    ↓
Protected Routes Access
    ↓
Authorized User Actions
```

---

## 📈 Learning Outcomes

This project helped me gain practical experience in:

* MERN Stack Development
* JWT Authentication
* HttpOnly Cookie Security
* REST API Development
* MongoDB Data Modeling
* Mongoose ODM
* Express Middleware
* Role-Based Authorization
* State Management
* Full-Stack Application Architecture

---

## 🔮 Future Enhancements

* Supplier Management
* Purchase Orders
* Low Stock Notifications
* Email Alerts
* Inventory Reports
* CSV/PDF Export
* Advanced Search & Filters
* Multi-Restaurant Support
* Analytics Dashboard
* Audit Logs

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/abhirajsinh27/invhub-restaurant-saas.git
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Run Frontend

```bash
npm run dev
```

### Run Backend

```bash
npm run server
```

---

## 🌟 Key Highlights

* Full-Stack MERN Application
* Secure JWT Authentication
* HttpOnly Cookie Sessions
* Role-Based Access Control
* Inventory Tracking System
* Activity Logging
* RESTful APIs
* Responsive SaaS Dashboard

---

## 👨‍💻 Developer

**Abhirajsinh Vala**

B.Tech Computer Engineering
Indus University

### Skills Demonstrated

* React.js
* Node.js
* Express.js
* MongoDB
* JWT Authentication
* REST APIs
* Context API
* Tailwind CSS
* Full-Stack Development

---

## 📌 Project Objective

The goal of InvHub is to provide restaurants with a secure and efficient inventory management solution while demonstrating modern full-stack development practices. The system focuses on authentication, authorization, inventory tracking, activity monitoring, and scalable SaaS architecture.

⭐ If you found this project useful, consider giving it a star.
