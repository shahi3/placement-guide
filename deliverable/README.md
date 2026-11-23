# 📦 Placement Guide

A campus placement portal. **Students** sign up, see companies open to their department, track tests and results, read alumni stories and learning material. **Admins** (the placement cell) manage students, companies, tests, results, alumni stories and learning material.

**Stack:** MongoDB · Express 5 · React 19 (Vite) · Node.js

## Features

- JWT login with two roles (student, admin); admin-only routes are enforced on the server
- Students: profile + resume upload, upcoming companies for their department (mark "applied"), tests, results, alumni stories, learning material
- Admins: manage students, add companies, assign tests, publish results, upload alumni stories and PDFs, dashboard counts

## Getting started

You need Node.js 20+ and a MongoDB instance (local or Atlas).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit .env (see below)
npm run dev                 # http://localhost:3008
```

### 2. Create the first admin (one time)

Public signup only creates students, so the first admin comes from a script. Put `ADMIN_EMAIL` and `ADMIN_PASSWORD` (min 8 characters) in `backend/.env`, then:

```bash
npm run seed:admin
```

Log in at `/admin-login`. Admins can create more admins with `POST /admin/create-admin`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:3008
npm run dev                 # http://localhost:5173
```

## Environment variables (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `3008`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRETE_KEY` | Long random secret used to sign tokens (spelled `SECRETE` in the code, keep it) |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS, comma separated (default `http://localhost:5173`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Only used by `npm run seed:admin` |

The server refuses to start if `JWT_SECRETE_KEY` is missing. Never commit `.env`.

Frontend (`frontend/.env`): `VITE_API_URL` is the backend URL.

## Project structure

```
backend/
├── server.js            # app setup (helmet, CORS, routes, error handler)
├── database/db.js       # MongoDB connection
├── routes/              # Auth-routes, Student-routes, admin-routes
├── controller/          # Auth-, Student-, Admin-controller
├── middleware/          # Auth-middleware (JWT + requireAdmin), upload (multer)
├── models/              # Mongoose schemas
├── utils/               # small helpers
├── scripts/seedAdmin.js # creates the first admin
└── uploads/             # stories/ and pdfs/ are public; resume/ is private

frontend/src/
├── api/axiosInstance.js # axios + automatic token + logout on expired session
├── utils/auth.js        # token storage and session checks
├── components/          # Navbar, Sidebars, ProtectedRoute, Footer
├── pages/               # one file per screen
└── styles/
```

## API

Auth is a `Authorization: Bearer <token>` header. Tokens last 15 minutes; the frontend sends you back to the login page when one expires.

| Method | Endpoint | Who | Description |
| --- | --- | --- | --- |
| POST | `/placementguide/register` | public | Student signup |
| POST | `/placementguide/login` | public | Login (student or admin) |
| GET | `/student/profile` | student | My profile |
| POST | `/student/upload-resume` | student | Upload resume (PDF/DOC/DOCX, 5 MB) |
| GET | `/student/resume` | student | Download my resume |
| GET | `/student/upcoming-companies` | student | Open companies for my department |
| POST | `/student/apply/:companyId` | student | Mark a company as applied |
| GET | `/student/applied-companies` | student | Companies I marked as applied |
| GET | `/student/tests` | student | My tests |
| GET | `/student/results` | student | My results |
| GET | `/student/view-alumni` | student | Alumni stories |
| GET | `/student/learningmaterial` | student | Learning material |
| GET | `/admin/students` | admin | All students |
| DELETE | `/admin/students/:id` | admin | Delete a student and their data |
| GET | `/admin/grouped-students` | admin | Students grouped by department |
| GET | `/admin/resume/:studentId` | admin | View a student's resume |
| POST | `/admin/create-admin` | admin | Create another admin |
| POST | `/admin/add-company` | admin | Add a company |
| POST | `/admin/add-test` | admin | Assign a test to a student |
| POST | `/admin/add-result` | admin | Publish a result |
| POST | `/admin/upload-story` | admin | Add an alumni story (image up to 5 MB) |
| GET | `/admin/stories` | admin | List alumni stories |
| POST | `/admin/upload-learning-material` | admin | Upload a PDF (up to 20 MB) |
| GET | `/admin/learning-materials` | admin | List learning material |
| DELETE | `/admin/delete-learning-material/:id` | admin | Delete learning material |
| GET | `/admin/dashboard-analytics` | admin | Counts for the dashboard |

## Deploying

- Set `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) to the real URLs.
- Behind a proxy (Render, Nginx, ...) add `app.set('trust proxy', 1)` in `server.js` so rate limiting sees the real client IP.
- Use a long random `JWT_SECRETE_KEY` and serve everything over HTTPS.
