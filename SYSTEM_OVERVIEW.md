# SkillBuilder System Overview

Complete MongoDB-based quiz management system with admin and student interfaces.

## 🎯 System Features

### Authentication System
- ✅ **Student Registration** - New students can sign up with email and password
- ✅ **Student Login** - Existing students can login with credentials
- ✅ **Admin Login** - Administrators can login (must be created first)
- ✅ **Password Security** - All passwords are hashed with bcrypt
- ✅ **JWT Tokens** - Secure authentication tokens (7-day expiry)

### Admin Features
- ✅ **Create Courses** - Add new courses for students
- ✅ **Create Quizzes** - Add quizzes to courses with questions and answers
- ✅ **View All Students** - See all registered students
- ✅ **View All Courses** - Manage all courses
- ✅ **View All Quizzes** - See all quizzes with statistics
- ✅ **View Quiz Results** - See all quiz submissions with student details
- ✅ **View Student Results** - See individual student performance
- ✅ **Analytics Dashboard** - View system statistics

### Student Features
- ✅ **Browse Courses** - View all available courses
- ✅ **Enroll in Courses** - Join courses to access quizzes
- ✅ **View Enrolled Courses** - See courses you're enrolled in
- ✅ **Take Quizzes** - Access and complete quizzes
- ✅ **View Quiz Results** - See your quiz scores and performance
- ✅ **Dashboard** - View your progress and statistics
- ✅ **Activity Feed** - See your recent activities

## 📊 Database Collections

### 1. Users Collection
- Stores student and admin accounts
- Handles authentication and authorization
- Tracks enrollment counts

### 2. Courses Collection
- Stores course information
- Tracks enrolled students
- Links to quizzes

### 3. Quizzes Collection
- Stores quiz data with questions
- Includes correct answers (admin only)
- Links to courses

### 4. Quiz Submissions Collection
- Stores all quiz results
- Tracks scores, percentages, pass/fail
- Links students to quizzes

### 5. Activities Collection
- Logs user activities
- Tracks quiz completions and enrollments

## 🔄 Complete Workflow

### Admin Workflow

1. **Login as Admin**
   ```
   POST /v1/auth/admin/login
   Body: { email, password }
   ```

2. **Create a Course**
   ```
   POST /v1/admin/courses
   Body: { title, instructor, description, thumbnail }
   ```

3. **Create a Quiz**
   ```
   POST /v1/admin/quizzes
   Body: {
     title, courseId, description,
     questions: [
       { text, type, options, correctAnswer, points }
     ],
     durationMinutes
   }
   ```

4. **View Quiz Results**
   ```
   GET /v1/admin/quiz-submissions
   GET /v1/admin/quizzes/:quizId/submissions
   GET /v1/admin/students/:studentId/results
   ```

### Student Workflow

1. **Register (First Time)**
   ```
   POST /v1/auth/register
   Body: { name, email, password }
   ```

2. **Login**
   ```
   POST /v1/auth/student/login
   Body: { email, password }
   ```

3. **Browse Available Courses**
   ```
   GET /v1/student/courses/available
   ```

4. **Enroll in a Course**
   ```
   POST /v1/student/courses/:courseId/enroll
   ```

5. **View Available Quizzes**
   ```
   GET /v1/student/quizzes
   ```

6. **Take a Quiz**
   ```
   GET /v1/quiz/:id/questions  (Get questions)
   POST /v1/quiz/:id/submit     (Submit answers)
   ```

7. **View Results**
   ```
   GET /v1/quiz/:id/results
   ```

## 🚀 Getting Started

### 1. Initialize Admin User

```bash
cd server
npm run init-admin
```

This creates:
- Email: `admin@skillbuilder.com`
- Password: `admin123`

**Change password after first login!**

### 2. Start Backend Server

```bash
cd server
npm run dev
```

Server runs at `http://localhost:3000`

### 3. Start Frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

## 📝 API Endpoints Summary

### Authentication
- `POST /v1/auth/register` - Student registration
- `POST /v1/auth/student/login` - Student login
- `POST /v1/auth/admin/login` - Admin login

### Student Endpoints
- `GET /v1/student/dashboard` - Student dashboard
- `GET /v1/student/courses` - Enrolled courses
- `GET /v1/student/courses/available` - All available courses
- `POST /v1/student/courses/:courseId/enroll` - Enroll in course
- `GET /v1/student/quizzes` - Available quizzes
- `GET /v1/student/profile` - Student profile
- `GET /v1/student/report` - Skill report

### Quiz Endpoints
- `GET /v1/quiz/:id/questions` - Get quiz questions
- `POST /v1/quiz/:id/submit` - Submit quiz
- `GET /v1/quiz/:id/results` - Get quiz results

### Admin Endpoints
- `GET /v1/admin/dashboard/stats` - Dashboard statistics
- `GET /v1/admin/students` - All students
- `GET /v1/admin/courses` - All courses
- `POST /v1/admin/courses` - Create course
- `GET /v1/admin/quizzes` - All quizzes
- `GET /v1/admin/quizzes/:quizId` - Quiz details
- `POST /v1/admin/quizzes` - Create quiz
- `GET /v1/admin/quiz-submissions` - All quiz results
- `GET /v1/admin/quizzes/:quizId/submissions` - Quiz-specific results
- `GET /v1/admin/students/:studentId/results` - Student-specific results
- `GET /v1/admin/analytics` - Analytics data

## 🔐 Security Features

1. **Password Hashing** - All passwords stored as bcrypt hashes
2. **JWT Authentication** - Secure token-based auth
3. **Role-Based Access** - Students and admins have separate endpoints
4. **Answer Protection** - Quiz answers hidden from students
5. **Input Validation** - Email format, password length checks

## 📦 Database Structure

All collections are automatically created in MongoDB when first used. The database name is `skillbuilder` (from connection string).

See `DATABASE_STRUCTURE.md` for detailed schema information.

## 🎓 Example Usage

### Creating a Complete Quiz Flow

1. **Admin creates course:**
   ```json
   POST /v1/admin/courses
   {
     "title": "JavaScript Fundamentals",
     "instructor": "John Doe",
     "description": "Learn JavaScript basics"
   }
   ```

2. **Admin creates quiz:**
   ```json
   POST /v1/admin/quizzes
   {
     "title": "JS Basics Quiz",
     "courseId": "<course_id>",
     "description": "Test your JS knowledge",
     "questions": [
       {
         "text": "What is JavaScript?",
         "type": "mcq",
         "options": ["Language", "Framework", "Library"],
         "correctAnswer": "Language",
         "points": 10
       }
     ],
     "durationMinutes": 30
   }
   ```

3. **Student enrolls:**
   ```json
   POST /v1/student/courses/<course_id>/enroll
   ```

4. **Student takes quiz:**
   ```json
   GET /v1/quiz/<quiz_id>/questions
   POST /v1/quiz/<quiz_id>/submit
   {
     "answers": [
       { "questionId": "<q_id>", "answer": "Language" }
     ]
   }
   ```

5. **Admin views results:**
   ```json
   GET /v1/admin/quiz-submissions
   ```

## ✅ System Status

All features are implemented and ready to use:
- ✅ User authentication (login/signup)
- ✅ Course management
- ✅ Quiz creation and taking
- ✅ Result storage and viewing
- ✅ Admin dashboard
- ✅ Student dashboard
- ✅ Activity tracking

The system is fully functional and ready for use!
