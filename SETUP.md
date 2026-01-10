# Setup Guide - MongoDB Migration

This guide will help you set up the SkillBuilder application with MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

## Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

**Important:** The password in the MongoDB URI is URL-encoded (`%40` represents `@`).

## Step 3: Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:3000
📡 API available at http://localhost:3000/v1
```

## Step 4: Configure Frontend

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/v1
```

## Step 5: Install Frontend Dependencies (if not already done)

```bash
npm install
```

## Step 6: Start the Frontend

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

## Testing the Setup

1. **Test Backend Connection:**
   - Visit `http://localhost:3000/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Student Login:**
   - Go to `http://localhost:5173`
   - Click "Student Login"
   - Enter any email (e.g., `student@example.com`)
   - The system will create a new user if it doesn't exist

3. **Test Admin Login:**
   - Go to `http://localhost:5173`
   - Click "Admin Login"
   - Enter any email (e.g., `admin@example.com`)
   - The system will create a new admin user if it doesn't exist

## Database Collections

The following collections will be automatically created in MongoDB:

- **users** - Stores student and admin accounts
- **courses** - Stores course information
- **quizzes** - Stores quiz data with questions
- **quizsubmissions** - Stores quiz submission records
- **activities** - Stores user activity logs

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB connection error":
1. Check your internet connection
2. Verify the MongoDB URI is correct
3. Ensure your IP is whitelisted in MongoDB Atlas
4. Check that the password is URL-encoded correctly

### CORS Errors

If you see CORS errors in the browser:
- Ensure the backend is running on port 3000
- Check that `VITE_API_URL` in frontend `.env` matches the backend URL

### Port Already in Use

If port 3000 is already in use:
- Change `PORT` in `server/.env` to a different port
- Update `VITE_API_URL` in frontend `.env` to match

## Next Steps

1. Create some courses and quizzes through the admin panel
2. Enroll students in courses
3. Take quizzes as a student
4. View analytics as an admin

## Production Deployment

For production:
1. Change `JWT_SECRET` to a strong, random string
2. Set `NODE_ENV=production`
3. Use environment variables for all sensitive data
4. Enable MongoDB authentication and IP whitelisting
5. Use a reverse proxy (nginx) for the backend
6. Set up HTTPS
