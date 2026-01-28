# Netlarx Banquet Hall Booking System

A full-stack MERN application for managing and booking banquet halls.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example`
4. `npm run dev` (Runs on port 5000)

### 2. Customer Frontend Setup
1. `cd frontend-customer`
2. `npm install`
3. `npm run dev` (Runs on port 3000)

### 3. Admin Frontend Setup
1. `cd frontend-admin`
2. `npm install`
3. `npm run dev` (Runs on port 3001)

## 🏗️ Architecture
- **Backend**: Express.js with Mongoose, Zod validation, and JWT auth.
- **Frontend**: React (Vite) with TailwindCSS for premium UI.
- **Database**: MongoDB Atlas.

## 👥 User Roles
- **Customer**: Browse halls, check availability, book venues, and view booking history.
- **Admin**: Manage halls, confirm/cancel bookings, view revenue analytics, and manage users.

## 🛡️ Security
- Password hashing with Bcrypt.
- HttpOnly Cookie-based JWT authentication.
- CSRF and XSS protection via Helmet and CORS.
