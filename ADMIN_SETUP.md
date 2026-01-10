# Admin Setup Guide

## Initialize Admin User

To create the admin user in MongoDB, run:

```bash
cd server
npm run init-admin
```

This will:
- Delete all existing admin users
- Create a single admin user with:
  - **Email:** `admin@skillbuilder.com`
  - **Password:** `admin123` (or set `ADMIN_PASSWORD` in `.env`)

## Admin Login

1. Go to `/admin/login`
2. Enter:
   - Email: `admin@skillbuilder.com`
   - Password: `admin123`

## Important Notes

- Only ONE admin user exists in the system
- If you need to reset the admin, run `npm run init-admin` again
- This will delete all existing admins and create a fresh one

