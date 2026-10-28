# smart_farm

# SmartFarm

SmartFarm is a modern farm management platform designed specifically for farmers in Cameroon and Africa. It helps farmers manage crops, livestock, inventory, finances, workers, and farm activities from a single platform.

Inspired by Farmbrite and customized for local agricultural realities, SmartFarm aims to improve farm productivity, record keeping, and decision making through a simple, mobile-friendly interface.

---

## Features

### Farm Management

* Crop management
* Livestock management
* Farm activity tracking
* Harvest tracking

### Inventory Management

* Seed inventory
* Feed inventory
* Fertilizer inventory
* Medicine inventory
* Low stock alerts

### Financial Management

* Income tracking
* Expense tracking
* Profit and loss reports
* Financial analytics

### Task Management

* Worker assignment
* Task scheduling
* Task progress tracking

### Reports and Analytics

* Revenue trends
* Expense trends
* Crop yield reports
* Livestock performance reports

### User Roles

* Farm Owner
* Farm Manager
* Farm Worker

### Future Features

* Weather integration
* SMS notifications
* AI disease detection
* Market price tracking
* Offline mode

---

# Technology Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion
* Recharts

## Backend

* Supabase
* PostgreSQL

## Deployment

* Vercel

---

# Project Structure

```text
smartfarm/

├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── crops/
│   │   ├── livestock/
│   │   ├── inventory/
│   │   ├── finance/
│   │   ├── tasks/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   ├── charts/
│   │   └── layouts/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── crops/
│   │   ├── livestock/
│   │   ├── inventory/
│   │   ├── finance/
│   │   ├── tasks/
│   │   └── reports/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── types/
│   │
│   ├── constants/
│   │
│   ├── animations/
│   │
│   └── middleware.ts
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── policies/
│   └── seed/
│
├── docs/
│
├── .github/
│   └── copilot-instructions.md
│
├── .env.local
│
├── package.json
│
└── README.md
```

---

# Prerequisites

Before running SmartFarm, install:

* Node.js (Version 20 or later)
* Git
* VS Code
* A Supabase account

Verify installation:

```bash
node -v
npm -v
git --version
```

---

# Clone the Repository

```bash
git clone https://github.com/your-username/smartfarm.git
```

Move into the project folder:

```bash
cd smartfarm
```

---

# Install Dependencies

```bash
npm install
```

This will install all required packages listed in package.json.

---

# Environment Variables

Create a file named:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

These values can be found inside your Supabase project settings.

---

# Setting Up Supabase

1. Create a Supabase account.
2. Create a new project.
3. Copy the Project URL.
4. Copy the Anon Key.
5. Paste both values into `.env.local`.

Run all SQL migrations found in:

```text
supabase/migrations/
```

using the Supabase SQL Editor.

---

# Start Development Server

Run:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run start
```

---

# Deployment

SmartFarm is deployed using Vercel.

To deploy:

```bash
npm install -g vercel
```

Then:

```bash
vercel
```

Follow the prompts.

---

# Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# Team

University of Buea

Department of Computer Science

SmartFarm Project Team

Academic Year 2025/2026

---

SmartFarm — Helping Farmers Grow More, Waste Less, and Earn More.
