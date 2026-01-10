# Database Structure - SkillBuilder MongoDB

This document describes the MongoDB database structure and collections used in the SkillBuilder application.

## Database: `skillbuilder`

The database is automatically created when you first connect to MongoDB using the connection string.

## Collections

### 1. `users` Collection

Stores user accounts for both students and administrators.

**Schema:**
```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  role: String (required, enum: ['student', 'admin']),
  avatar: String (optional),
  grade: String (optional),
  enrolledCourses: Number (default: 0),
  permissions: [String] (default: [], admin only),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` - Unique index for fast lookups

**Usage:**
- Students can register via `/v1/auth/register`
- Students login via `/v1/auth/student/login`
- Admins login via `/v1/auth/admin/login`
- Admin users can be created manually or via `npm run init-admin`

### 2. `courses` Collection

Stores course information that students can enroll in.

**Schema:**
```typescript
{
  _id: ObjectId,
  title: String (required),
  instructor: String (required),
  description: String (optional),
  thumbnail: String (optional),
  totalQuizzes: Number (default: 0),
  completedQuizzes: Number (default: 0),
  students: [ObjectId] (references User),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- `students` - Array of user IDs enrolled in the course
- Quizzes reference courses via `courseId`

**Usage:**
- Admins create courses via `POST /v1/admin/courses`
- Students enroll via `POST /v1/student/courses/:courseId/enroll`
- Students view enrolled courses via `GET /v1/student/courses`
- Students view available courses via `GET /v1/student/courses/available`

### 3. `quizzes` Collection

Stores quiz data including questions and answers.

**Schema:**
```typescript
{
  _id: ObjectId,
  title: String (required),
  courseId: ObjectId (required, references Course),
  description: String (optional),
  questions: [{
    _id: ObjectId,
    text: String (required),
    type: String (required, enum: ['mcq', 'aptitude', 'coding']),
    options: [String] (optional),
    correctAnswer: String (optional),
    points: Number (default: 1)
  }],
  durationMinutes: Number (required, default: 30),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- `courseId` - References the Course this quiz belongs to

**Usage:**
- Admins create quizzes via `POST /v1/admin/quizzes`
- Admins view all quizzes via `GET /v1/admin/quizzes`
- Admins view quiz details via `GET /v1/admin/quizzes/:quizId`
- Students view available quizzes via `GET /v1/student/quizzes`
- Students get quiz questions via `GET /v1/quiz/:id/questions`

### 4. `quizsubmissions` Collection

Stores quiz submission records and results.

**Schema:**
```typescript
{
  _id: ObjectId,
  quizId: ObjectId (required, references Quiz),
  studentId: ObjectId (required, references User),
  answers: [{
    questionId: String (required),
    answer: String (required)
  }],
  score: Number (default: 0),
  totalPoints: Number (default: 0),
  percentage: Number (default: 0),
  passed: Boolean (default: false),
  correctAnswers: Number (default: 0),
  incorrectAnswers: Number (default: 0),
  submittedAt: Date (default: Date.now),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index on `{ quizId: 1, studentId: 1 }` for efficient queries

**Relationships:**
- `quizId` - References the Quiz that was taken
- `studentId` - References the User (student) who took the quiz

**Usage:**
- Students submit quizzes via `POST /v1/quiz/:id/submit`
- Students view results via `GET /v1/quiz/:id/results`
- Admins view all submissions via `GET /v1/admin/quiz-submissions`
- Admins view submissions by quiz via `GET /v1/admin/quizzes/:quizId/submissions`
- Admins view student results via `GET /v1/admin/students/:studentId/results`

### 5. `activities` Collection

Stores user activity logs for tracking user actions.

**Schema:**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  type: String (required, enum: ['quiz_completed', 'course_enrolled', 'badge_earned']),
  title: String (required),
  details: String (optional),
  timestamp: Date (default: Date.now),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- `userId` - References the User who performed the activity

**Usage:**
- Automatically created when students complete quizzes or enroll in courses
- Students view activities via dashboard endpoint

## Data Flow

### Student Registration & Login Flow

1. **Sign Up:**
   - `POST /v1/auth/register` → Creates new user in `users` collection
   - Password is hashed using bcrypt
   - Returns JWT token

2. **Login:**
   - `POST /v1/auth/student/login` → Validates credentials
   - Returns JWT token if valid

### Admin Quiz Creation Flow

1. **Create Course:**
   - Admin: `POST /v1/admin/courses` → Creates course in `courses` collection

2. **Create Quiz:**
   - Admin: `POST /v1/admin/quizzes` → Creates quiz in `quizzes` collection
   - Updates course `totalQuizzes` count

### Student Quiz Taking Flow

1. **Enroll in Course:**
   - Student: `POST /v1/student/courses/:courseId/enroll` → Adds student ID to course `students` array

2. **View Available Quizzes:**
   - Student: `GET /v1/student/quizzes` → Returns quizzes for enrolled courses

3. **Take Quiz:**
   - Student: `GET /v1/quiz/:id/questions` → Gets quiz questions (without answers)
   - Student: `POST /v1/quiz/:id/submit` → Submits answers
   - System calculates score and creates record in `quizsubmissions` collection
   - System creates activity log in `activities` collection

4. **View Results:**
   - Student: `GET /v1/quiz/:id/results` → Gets their submission results

### Admin Results Viewing Flow

1. **View All Submissions:**
   - Admin: `GET /v1/admin/quiz-submissions` → Returns all quiz submissions with student and quiz details

2. **View Quiz Submissions:**
   - Admin: `GET /v1/admin/quizzes/:quizId/submissions` → Returns all submissions for a specific quiz

3. **View Student Results:**
   - Admin: `GET /v1/admin/students/:studentId/results` → Returns all quiz results for a specific student

## Security Considerations

1. **Passwords:** All passwords are hashed using bcrypt before storage
2. **JWT Tokens:** Used for authentication, expire after 7 days
3. **Role-Based Access:** Students and admins have different endpoints
4. **Quiz Answers:** Correct answers are only visible to admins, not students

## Initialization

To create a default admin user:

```bash
cd server
npm run init-admin
```

This creates an admin user with:
- Email: `admin@skillbuilder.com`
- Password: `admin123` (or value from `ADMIN_PASSWORD` env variable)

**Important:** Change the default password after first login!

## MongoDB Connection

The connection string format:
```
mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0
```

Note: The password is URL-encoded (`%40` = `@`)

## Collections Summary

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | email, password, role |
| `courses` | Course information | title, instructor, students[] |
| `quizzes` | Quiz data | title, courseId, questions[] |
| `quizsubmissions` | Quiz results | quizId, studentId, score, percentage |
| `activities` | Activity logs | userId, type, title |

All collections automatically include `createdAt` and `updatedAt` timestamps.
