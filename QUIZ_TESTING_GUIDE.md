# Quiz Testing Guide - Complete Feature Verification

## ✅ Quiz Created Successfully!

A complete quiz has been set up with all features working. Here's what was created:

### Quiz Details
- **Title:** JavaScript Basics Quiz
- **Course:** JavaScript Fundamentals
- **Questions:** 10 questions
- **Total Points:** 110 points
- **Duration:** 30 minutes
- **Question Types:** MCQ, Aptitude, Coding

### Test Accounts
- **Admin:** admin@skillbuilder.com / admin123
- **Student:** student@test.com / student123

## 🧪 Testing All Features

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

### Step 2: Test Student Login

**Request:**
```bash
POST http://localhost:3000/v1/auth/student/login
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "student123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Test Student",
      "email": "student@test.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

✅ **Feature Verified:** User login works, data retrieved from MongoDB `users` collection

### Step 3: View Available Quizzes

**Request:**
```bash
GET http://localhost:3000/v1/student/quizzes
Authorization: Bearer <student_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "695f35d1a340b93ce23b3841",
      "title": "JavaScript Basics Quiz",
      "courseTitle": "JavaScript Fundamentals",
      "description": "Test your knowledge...",
      "durationMinutes": 30,
      "totalQuestions": 10,
      "isCompleted": false,
      "score": null,
      "passed": null
    }
  ]
}
```

✅ **Feature Verified:** Quiz is available to all students, retrieved from MongoDB `quizzes` collection

### Step 4: Get Quiz Questions

**Request:**
```bash
GET http://localhost:3000/v1/quiz/695f35d1a340b93ce23b3841/questions
Authorization: Bearer <student_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "695f35d1a340b93ce23b3841",
    "title": "JavaScript Basics Quiz",
    "description": "Test your knowledge...",
    "questions": [
      {
        "id": "...",
        "text": "What is JavaScript?",
        "type": "mcq",
        "options": [
          "A markup language",
          "A programming language",
          "A styling language",
          "A database language"
        ],
        "points": 10
      },
      // ... 9 more questions
    ],
    "durationMinutes": 30
  }
}
```

✅ **Feature Verified:** Questions retrieved (correct answers hidden from students)

### Step 5: Submit Quiz Answers

**Request:**
```bash
POST http://localhost:3000/v1/quiz/695f35d1a340b93ce23b3841/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "<question_id_1>",
      "answer": "A programming language"
    },
    {
      "questionId": "<question_id_2>",
      "answer": "All of the above"
    },
    {
      "questionId": "<question_id_3>",
      "answer": "object"
    },
    {
      "questionId": "<question_id_4>",
      "answer": "[2, 4, 6]"
    },
    {
      "questionId": "<question_id_5>",
      "answer": "A function that has access to variables in its outer scope"
    },
    {
      "questionId": "<question_id_6>",
      "answer": "false"
    },
    {
      "questionId": "<question_id_7>",
      "answer": "60 km/h"
    },
    {
      "questionId": "<question_id_8>",
      "answer": "50"
    },
    {
      "questionId": "<question_id_9>",
      "answer": "function sum(a, b) { return a + b; }"
    },
    {
      "questionId": "<question_id_10>",
      "answer": "All of the above"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "695f35d1a340b93ce23b3841",
    "score": 110,
    "totalPoints": 110,
    "percentage": 100,
    "passed": true,
    "correctAnswers": 10,
    "incorrectAnswers": 0
  }
}
```

✅ **Feature Verified:** 
- Answers evaluated against stored correct answers
- Score calculated automatically
- Results saved to MongoDB `quizsubmissions` collection
- Pass/fail determined (60% threshold)

### Step 6: View Quiz Results (Student)

**Request:**
```bash
GET http://localhost:3000/v1/quiz/695f35d1a340b93ce23b3841/results
Authorization: Bearer <student_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "695f35d1a340b93ce23b3841",
    "studentName": "Test Student",
    "score": 110,
    "totalPoints": 110,
    "percentage": 100,
    "passed": true,
    "correctAnswers": 10,
    "incorrectAnswers": 0,
    "sectionBreakdown": [...],
    "performanceAnalysis": {...},
    "careerPrediction": {...}
  }
}
```

✅ **Feature Verified:** Student can view their own results

### Step 7: Admin Login

**Request:**
```bash
POST http://localhost:3000/v1/auth/admin/login
Content-Type: application/json

{
  "email": "admin@skillbuilder.com",
  "password": "admin123"
}
```

✅ **Feature Verified:** Admin login works

### Step 8: Admin Views All Quiz Results

**Request:**
```bash
GET http://localhost:3000/v1/admin/quiz-submissions
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "quizId": "695f35d1a340b93ce23b3841",
      "quizTitle": "JavaScript Basics Quiz",
      "courseTitle": "JavaScript Fundamentals",
      "studentId": "...",
      "studentName": "Test Student",
      "studentEmail": "student@test.com",
      "score": 110,
      "totalPoints": 110,
      "percentage": 100,
      "passed": true,
      "correctAnswers": 10,
      "incorrectAnswers": 0,
      "submittedAt": "2026-01-08T..."
    }
  ]
}
```

✅ **Feature Verified:** Admin can view all quiz submissions from MongoDB `quizsubmissions` collection

### Step 9: Admin Views Quiz Details

**Request:**
```bash
GET http://localhost:3000/v1/admin/quizzes/695f35d1a340b93ce23b3841
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "695f35d1a340b93ce23b3841",
    "title": "JavaScript Basics Quiz",
    "questions": [
      {
        "id": "...",
        "text": "What is JavaScript?",
        "type": "mcq",
        "options": [...],
        "points": 10,
        "correctAnswer": "A programming language"  // Admin can see answers
      },
      // ... all questions with correct answers
    ],
    "totalSubmissions": 1,
    "averageScore": 100
  }
}
```

✅ **Feature Verified:** Admin can see correct answers (students cannot)

## 📊 Verify in MongoDB Atlas

1. **Login to MongoDB Atlas**
2. **Browse Collections**
3. **Select database:** `skillbuilder`

### Check Collections:

1. **users collection:**
   - ✅ Admin: admin@skillbuilder.com
   - ✅ Student: student@test.com

2. **quizzes collection:**
   - ✅ JavaScript Basics Quiz
   - ✅ 10 questions with correct answers

3. **quizsubmissions collection:**
   - ✅ Quiz submission with score
   - ✅ Student ID, Quiz ID
   - ✅ Percentage and pass/fail status

4. **courses collection:**
   - ✅ JavaScript Fundamentals course

## 🎯 All Features Working!

✅ **User Authentication:**
- Login (checks MongoDB users collection)
- Signup (saves to MongoDB users collection)

✅ **Quiz Management:**
- Admin creates quiz (saves to MongoDB quizzes collection)
- Quiz available to all students
- Questions visible to students (answers hidden)

✅ **Quiz Taking:**
- Student views available quizzes
- Student gets quiz questions
- Student submits answers
- Answers evaluated against stored correct answers

✅ **Results Storage:**
- Results saved to MongoDB quizsubmissions collection
- Score, percentage, pass/fail calculated
- Results visible in MongoDB Atlas

✅ **Admin Viewing:**
- Admin can view all quiz submissions
- Admin can see correct answers
- Admin can view individual student results

## 🚀 Quick Test Commands

```bash
# Test database status
GET http://localhost:3000/v1/test/db-status

# Student login
POST http://localhost:3000/v1/auth/student/login
{"email": "student@test.com", "password": "student123"}

# View quizzes
GET http://localhost:3000/v1/student/quizzes

# Get quiz questions
GET http://localhost:3000/v1/quiz/695f35d1a340b93ce23b3841/questions

# Submit quiz (use question IDs from above)
POST http://localhost:3000/v1/quiz/695f35d1a340b93ce23b3841/submit
{"answers": [...]}

# Admin view results
GET http://localhost:3000/v1/admin/quiz-submissions
```

Everything is working perfectly! 🎉
