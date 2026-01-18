# SkillSwap Backend 🚀

SkillSwap Backend is a **RESTful API** built using **Node.js, Express, and MongoDB** that powers a skill exchange platform.  
It handles authentication, skill matching, swaps, real-time communication, notifications, admin management, and security enhancements.

This repository currently focuses on the **backend architecture**.  
Frontend integration will be added in future phases.

---

## 🔧 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Socket.io** (Real-time features)
- **Nodemailer** (Transactional emails)
- **bcryptjs** (Password hashing)
- **Helmet** (Security headers)
- **Express Rate Limit** (API protection)

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- User registration & login
- JWT-based authentication
- Role-based access control (User / Admin)
- Secure logout & token invalidation
- Forgot password & reset password via email

### 👤 User Management
- User profile management
- Skill offering & skill requirement handling
- Skill matching logic
- Profile validation to maintain data integrity

### 🔄 Skill Swap System
- Create skill swap requests
- Accept / reject / complete swaps
- Swap history tracking
- User dashboard statistics

### 💬 Real-time Communication
- Real-time chat using **Socket.io**
- User-based socket rooms
- Backend prepared for future WebRTC signaling

### 🔔 Notifications System
- In-app notifications (stored in DB)
- Real-time notifications via Socket.io
- Admin-to-user notifications

### 🛠 Admin Panel (Backend)
- Admin dashboard statistics
- User role management
- Block / unblock users
- Swap monitoring & moderation
- Reports management
- Admin-triggered notifications

### 📧 Email System
- Welcome email on registration
- Secure forgot password flow
- Password reset with time-limited token

### 🔒 Security Enhancements
- Password hashing using bcrypt
- Rate limiting on sensitive APIs
- Secure HTTP headers using Helmet
- Environment variable based secrets
- Input validation for critical logic

### ⚡ Performance Enhancements
- Pagination for large datasets
- MongoDB indexing
- Optimized queries for dashboards

---

## 📂 Project Structure

# SkillSwap Backend 🚀

SkillSwap Backend is a **RESTful API** built using **Node.js, Express, and MongoDB** that powers a skill exchange platform.  
It handles authentication, skill matching, swaps, real-time communication, notifications, admin management, and security enhancements.

This repository currently focuses on the **backend architecture**.  
Frontend integration will be added in future phases.

---

## 🔧 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Socket.io** (Real-time features)
- **Nodemailer** (Transactional emails)
- **bcryptjs** (Password hashing)
- **Helmet** (Security headers)
- **Express Rate Limit** (API protection)

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- User registration & login
- JWT-based authentication
- Role-based access control (User / Admin)
- Secure logout & token invalidation
- Forgot password & reset password via email

### 👤 User Management
- User profile management
- Skill offering & skill requirement handling
- Skill matching logic
- Profile validation to maintain data integrity

### 🔄 Skill Swap System
- Create skill swap requests
- Accept / reject / complete swaps
- Swap history tracking
- User dashboard statistics

### 💬 Real-time Communication
- Real-time chat using **Socket.io**
- User-based socket rooms
- Backend prepared for future WebRTC signaling

### 🔔 Notifications System
- In-app notifications (stored in DB)
- Real-time notifications via Socket.io
- Admin-to-user notifications

### 🛠 Admin Panel (Backend)
- Admin dashboard statistics
- User role management
- Block / unblock users
- Swap monitoring & moderation
- Reports management
- Admin-triggered notifications

### 📧 Email System
- Welcome email on registration
- Secure forgot password flow
- Password reset with time-limited token

### 🔒 Security Enhancements
- Password hashing using bcrypt
- Rate limiting on sensitive APIs
- Secure HTTP headers using Helmet
- Environment variable based secrets
- Input validation for critical logic

### ⚡ Performance Enhancements
- Pagination for large datasets
- MongoDB indexing
- Optimized queries for dashboards

---

## 📂 Project Structure

backend/
├── config/
│ └── db.js
├── controllers/
│ ├── authController.js
│ ├── userController.js
│ ├── swapController.js
│ ├── chatController.js
│ ├── notificationController.js
│ └── adminController.js
├── middleware/
│ ├── authMiddleware.js
│ └── rateLimiter.js
├── models/
│ ├── User.js
│ ├── Swap.js
│ ├── Message.js
│ └── Notification.js
├── routes/
│ ├── authRoutes.js
│ ├── userRoutes.js
│ ├── swapRoutes.js
│ ├── chatRoutes.js
│ ├── notificationRoutes.js
│ └── adminRoutes.js
├── utils/
│ ├── sendEmail.js
│ └── socket.js
├── server.js
└── .env


---

## 🔗 API Overview

### Auth APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `PUT /api/auth/reset-password/:token`

### User APIs
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/search`
- `GET /api/users/match`
- `GET /api/users/dashboard`

### Swap APIs
- `POST /api/swaps`
- `GET /api/swaps/my`
- `PUT /api/swaps/:id`

### Chat APIs
- `POST /api/chat`
- `GET /api/chat/:userId`

### Notification APIs
- `GET /api/notifications`
- `PUT /api/notifications/:id`

### Admin APIs
- `GET /api/admin/dashboard`
- `GET /api/admin/swaps`
- `DELETE /api/admin/swaps/:id`
- `PUT /api/admin/users/role/:id`
- `POST /api/admin/notifications`

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173


---

## ▶️ How to Run Backend

```bash
npm install
npm run dev

http://localhost:5000

