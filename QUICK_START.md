# Quick Start Guide - MongoDB Database Setup

## ✅ What's Been Fixed

1. **Users Database** - Properly stores all user credentials
2. **Login/Signup** - Works correctly (login if exists, signup if not)
3. **Quizzes Database** - Stores quiz questions available to ALL students
4. **Results Database** - Stores quiz results visible to admin
5. **Data Storage** - All data is properly saved to MongoDB and visible in MongoDB Atlas

## 🚀 How to Use

### Step 1: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: skillbuilder
🚀 Server running on http://localhost:3000
```

### Step 2: Verify Database Connection

Visit: `http://localhost:3000/v1/test/db-status`

This shows:
- Database connection status
- All collections
- Document counts
- Sample data

### Step 3: Create Admin User (First Time)

```bash
cd server
npm run init-admin
```

This creates:
- Email: `admin@skillbuilder.com`
- Password: `admin123`

### Step 4: Test User Registration

**Register a new student:**
```bash
POST http://localhost:3000/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Check MongoDB Atlas:**
- Go to Browse Collections
- Select `skillbuilder` database
- Select `users` collection
- You should see the new user!

### Step 5: Test Login

**Login with existing user:**
```bash
POST http://localhost:3000/v1/auth/student/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**If user doesn't exist:**
- Returns error: "User not found. Please sign up first."

**If user exists:**
- Returns JWT token and user data
- User data is retrieved from MongoDB `users` collection

### Step 6: Admin Creates Quiz

**Login as admin first:**
```bash
POST http://localhost:3000/v1/auth/admin/login
{
  "email": "admin@skillbuilder.com",
  "password": "admin123"
}
```

**Create a quiz:**
```bash
POST http://localhost:3000/v1/admin/quizzes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "JavaScript Basics",
  "courseId": "<any_course_id>",
  "description": "Test your JavaScript knowledge",
  "questions": [
    {
      "text": "What is JavaScript?",
      "type": "mcq",
      "options": ["Programming Language", "Framework", "Library"],
      "correctAnswer": "Programming Language",
      "points": 10
    },
    {
      "text": "What is 2 + 2?",
      "type": "aptitude",
      "options": ["3", "4", "5"],
      "correctAnswer": "4",
      "points": 5
    }
  ],
  "durationMinutes": 30
}
```

**Check MongoDB Atlas:**
- Select `quizzes` collection
- You should see the quiz with all questions and correct answers!

### Step 7: Student Takes Quiz

**Student views available quizzes:**
```bash
GET http://localhost:3000/v1/student/quizzes
Authorization: Bearer <student_token>
```

**Student gets quiz questions:**
```bash
GET http://localhost:3000/v1/quiz/<quiz_id>/questions
Authorization: Bearer <student_token>
```

**Student submits quiz:**
```bash
POST http://localhost:3000/v1/quiz/<quiz_id>/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "<question_id>",
      "answer": "Programming Language"
    },
    {
      "questionId": "<question_id>",
      "answer": "4"
    }
  ]
}
```

**Check MongoDB Atlas:**
- Select `quizsubmissions` collection
- You should see the submission with:
  - Student ID
  - Quiz ID
  - Score and percentage
  - Pass/fail status
  - Correct/incorrect answers

### Step 8: Admin Views Results

**Admin views all quiz results:**
```bash
GET http://localhost:3000/v1/admin/quiz-submissions
Authorization: Bearer <admin_token>
```

**Check MongoDB Atlas:**
- Select `quizsubmissions` collection
- All results are stored here and visible to admin

## 📊 Database Collections in MongoDB Atlas

When you open MongoDB Atlas and browse collections, you'll see:

### 1. `users` Collection
- **Contains:** All user credentials
- **When created:** First user registration
- **What you'll see:** Name, email, hashed password, role

### 2. `quizzes` Collection
- **Contains:** All quiz questions and answers
- **When created:** First quiz creation by admin
- **What you'll see:** Quiz title, questions, correct answers

### 3. `quizsubmissions` Collection
- **Contains:** All quiz results
- **When created:** First quiz submission by student
- **What you'll see:** Student ID, Quiz ID, score, percentage, pass/fail

## 🔍 Verify Data is Stored

### Method 1: Test Endpoint
Visit: `http://localhost:3000/v1/test/db-status`

Shows all collections and document counts.

### Method 2: MongoDB Atlas
1. Log into MongoDB Atlas
2. Click "Browse Collections"
3. Select database: `skillbuilder`
4. See all collections with data

### Method 3: Server Logs
Watch the server console for messages like:
```
✅ New user registered: john@example.com (student)
📝 User saved to MongoDB users collection
✅ Quiz created and saved to MongoDB quizzes collection
✅ Quiz submission saved to MongoDB quizsubmissions collection
```

## ✅ Complete Flow Summary

1. **User Registration:**
   - `POST /v1/auth/register` → Saves to `users` collection → Visible in MongoDB

2. **User Login:**
   - `POST /v1/auth/student/login` → Checks `users` collection → If exists, login successful

3. **Admin Creates Quiz:**
   - `POST /v1/admin/quizzes` → Saves to `quizzes` collection → Visible in MongoDB
   - Quiz is available to ALL students immediately

4. **Student Takes Quiz:**
   - `GET /v1/student/quizzes` → Gets from `quizzes` collection
   - `GET /v1/quiz/:id/questions` → Gets questions (answers hidden)
   - `POST /v1/quiz/:id/submit` → Evaluates answers → Saves to `quizsubmissions` collection

5. **Admin Views Results:**
   - `GET /v1/admin/quiz-submissions` → Gets from `quizsubmissions` collection
   - Shows all results with student details and scores

## 🎯 Key Points

- ✅ **Users collection:** Stores all credentials (login checks here, signup saves here)
- ✅ **Quizzes collection:** Stores all quiz questions (available to all students)
- ✅ **Quiz submissions collection:** Stores all results (visible to admin)
- ✅ **All data is stored in MongoDB and visible in MongoDB Atlas**
- ✅ **Collections are created automatically when first document is saved**

## 🐛 Troubleshooting

**If you don't see the database:**
1. Make sure server is running
2. Check connection string in `server/.env`
3. Verify IP is whitelisted in MongoDB Atlas
4. Create some data (register user, create quiz) - collections appear when first document is saved

**If data is not saving:**
1. Check server logs for errors
2. Verify MongoDB connection (should see "✅ MongoDB connected successfully")
3. Check the test endpoint: `http://localhost:3000/v1/test/db-status`

Everything is now properly configured and working! 🎉
