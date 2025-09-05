# Attendance Management System

A simple college-level attendance system with React (frontend), Node/Express (backend), and MySQL.

## Tech Stack
- Frontend: React (CRA) + Tailwind CSS
- Backend: Node.js + Express
- DB: MySQL via Sequelize
- Auth: JWT (cookie-based), roles: student, teacher, admin

## Features
- Auth: Signup/Login with role selection
- Student: Scan/paste QR to mark attendance; view records
- Teacher: Generate 30s QR for class; view class attendance
- Admin: Manage users; view overall attendance reports

## Project Structure
- backend/
  - src/
    - config, models, controllers, routes, middleware
- frontend/
  - src/
    - components, services

## Prerequisites
- Node.js 18+
- MySQL 8+ running locally

## Database Setup
1. Create database:
   - Name: `attendance_db` (or change in `.env`)
2. Ensure MySQL is running and credentials match backend `.env`:
   - `DB_HOST=localhost`
   - `DB_USER=root`
   - `DB_PASS=` (set if needed)
   - `DB_NAME=attendance_db`
   - `DB_PORT=3306`
3. The backend will auto-sync tables on first run.

## Backend Setup
```bash
cd backend
npm install
# Configure .env if needed (already created)
# Start dev
npm run dev
# or start
npm start
```
- API base: `http://localhost:5000`
- Routes:
  - POST `/auth/signup`
  - POST `/auth/login`
  - POST `/teacher/generate-qr` (teacher)
  - GET  `/teacher/attendance/:classId` (teacher/admin)
  - POST `/student/mark-attendance` (student)
  - GET  `/student/my-attendance` (student)
  - GET  `/admin/users` (admin)
  - GET  `/admin/reports` (admin/teacher)

## Frontend Setup
```bash
cd frontend
npm install
npm start
```
- App: `http://localhost:3000`
- Tailwind is configured via `postcss.config.js`, `tailwind.config.js`, and `src/index.css`.

## Usage Flow
1. Sign up users (student/teacher/admin) via the Signup page.
2. Login; you’ll be redirected to role dashboard.
3. Teacher generates QR; student pastes/scans QR payload to mark attendance within 30s.
4. Teacher/Admin can view attendance; Admin manages users.

## Notes
- JWT is stored in httpOnly cookie; CORS configured for `http://localhost:3000`.
- Adjust `QR_TTL_SECONDS` in backend `.env` to change QR expiry.
- For production, set strong `JWT_SECRET`, use HTTPS, and tighten CORS.

## Troubleshooting
- If backend fails to start: verify MySQL is running and `.env` credentials are correct.
- If Tailwind styles don’t apply: ensure `src/index.css` contains Tailwind directives and `tailwind.config.js` content paths include `./src/**/*.{js,jsx}`.
- If QR scan is not available via camera: paste the QR JSON payload shown in Teacher dashboard into the Student dashboard textarea.
