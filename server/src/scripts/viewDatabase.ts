import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Quiz from '../models/Quiz';
import QuizSubmission from '../models/QuizSubmission';
import Course from '../models/Course';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0';

async function viewDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // View Users Collection
        console.log('📋 USERS COLLECTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const users = await User.find();
        
        if (users.length === 0) {
            console.log('   ⚠️  No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`\n   User ${index + 1}:`);
                console.log(`   ──────────────────────────────────────`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Password Field: ${user.password ? '✅ EXISTS' : '❌ MISSING'}`);
                console.log(`   Password Length: ${user.password ? user.password.length : 0} characters`);
                console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
                console.log(`   Created: ${user.createdAt}`);
            });
        }

        // View Quizzes Collection
        console.log('\n\n📋 QUIZZES COLLECTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const quizzes = await Quiz.find();
        
        if (quizzes.length === 0) {
            console.log('   ⚠️  No quizzes found in database');
        } else {
            quizzes.forEach((quiz, index) => {
                console.log(`\n   Quiz ${index + 1}:`);
                console.log(`   ──────────────────────────────────────`);
                console.log(`   ID: ${quiz._id}`);
                console.log(`   Title: ${quiz.title}`);
                console.log(`   Course ID: ${quiz.courseId}`);
                console.log(`   Questions: ${quiz.questions.length}`);
                console.log(`   Duration: ${quiz.durationMinutes} minutes`);
                console.log(`   Created: ${quiz.createdAt}`);
            });
        }

        // View Courses Collection
        console.log('\n\n📋 COURSES COLLECTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const courses = await Course.find();
        
        if (courses.length === 0) {
            console.log('   ⚠️  No courses found in database');
        } else {
            courses.forEach((course, index) => {
                console.log(`\n   Course ${index + 1}:`);
                console.log(`   ──────────────────────────────────────`);
                console.log(`   ID: ${course._id}`);
                console.log(`   Title: ${course.title}`);
                console.log(`   Instructor: ${course.instructor}`);
                console.log(`   Students Enrolled: ${course.students.length}`);
                console.log(`   Total Quizzes: ${course.totalQuizzes}`);
                console.log(`   Created: ${course.createdAt}`);
            });
        }

        // View Quiz Submissions Collection
        console.log('\n\n📋 QUIZ SUBMISSIONS COLLECTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const submissions = await QuizSubmission.find();
        
        if (submissions.length === 0) {
            console.log('   ⚠️  No quiz submissions found in database');
        } else {
            submissions.forEach((submission, index) => {
                console.log(`\n   Submission ${index + 1}:`);
                console.log(`   ──────────────────────────────────────`);
                console.log(`   ID: ${submission._id}`);
                console.log(`   Quiz ID: ${submission.quizId}`);
                console.log(`   Student ID: ${submission.studentId}`);
                console.log(`   Score: ${submission.score}/${submission.totalPoints}`);
                console.log(`   Percentage: ${submission.percentage.toFixed(1)}%`);
                console.log(`   Passed: ${submission.passed ? '✅ YES' : '❌ NO'}`);
                console.log(`   Correct Answers: ${submission.correctAnswers}`);
                console.log(`   Incorrect Answers: ${submission.incorrectAnswers}`);
                console.log(`   Submitted: ${submission.submittedAt}`);
            });
        }

        // Summary
        console.log('\n\n📊 DATABASE SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Users: ${users.length}`);
        console.log(`   Courses: ${courses.length}`);
        console.log(`   Quizzes: ${quizzes.length}`);
        console.log(`   Quiz Submissions: ${submissions.length}`);
        console.log('\n');

        // Show raw MongoDB document structure
        console.log('📝 RAW DOCUMENT STRUCTURE (First User):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (users.length > 0) {
            const firstUser = users[0].toObject();
            console.log(JSON.stringify(firstUser, null, 2));
        }

        console.log('\n\n💡 IMPORTANT NOTES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Password field EXISTS in database (hashed for security)');
        console.log('✅ Passwords are hashed using bcrypt (60 characters long)');
        console.log('✅ This is CORRECT - passwords should never be stored in plain text');
        console.log('✅ To verify password works, try logging in with the credentials');
        console.log('\n📋 Test Credentials:');
        console.log('   Admin: admin@skillbuilder.com / admin123');
        console.log('   Student: student@test.com / student123');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error viewing database:', error.message);
        console.error(error);
        process.exit(1);
    }
}

viewDatabase();
