# VenueVista - Banquet Hall Booking System

## 🏛️ Project Overview

**VenueVista** is a comprehensive dual-interface banquet hall booking system designed for hackathon demonstration. It features a customer-facing web application for browsing and booking venues with 360° panoramic views, and an admin panel with a three-tier approval workflow for managing bookings.

---

## 📋 Problem Statement Addressed

### Customer Requirements ✅
1. ✅ **360° Rotation View** of banquet halls and amenities
2. ✅ **User Booking Management**
   - Request new booking (show available halls for date/time)
   - Customer details entry
   - Booking status tracking (Approved/ChangeRequested/Reject/ActionPending)
   - Edit booking functionality
   - Payment integration
   - Download booking details
   - Invoice generation
3. ✅ **Login** system (username/password)
4. ✅ **New User Registration**
5. ✅ **Multi-Hall Booking** with checkboxes and date/time picker

### Admin Requirements ✅
1. ✅ **Role-Based Access** (Admin1, Admin2, SuperAdmin)
2. ✅ **Hierarchical User Creation**
   - SuperAdmin can create Admin1 and Admin2
   - Admin2 can create Admin1
3. ✅ **Admin1 Workflow** - Document Verification
   - Request changes from customer
   - Reject booking
   - Approve and forward to Admin2
4. ✅ **Admin2 Workflow** - Availability & Payment
   - Reject booking
   - Request payment from customer
   - Review payment status
   - Forward to Admin3 for final approval
5. ✅ **Admin3 Workflow** - Final Approval
   - Reject booking
   - Approve booking (final confirmation)

---

## 🛠️ Technology Stack

### Frontend
- **React** 18.3.1 - UI framework
- **React Router DOM** 6.27.0 - Client-side routing
- **Tailwind CSS** 3.4.16 - Utility-first styling
- **Pannellum** 2.5.6 - 360° panoramic image viewer
- **Axios** 1.7.9 - HTTP client for API calls
- **React Hot Toast** 2.4.1 - Toast notifications
- **Lucide React** 0.468.0 - Modern icon library
- **Recharts** 2.15.0 - Data visualization charts

### Backend
- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT (jsonwebtoken)** - Authentication
- **Bcryptjs** - Password hashing
- **Razorpay** - Payment gateway integration
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

### Architecture
- **MVC Pattern** - Models, Routes, Controllers separation
- **RESTful API** - Standard HTTP methods
- **Role-Based Access Control (RBAC)** - Middleware-enforced
- **JWT Authentication** - Stateless token-based auth

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** package manager
- **Git** (for cloning repository)

### Step 1: Backend Setup

```bash
cd backend
npm install

# Create .env file with these variables:
# NODE_ENV=development
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/venuevista
# JWT_SECRET=your_super_secret_jwt_key
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret

npm run dev
# Backend runs on http://localhost:5000
```

### Step 2: Customer Frontend Setup

```bash
cd frontend-customer
npm install

# Create .env file:
# VITE_API_URL=http://localhost:5000/api
# VITE_RAZORPAY_KEY_ID=your_key

npm run dev
# Customer app runs on http://localhost:5173
```

### Step 3: Admin Frontend Setup

```bash
cd frontend-admin
npm install

# Create .env file:
# VITE_API_URL=http://localhost:5000/api

npm run dev
# Admin app runs on http://localhost:5174
```

---

## 👤 Demo User Accounts

### Customer
- Email: customer@test.com
- Password: password123

### Admin Accounts
- **Admin1**: admin1@test.com / password123
- **Admin2**: admin2@test.com / password123
- **Super Admin**: superadmin@test.com / password123

---

## 🧪 Testing Guide

### Test Customer Flow
1. Login as customer
2. Browse halls → Click hall → View 360° panorama
3. Create booking (select date/time)
4. Check "My Bookings" → View status
5. Make payment when requested
6. Download invoice after approval

### Test Admin Workflow
1. **Admin1**: Approve/reject pending bookings
2. **Admin2**: Request payment, verify, forward
3. **Super Admin**: Final approval

### Test Multi-Booking
1. Browse Halls → Enable Multi-Selection
2. Select 2-3 halls
3. Book with same date/time

---

## 🌐 Deployment

### Backend (Railway/Render)
1. Create account, connect GitHub
2. Add environment variables
3. Auto-deploy on push

### Frontend (Vercel/Netlify)
```bash
npm install -g vercel
cd frontend-customer
vercel --prod

cd ../frontend-admin
vercel --prod
```

Update `VITE_API_URL` to deployed backend URL.

---

## 📊 Key Features

- ✅ 360° hall viewer (Pannellum)
- ✅ Multi-hall booking with checkboxes
- ✅ Three-tier admin approval workflow
- ✅ Role-based access control
- ✅ Razorpay payment integration
- ✅ Invoice download
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support

---

## 📝 License

Created for hackathon purposes. Free to use and modify.

---

**VenueVista** - Where Vision Meets Venue 🏛️
