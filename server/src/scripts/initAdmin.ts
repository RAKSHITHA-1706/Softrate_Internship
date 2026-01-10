import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { hashPassword } from '../utils/auth';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0';

async function initAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all existing admins first
        const deleteResult = await User.deleteMany({ role: 'admin' });
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing admin user(s)`);

        // Create single default admin
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await hashPassword(adminPassword);

        const admin = new User({
            name: 'Admin',
            email: 'admin@skillbuilder.com',
            password: hashedPassword,
            role: 'admin',
            permissions: ['all'],
        });

        await admin.save();
        console.log('✅ Admin user created successfully:');
        console.log('   Email: admin@skillbuilder.com');
        console.log('   Password: admin123 (or set ADMIN_PASSWORD in .env)');
        console.log('   This is the ONLY admin account.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
        process.exit(1);
    }
}

initAdmin();
