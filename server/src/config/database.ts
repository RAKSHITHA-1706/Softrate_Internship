import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// URL encode the password: deepakswamy@123 becomes deepakswamy%40123
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0';

export const connectDatabase = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            // Remove deprecated options, use modern connection
        });
        
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🔗 Host: ${conn.connection.host}`);
        console.log(`📝 Collections will be created automatically when data is saved`);
        
        // Log when collections are created
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('💡 Check your connection string and network access');
        process.exit(1);
    }
};

export default connectDatabase;
