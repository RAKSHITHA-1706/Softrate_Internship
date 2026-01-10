# Admin Credentials

## Default Admin Account

**Email:** `admin@skillbuilder.com`  
**Password:** `admin123` (optional - can login with just email)

## How to Login

1. Go to the admin login page
2. Enter email: `admin@skillbuilder.com`
3. Password is optional (can leave blank or enter `admin123`)
4. Click "Sign In as Admin"

## Creating Additional Admin Accounts

To create a new admin account, run:

```bash
cd server
npm run init-admin
```

Or create manually via API:
```bash
POST http://localhost:3000/v1/auth/register
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "yourpassword",
  "role": "admin"
}
```

## Admin Features

Once logged in as admin, you can:

1. **Create Quizzes** - Add quizzes for any subject/course
2. **View All Students** - See all registered students
3. **View Student Reports** - See individual student performance
4. **View Overall Reports** - See platform-wide statistics
5. **View Quiz Submissions** - See all quiz results
6. **Manage Courses** - Create and manage courses

## Security Note

- Password is optional for login (for easier access)
- In production, you may want to require passwords
- Admin accounts have full access to all data
