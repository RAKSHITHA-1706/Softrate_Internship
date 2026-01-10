import express, { Request, Response } from 'express';
import User from '../models/User';
import Quiz from '../models/Quiz';
import QuizSubmission from '../models/QuizSubmission';
import mongoose from 'mongoose';

const router = express.Router();

// Test endpoint to verify database connection and show data
router.get('/db-status', async (req: Request, res: Response) => {
    try {
        const db = mongoose.connection.db;
        const dbName = db?.databaseName || 'Unknown';
        
        // Get collection names
        const collections = await db?.listCollections().toArray() || [];
        const collectionNames = collections.map((c) => c.name);
        
        // Count documents in each collection
        const counts: any = {};
        for (const collectionName of collectionNames) {
            const collection = db?.collection(collectionName);
            counts[collectionName] = await collection?.countDocuments() || 0;
        }
        
        // Get sample data
        const sampleUsers = await User.find().limit(3).select('name email role');
        const sampleQuizzes = await Quiz.find().limit(3).select('title questions');
        const sampleSubmissions = await QuizSubmission.find().limit(3).select('score percentage');
        
        res.json({
            success: true,
            data: {
                database: dbName,
                connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
                collections: collectionNames,
                documentCounts: counts,
                samples: {
                    users: sampleUsers,
                    quizzes: sampleQuizzes.map((q) => ({
                        title: q.title,
                        questionCount: q.questions.length,
                    })),
                    submissions: sampleSubmissions,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

export default router;
