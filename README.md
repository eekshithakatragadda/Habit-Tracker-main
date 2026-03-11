# Habit Tracker Web Application

A modern productivity web application that helps users **build habits, manage tasks, and write daily journal reflections**. The system tracks progress, streaks, and productivity insights to encourage consistency and personal growth.

---

## Project Overview

This application allows users to:

- Track daily habits
- Manage personal tasks
- Write daily journal entries
- Monitor productivity and streaks
- View analytics and insights
- Earn experience points (XP) through gamification

The goal of the project is to help users develop consistent routines and improve productivity.

---

## Tech Stack

### Frontend
- **Next.js** – React framework for building the application
- **React** – Component-based UI development
- **TypeScript** – Typed JavaScript for safer code
- **Tailwind CSS** – Utility-first CSS framework
- **Lucide Icons** – Icon library
- **SWR** – Data fetching and caching

### Backend
- **Supabase** – Backend as a Service
- **PostgreSQL** – Database used by Supabase

Supabase provides:
- Authentication
- Database
- API access
- Server-side logic

### Deployment
- **Vercel** – Hosting platform for Next.js applications

### Version Control
- **Git**
- **GitHub**

---

## Features

### Habit Tracking
- Create daily or weekly habits
- Mark habits as completed
- Track streaks
- View completion rates

### Task Manager
- Add tasks with priority levels
- Mark tasks as completed
- Track productivity

### Journal System
- Write daily reflections
- Track mood and energy levels
- Maintain journaling streaks

### Analytics & Insights
- Habit completion statistics
- Productivity insights
- Progress tracking

### Gamification
- XP rewards
- Level progression
- Streak tracking

---

## Project Structure

```
app/            → Application pages and routes
components/     → Reusable UI components
hooks/          → Custom React hooks
lib/            → Backend logic and Supabase actions
public/         → Static assets (images, icons)
scripts/        → Utility scripts
styles/         → Global styling files
```

---

## System Architecture

```
User
 ↓
Next.js Frontend
 ↓
Server Actions
 ↓
Supabase API
 ↓
PostgreSQL Database
```

The frontend handles user interaction while Supabase manages authentication, database operations, and backend logic.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

### 2. Install dependencies

```bash
npm install
```

or

```bash
pnpm install
```

### 3. Create environment variables

Create a `.env.local` file and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

The app will run at:

```
http://localhost:3000
```

---

## Deployment

The project is deployed using **Vercel**.

Steps:

1. Push the code to GitHub
2. Import the repository into Vercel
3. Add environment variables
4. Deploy the application

---

## Database

The application uses **PostgreSQL through Supabase**.

Main tables include:

- users
- habits
- habit_logs
- tasks
- journal_entries
- profiles
- xp_transactions

---

## Future Improvements

- AI-based habit recommendations
- Social habit sharing
- Reminder notifications
- Mobile application version

---

## Author

Developed as a full-stack productivity and habit tracking web application using modern web technologies.
