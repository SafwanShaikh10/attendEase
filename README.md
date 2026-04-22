# AttendEase: Smart Attendance Request System

> UNDER DEVELOPMENT: This project is currently a work in progress. Features, APIs, and the database schema are subject to change without notice.

AttendEase is a comprehensive, multi-tier web application designed to streamline the process of submitting, reviewing, and approving student attendance exception requests (such as Medical Leave, Special OD, and regular On-Duty requests).

## Features
- Role-Based Access Control: Secure dashboards for Students, Class Coordinators, Year Coordinators, and Chairpersons.
- Secure Document Management: All uploaded proofs and dynamically generated PDF letters are stored securely on the server and accessed via authenticated, short-lived tokens.
- Real-Time Leave Balances: Automatic calculation of used vs. available leaves based on historical data.
- Automated Deadlines: CRON-job driven deadline enforcement preventing late submissions.
- Dynamic Notifications: In-app bell notifications and email alerts for status changes.

## Tech Stack
- Frontend: React (Vite), TailwindCSS, Lucide Icons, Axios.
- Backend: Node.js, Express.js, Prisma ORM.
- Database: PostgreSQL (or configurable via Prisma).
- Security: JWT Authentication, bcrypt password hashing, express-rate-limit, express-validator.

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- A SQL Database (PostgreSQL recommended)

### 1. Backend Setup
```bash
cd backend
npm install
```
Configure your environment variables by copying the example file:
```bash
cp .env.example .env
```
Update .env with your database URL and secrets. Then push the schema:
```bash
npx prisma db push
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:5173.