# SkillBuilder Backend API

MongoDB-based backend API for the SkillBuilder application.

## 🚀 Quick Start

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:3000`

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts      # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── Quiz.ts
│   │   ├── QuizSubmission.ts
│   │   └── Activity.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── admin.ts
│   │   └── quiz.ts
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── utils/
│   │   └── auth.ts          # Auth utilities
│   └── server.ts            # Main server file
├── .env                     # Environment variables
└── package.json
```

## 🔧 Configuration

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://deepak:deepakswamy@123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

## 📝 API Endpoints

### Authentication
- `POST /v1/auth/student/login` - Student login
- `POST /v1/auth/admin/login` - Admin login
- `POST /v1/auth/register` - Register new user

### Student
- `GET /v1/student/dashboard` - Get dashboard data
- `GET /v1/student/courses` - Get enrolled courses
- `GET /v1/student/profile` - Get profile
- `GET /v1/student/report` - Get skill report

### Quiz
- `GET /v1/quiz/:id/questions` - Get quiz questions
- `POST /v1/quiz/:id/submit` - Submit quiz
- `GET /v1/quiz/:id/results` - Get quiz results

### Admin
- `GET /v1/admin/dashboard/stats` - Get dashboard stats
- `GET /v1/admin/students` - Get all students
- `GET /v1/admin/courses` - Get all courses
- `POST /v1/admin/courses` - Create course
- `POST /v1/admin/quizzes` - Create quiz
- `GET /v1/admin/analytics` - Get analytics

## 🗄️ Database

MongoDB Atlas cluster with the following collections:
- `users` - User accounts (students and admins)
- `courses` - Course information
- `quizzes` - Quiz data with questions
- `quizsubmissions` - Quiz submission records
- `activities` - User activity logs

## 🔐 Authentication

Uses JWT tokens. Include token in Authorization header:
```
Authorization: Bearer <token>
```
