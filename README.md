# AttendEase: Redefining Campus Attendance Management

> UNDER DEVELOPMENT: This project is currently a work in progress. Features, APIs, and the database schema are subject to change without notice.

Paper-based leave requests and manual tracking are things of the past. AttendEase provides a modern, high-performance solution for students and faculty to manage attendance exceptions with total transparency and security.

## The Mission
AttendEase was built to eliminate the stress of bureaucratic paperwork. Whether you are a student submitting a medical leave or a chairperson reviewing complex Special OD requests, the platform ensures that every action is logged, secure, and easy to perform.

## Key Highlights
- Unified Dashboard Experience: Each user role—from Student to Chairperson—gets a tailored view of what matters most to them.
- Secure Document Vault: All sensitive proofs are served through authenticated, encrypted pathways, keeping personal data private.
- Smart Logic: The system automatically calculates leave balances and enforces strict submission deadlines, so you never have to guess your status.
- Instant Connectivity: Integrated notifications keep everyone in the loop as requests move through the approval chain.

## Technology Architecture
- Modern Frontend: Built with React and Vite for a lightning-fast user interface.
- Robust Backend: Powered by Node.js and Prisma, ensuring reliable data management and scalability.
- Production-Grade Security: Implements JWT-based authentication and comprehensive input validation to protect every endpoint.

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
