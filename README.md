# Harsy Backend API

Backend API for the Harsy Handmade e-commerce platform, built with [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), and PostgreSQL.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

## 🛠 Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **pnpm**
- **PostgreSQL Database** (Local or Cloud provider like Supabase)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd harsy-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ⚙️ Configuration

1. Create a `.env` file in the root directory.
2. Add the following environment variables (adjust as needed):

   ```env
   # Database connection string (PostgreSQL)
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

   # JWT Secret for authentication
   JWT_SECRET="your_super_secret_key"
   
   # Optional: Port configuration (default is 3000)
   PORT=3000
   ```

## 🗄️ Database Setup

This project uses Prisma ORM.

1. **Generate Prisma Client**
   This step creates the type-safe client based on your schema.
   ```bash
   npx prisma generate
   ```

2. **Push Schema to Database**
   Sync your database state with your Prisma schema.
   ```bash
   npx prisma db push
   # OR for migration history
   npx prisma migrate dev
   ```

3. **Seed the Database (Optional)**
   If a seed script is provided in `package.json`, you can populate initial data.
   ```bash
   npx prisma db seed
   ```

## ▶️ Running the Application

### Development Mode
Runs the application with hot-reload enabled.
```bash
npm run start:dev
```

### Production Mode
Builds the application and runs the optimized production build.
```bash
npm run start:build
```
> **Note:** The `start:build` command runs `npm run build && npm run start:prod`.

## 🗃️ Database Schema

The database consists of the following main models:

- **Users (`User`)**: Stores user account information (email, password hash, profile).
- **Roles (`Role`)**: Manages user roles and permissions (RBAC).
- **Categories (`Category`)**: Product categories, supports hierarchical structure (parent/children).
- **Products (`Product`)**: Items for sale, including inventory, price, and variants.
- **Orders (`Order`)**: Customer orders with status tracking (Pending, Paid, Shipped, etc.).
- **Order Items (`OrderItem`)**: Individual items within an order.
- **Reviews (`Review`)**: User reviews and ratings for products.

## 📡 API Endpoints

The API is organized into several modules. Here are the primary base endpoints:

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user and receive JWT
- `GET /auth/me` - Get current user profile

### Users
- `GET /users` - List all users (Admin)
- `GET /users/:id` - Get specific user details
- `PATCH /users/:id` - Update user profile

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create a new product (Admin)
- `PATCH /products/:id` - Update a product (Admin)
- `DELETE /products/:id` - Delete a product (Admin)

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create a new category (Admin)

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details

### Reviews
- `POST /reviews` - Submit a review for a product
- `GET /reviews` - List reviews

*(Note: Authenticated endpoints require `Bearer <token>` in the Authorization header)*

## 📂 Project Structure

- `src/app.module.ts`: Root module of the application.
- `src/main.ts`: Entry point of the application.
- `src/prisma/`: Prisma service and database connection logic.
- `src/auth/`: Authentication logic (strategies, guards).
- `src/users/`: User management.
- `src/products/`: Product management.
- `src/orders/`: Order processing.
- `src/categories/`: Category management.
- `src/reviews/`: Review system.
