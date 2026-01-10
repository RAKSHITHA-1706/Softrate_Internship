# MongoDB Database Guide

## Database Structure

Your MongoDB database is named **`skillbuilder`** and contains the following collections:

### 1. `users` Collection
**Purpose:** Stores all user credentials (students and admins)

**What gets stored:**
- User name, email, password (hashed)
- Role (student or admin)
- Enrollment information

**When data is saved:**
- ✅ When a student registers (`POST /v1/auth/register`)
- ✅ When an admin is created (`npm run init-admin`)
- ✅ All user data is visible in MongoDB Atlas

**To view in MongoDB Atlas:**
1. Go to your MongoDB Atlas dashboard
2. Click on "Browse Collections"
3. Select database: `skillbuilder`
4. Select collection: `users`
5. You'll see all registered users with their emails and hashed passwords

### 2. `quizzes` Collection
**Purpose:** Stores quiz questions and answers

**What gets stored:**
- Quiz title, description
- Questions with correct answers
- Duration, course reference

**When data is saved:**
- ✅ When admin creates a quiz (`POST /v1/admin/quizzes`)
- ✅ All quizzes are available to ALL students (no enrollment needed)
- ✅ Quiz data is visible in MongoDB Atlas

**To view in MongoDB Atlas:**
1. Select database: `skillbuilder`
2. Select collection: `quizzes`
3. You'll see all quizzes with questions and correct answers

### 3. `quizsubmissions` Collection
**Purpose:** Stores quiz results and evaluations

**What gets stored:**
- Student ID, Quiz ID
- Submitted answers
- Score, percentage, pass/fail status
- Correct/incorrect answer counts

**When data is saved:**
- ✅ When a student submits a quiz (`POST /v1/quiz/:id/submit`)
- ✅ Results are automatically evaluated against stored correct answers
- ✅ All results are visible to admin
- ✅ Results are visible in MongoDB Atlas

**To view in MongoDB Atlas:**
1. Select database: `skillbuilder`
2. Select collection: `quizsubmissions`
3. You'll see all quiz submissions with scores and results

## How to Verify Data is Stored

### Method 1: Using Test Endpoint
Visit: `http://localhost:3000/v1/test/db-status`

This will show you:
- Database connection status
- All collections
- Document counts
- Sample data from each collection

### Method 2: Using MongoDB Atlas
1. Log into MongoDB Atlas
2. Click "Browse Collections"
3. Select database: `skillbuilder`
4. You'll see all collections:
   - `users` - All registered users
   - `quizzes` - All quizzes with questions
   - `quizsubmissions` - All quiz results
   - `courses` - Course information (if created)
   - `activities` - Activity logs

### Method 3: Check Server Logs
When you run the server, you'll see logs like:
```
✅ MongoDB connected successfully
📊 Database: skillbuilder
✅ New user registered: student@example.com (student)
📝 User saved to MongoDB users collection
✅ Quiz created and saved to MongoDB quizzes collection
✅ Quiz submission saved to MongoDB quizsubmissions collection
```

## Complete Flow

### 1. User Registration/Login
```
Student registers → Saved to `users` collection → Visible in MongoDB
Student logs in → Checks `users` collection → If exists, login successful
```

### 2. Admin Creates Quiz
```
Admin creates quiz → Saved to `quizzes` collection → Visible in MongoDB
Quiz is available to ALL students immediately
```

### 3. Student Takes Quiz
```
Student views quizzes → Gets from `quizzes` collection
Student submits answers → Evaluated against correct answers
Results saved to `quizsubmissions` collection → Visible in MongoDB
```

### 4. Admin Views Results
```
Admin views submissions → Gets from `quizsubmissions` collection
Shows all student results with scores and pass/fail status
```

## Troubleshooting

### If you don't see the database in MongoDB Atlas:

1. **Check Connection:**
   - Make sure the server is running
   - Check server logs for connection status
   - Visit `http://localhost:3000/v1/test/db-status`

2. **Check IP Whitelist:**
   - In MongoDB Atlas, go to "Network Access"
   - Make sure your IP is whitelisted (or use `0.0.0.0/0` for all IPs)

3. **Check Connection String:**
   - Verify the password is URL-encoded (`%40` for `@`)
   - Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/database`

4. **Create Some Data:**
   - Register a user: `POST /v1/auth/register`
   - Create a quiz as admin: `POST /v1/admin/quizzes`
   - Take a quiz as student: `POST /v1/quiz/:id/submit`
   - Then check MongoDB Atlas - data should appear

### If data is not being saved:

1. **Check Server Logs:**
   - Look for error messages
   - Look for success messages like "✅ Saved to MongoDB"

2. **Check Database Connection:**
   - Server should show: `✅ MongoDB connected successfully`
   - If not, check your connection string

3. **Verify Collections:**
   - Collections are created automatically when first document is saved
   - If no data exists, collections won't appear until you create some

## Quick Test

1. **Start server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Register a user:**
   ```bash
   POST http://localhost:3000/v1/auth/register
   Body: { "name": "Test User", "email": "test@example.com", "password": "test123" }
   ```

3. **Check MongoDB Atlas:**
   - Go to Browse Collections
   - Select `skillbuilder` database
   - You should see `users` collection with your test user

4. **Check test endpoint:**
   - Visit: `http://localhost:3000/v1/test/db-status`
   - Should show your user in the response

## Summary

- ✅ **users** collection: All user credentials (login/signup)
- ✅ **quizzes** collection: All quiz questions (admin creates, students see)
- ✅ **quizsubmissions** collection: All quiz results (students submit, admin views)
- ✅ All data is stored in MongoDB and visible in MongoDB Atlas
- ✅ Collections are created automatically when first document is saved
