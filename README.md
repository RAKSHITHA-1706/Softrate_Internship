# SkillBuilder Application

AI-powered skill-gap assessment platform built with React, TypeScript, Tailwind CSS, and MongoDB.


### Backend Setup (MongoDB)

```bash
cd server
npm install
npm run dev
```

Backend runs at `http://localhost:3000`

### Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   └── layouts/          # StudentLayout, AdminLayout
├── pages/
│   ├── auth/             # Login/register pages
│   ├── student/          # Student module
│   ├── admin/            # Admin module
│   └── quiz/             # Quiz pages
├── services/
│   ├── api.ts            # Axios API client
│   └── auth.ts           # Auth service
├── context/
│   └── AuthContext.tsx   # Global auth state
└── types/
    └── index.ts          # TypeScript types
```

##  Configuration

### Backend Configuration

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

### Frontend Configuration

Create `.env` in the root:

```env
VITE_API_URL=http://localhost:3000/v1
```

**Note:** The MongoDB connection string uses URL-encoded password (`%40` for `@`).

##  Authentication

Uses JWT tokens in localStorage:
- `student_auth_token`
- `admin_auth_token`

##  API Endpoints

All endpoints expect responses in format:
```json
{
  "success": boolean,
  "data": {},
  "message": "..."
}
```

**Auth:** `/auth/{student|admin}/login`, `/auth/register`
**Student:** `/student/{dashboard|courses|profile|report}`
**Quiz:** `/quiz/:id/{questions|submit|results}`
**Admin:** `/admin/{dashboard/stats|students|courses|analytics}`

## ✅ Implementation Status

**Completed:**
- ✅ Authentication pages with role-based routing
- ✅ Student dashboard with stats
- ✅ Student quizzes (course list)
- ✅ Admin sidebar layout
- ✅ API service layer with Axios
- ✅ Protected routes

##  Development

The application now uses MongoDB as the database. The backend server must be running for the frontend to work properly.

##  Tech Stack

**Frontend:**
- React 19 • TypeScript • Vite • Tailwind CSS • React Router • Axios

**Backend:**
- Node.js • Express • TypeScript • MongoDB (Mongoose) • JWT • bcryptjs

## Database

MongoDB Atlas cluster with the following collections:
- `users` - User accounts (students and admins)
- `courses` - Course information
- `quizzes` - Quiz data with questions
- `quizsubmissions` - Quiz submission records
- `activities` - User activity logs

The database will be automatically created when you first run the backend server.
