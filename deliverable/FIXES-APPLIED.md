# Fixes applied

## Round 1 (earlier)
- Public signup can only create students; admin routes need an admin token (`requireAdmin`).
- Fixed student-data access bug on tests/results, stopped returning password hashes on signup.
- Case-sensitive import/file names fixed, `node_modules` and `.env` removed from git, `.gitignore` fixed.
- Backend URL moved to `VITE_API_URL` via one axios instance.

## Round 2 (this version)

### Security
- **Password hashes** were included in `GET /admin/grouped-students` (aggregates ignore `.select`). Now stripped.
- **Resumes were public** (`/uploads` served everything). Now only `uploads/stories` and `uploads/pdfs` are public; resumes are served through authenticated routes and get random, unguessable names.
- **Uploads are restricted**: file type and size limits for resumes (PDF/DOC/DOCX, 5 MB), story images (5 MB) and learning PDFs (20 MB). Rejected or invalid uploads no longer leave files on disk. `multer` upgraded 1.x → 2.x.
- JWT is no longer printed to the browser console; debug logs removed from the backend.
- Added `helmet`, rate limiting on login/signup, JSON body limit, a central error handler, CORS origin from `CLIENT_URL`, and a startup check for `JWT_SECRETE_KEY`.
- Login and signup validate their input (login with non-string values returns 400 instead of a 500).
- Signup requires name, enrollment number, department and an 8+ character password, and refuses emails already used by an admin.
- Invalid/expired tokens now return **401** (was 400), and the frontend logs the user out cleanly.
- Frontend pages are protected: `/student/*` and `/admin/*` redirect to login without a valid session of the right role. Admin and student logins reject the wrong kind of account.

### Broken features fixed
- **Manage Students**: wrong token, wrong response shape and a `name` field that never existed. Fixed; signup now collects and stores `fullName`.
- **Apply / Applied companies**: the Company schema had no `appliedStudents`. Added it; "I have applied" button on Upcoming Companies; Applied Companies page and sidebar link.
- **No way to create an admin**: `createAdmin` is now routed (`POST /admin/create-admin`) and `npm run seed:admin` creates the first one.
- **Learning Materials (student)** read fields that don't exist (`title`, `description`, `fileUrl`). Fixed.
- **Alumni images and PDFs** were loaded from the Vite dev server instead of the backend. Fixed.
- Test `status` now exists in the schema; results with a deleted company no longer crash; `Result`/`Resume` refs point at the real `Student` model.
- Students see their own tests/results without typing an enrollment number (`GET /student/tests`, `/student/results`).
- Admin lookups of company by name are case-insensitive and prefer the student's department.
- Deleting a student also deletes their tests, results, resume and applications.
- Resume upload/view added to the student profile; admins can view resumes from the students table.

### Data model
- `Student`: `fullName`, `enrollmentNumber` (required, unique), `department` required.
- `Admin`: `email`/`password` required, unique email, defaults for `role`/`isActive`, timestamps.

### Cleanup
- Removed dead files (`ApliedCompany.jsx`, `UpcomingTests.jsx`, `AppliedCompanies.jsx`, empty `App.css`), fixed the `Learninglaterials` typo, removed unused `dotenv` from the frontend, `npm start` fixed to `node server.js`.
- ESLint is clean (0 errors, 0 warnings). README rewritten to match the real code.

## Things to know when upgrading an existing database
- Students registered before this version have no `fullName`; the UI shows "—" for them.
- The new unique index on `enrollmentNumber`/`email` fails to build if your data already contains duplicates; clean those up first.
- Old resume records keep working (file name is extracted from the stored path).

## Not changed on purpose
- Tokens stay in the browser (`localStorage` for students, `sessionStorage` for admins). Fine for a college project; for production consider httpOnly cookies.
- Story images and learning PDFs are public by URL (anyone with the link can open them).
- Sessions last 15 minutes with no refresh token.
- The env variable keeps the `JWT_SECRETE_KEY` spelling so existing `.env` files keep working.
