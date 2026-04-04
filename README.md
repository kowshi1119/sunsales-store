# ☀️ Sun Sales — Premium Ecommerce Platform

A production-grade full-stack ecommerce platform with a live product customization engine, built for Sri Lanka and ready for worldwide expansion.

## ✨ Features

- **Premium Gift Shop** — Curated collection of gifts, home décor, and accessories
- **Custom Phone Covers** — Upload photos, add text, and see a live mockup preview
- **Custom Photo Frames** — Personalize frames with your photos and engraving
- **Full Ecommerce** — Cart, checkout, orders, reviews, wishlist, coupons
- **Admin Dashboard** — Product management, order processing, analytics, custom design review
- **Authentication** — Email/password with OTP verification, password reset
- **Payment Integration** — PayHere (Sri Lanka), architecture ready for Stripe
- **Responsive Design** — Mobile-first, native app quality on all devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (global), SWR (server) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion, CSS animations |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (credentials + OTP) |
| Email | Resend |
| Storage | Cloudinary |
| Payment | PayHere SDK |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Supabase](https://supabase.com) / [Neon](https://neon.tech))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sun-sales.git
cd sun-sales

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Push database schema
npx prisma db push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sunsales.lk | Admin@123 |
| Customer | customer@example.com | Customer@123 |

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── (storefront)/ # Customer-facing pages
│   ├── (auth)/       # Authentication pages
│   ├── (account)/    # Customer account pages
│   ├── (admin)/      # Admin dashboard pages
│   └── api/          # API routes
├── components/       # React components
│   ├── ui/           # Base UI primitives
│   ├── layout/       # Header, Footer, Navigation
│   ├── home/         # Homepage sections
│   ├── product/      # Product display components
│   ├── customization/# Design customizer components
│   └── shared/       # Shared utilities
├── hooks/            # Custom React hooks
├── lib/              # Utilities, validators, config
├── stores/           # Zustand state stores
└── types/            # TypeScript type definitions
```

## 🎨 Design System

- **Primary**: Golden Amber (#F5A623) with coral accents
- **Typography**: DM Serif Display (headings) + Plus Jakarta Sans (body)
- **Spacing**: 4px base unit system
- **Shadows**: 5-level depth system
- **Animations**: Spring and smooth cubic-bezier curves

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📄 License

Proprietary — Sun Sales © 2024. All rights reserved.
