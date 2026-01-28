# Netlarx Banquet Hall System - Verification Guide

This guide provides comprehensive instructions for testing the 3-tier admin system and customer booking workflow.

---

## 🚀 Quick Setup

### Step 1: Seed the Database (First Time Only)
Navigate to the backend folder and run the seed script:

```bash
cd backend
node seed.js
```

This will create the following test accounts and sample halls.

---

## 🔑 Test Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin (Admin 3)** | `superadmin@netlarx.com` | `admin123` | Full access: user creation, final booking approval. |
| **Operations Admin (Admin 2)** | `admin2@netlarx.com` | `admin123` | Availability check, payment requests, creates Admin1. |
| **Analysis Admin (Admin 1)** | `admin1@netlarx.com` | `admin123` | Document verification, initial request analysis. |
| **Customer** | `customer@netlarx.com` | `password123` | Standard booking and profile access. |

---

## ✅ Verification Workflow

### 1. Multi-Tier Booking Approval Flow

| Step | Actor | Action |
| :--- | :--- | :--- |
| 1 | **Customer** | Login → Go to `Halls` → Select a hall → Request a booking. |
| 2 | **Admin 1** | Login → Go to `Bookings` → See `action-pending` booking → Click `Approve`. |
| 3 | **Admin 2** | Login → Go to `Bookings` → See `approved-admin1` booking → First, click `Request Payment`. Then, after customer "pays", click `Verify & Forward`. |
| 4 | **Super Admin** | Login → Go to `Bookings` → See `approved-admin2` booking → Click `Final Confirm` to complete. |
| 5 | **Customer** | Check `My Bookings` to see the status updated to `Confirmed`. |

### 2. Role-Based Permissions

| Action | Admin 1 | Admin 2 | Super Admin |
| :--- | :---: | :---: | :---: |
| Access Dashboard | ✅ | ✅ | ✅ |
| Manage Bookings (Initial Analysis) | ✅ | ❌ | ✅ |
| Manage Bookings (Availability/Payment) | ❌ | ✅ | ✅ |
| Manage Bookings (Final Approval) | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ⚠️ (Admin1 Only) | ✅ |
| Manage Halls | ⚠️ (Limited) | ✅ | ✅ |

### 3. UI Feature Verification

-   **Dark Mode Toggle**: Click the Sun/Moon icon in the top header of both Customer and Admin apps. All sections should adapt.
-   **Chatbot Close on Outside Click**: On the Customer app, open the chatbot, then click anywhere outside of it. It should close.
-   **Hall Details Page (Admin)**: In `Halls` section, click the "Eye" icon on any hall to open a detailed view.
-   **Profile Page (Admin)**: Click "My Profile" in the sidebar to view and edit your identity.

---

## 🛠️ Troubleshooting

### API returns 403 Forbidden
-   **Cause**: The logged-in user's role does not have permission for that action.
-   **Fix**: Login with a higher-level admin account (e.g., `superadmin@netlarx.com`).

### "My Bookings" shows nothing or error
-   **Cause**: The customer account has no bookings yet, or a backend population error.
-   **Fix**: Create a new booking first as the customer.

### Charts show "-1 width/height" error
-   **Cause**: The chart container has no dimensions.
-   **Fix**: This is fixed in `Dashboard.jsx`. If it persists, do a hard refresh (`Ctrl+Shift+R`).

---

## 📁 Key Project Files

| Path | Description |
| :--- | :--- |
| `backend/seed.js` | Script to create test users and sample halls. |
| `backend/utils/constants.js` | Defines user roles and booking statuses. |
| `frontend-admin/src/pages/BookingManagement.jsx` | Admin booking approval workflow UI. |
| `frontend-customer/src/pages/MyBookings.jsx` | Customer booking status tracker. |

---
*Last Updated: 2026-01-28*
