import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Course from '../models/Course';
import Quiz from '../models/Quiz';
import { hashPassword } from '../utils/auth';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deepak:deepakswamy%40123@cluster0.sexvvaf.mongodb.net/skillbuilder?appName=Cluster0';

async function setupQuiz() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Step 1: Create or get admin user
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const hashedPassword = await hashPassword(adminPassword);
            
            admin = new User({
                name: 'Admin',
                email: 'admin@skillbuilder.com',
                password: hashedPassword,
                role: 'admin',
                permissions: ['all'],
            });
            await admin.save();
            console.log('✅ Admin user created: admin@skillbuilder.com / admin123');
        } else {
            console.log('ℹ️  Admin user already exists:', admin.email);
        }

        // Step 2: Create a sample course
        let course = await Course.findOne({ title: 'JavaScript Fundamentals' });
        if (!course) {
            course = new Course({
                title: 'JavaScript Fundamentals',
                instructor: 'Dr. Sarah Johnson',
                description: 'Learn the fundamentals of JavaScript programming including variables, functions, arrays, and objects.',
                thumbnail: 'https://via.placeholder.com/300x200?text=JavaScript',
                totalQuizzes: 0,
                completedQuizzes: 0,
                students: [],
            });
            await course.save();
            console.log('✅ Course created: JavaScript Fundamentals');
        } else {
            console.log('ℹ️  Course already exists:', course.title);
        }

        // Step 3: Create a comprehensive quiz
        let quiz = await Quiz.findOne({ title: 'JavaScript Basics Quiz' });
        if (!quiz) {
            quiz = new Quiz({
                title: 'JavaScript Basics Quiz',
                courseId: course._id,
                description: 'Test your knowledge of JavaScript fundamentals. This quiz covers variables, functions, arrays, and basic programming concepts.',
                durationMinutes: 30,
                questions: [
                    {
                        text: 'What is JavaScript?',
                        type: 'mcq',
                        options: [
                            'A markup language',
                            'A programming language',
                            'A styling language',
                            'A database language'
                        ],
                        correctAnswer: 'A programming language',
                        points: 10,
                    },
                    {
                        text: 'Which keyword is used to declare a variable in JavaScript?',
                        type: 'mcq',
                        options: ['var', 'let', 'const', 'All of the above'],
                        correctAnswer: 'All of the above',
                        points: 10,
                    },
                    {
                        text: 'What is the result of: console.log(typeof null)?',
                        type: 'mcq',
                        options: ['null', 'undefined', 'object', 'string'],
                        correctAnswer: 'object',
                        points: 10,
                    },
                    {
                        text: 'What does the following code return: [1, 2, 3].map(x => x * 2)?',
                        type: 'mcq',
                        options: [
                            '[1, 2, 3]',
                            '[2, 4, 6]',
                            '[1, 4, 9]',
                            'Error'
                        ],
                        correctAnswer: '[2, 4, 6]',
                        points: 10,
                    },
                    {
                        text: 'What is a closure in JavaScript?',
                        type: 'mcq',
                        options: [
                            'A function that has access to variables in its outer scope',
                            'A way to close a function',
                            'A method to hide variables',
                            'A type of loop'
                        ],
                        correctAnswer: 'A function that has access to variables in its outer scope',
                        points: 15,
                    },
                    {
                        text: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?',
                        type: 'mcq',
                        options: ['true', 'false', 'undefined', 'Error'],
                        correctAnswer: 'false',
                        points: 10,
                    },
                    {
                        text: 'If a train travels 120 km in 2 hours, what is its average speed?',
                        type: 'aptitude',
                        options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
                        correctAnswer: '60 km/h',
                        points: 10,
                    },
                    {
                        text: 'What is 25% of 200?',
                        type: 'aptitude',
                        options: ['25', '50', '75', '100'],
                        correctAnswer: '50',
                        points: 10,
                    },
                    {
                        text: 'Write a function that returns the sum of two numbers.',
                        type: 'coding',
                        options: [
                            'function sum(a, b) { return a + b; }',
                            'function sum(a, b) { return a - b; }',
                            'function sum(a, b) { return a * b; }',
                            'function sum(a, b) { return a / b; }'
                        ],
                        correctAnswer: 'function sum(a, b) { return a + b; }',
                        points: 15,
                    },
                    {
                        text: 'What is the correct way to create an array in JavaScript?',
                        type: 'mcq',
                        options: [
                            'var arr = []',
                            'var arr = new Array()',
                            'var arr = Array()',
                            'All of the above'
                        ],
                        correctAnswer: 'All of the above',
                        points: 10,
                    },
                ],
            });
            await quiz.save();
            
            // Update course quiz count
            course.totalQuizzes = 1;
            await course.save();
            
            console.log('✅ Quiz created: JavaScript Basics Quiz');
            console.log(`📝 Quiz ID: ${quiz._id}`);
            console.log(`📝 Total Questions: ${quiz.questions.length}`);
            console.log(`📝 Total Points: ${quiz.questions.reduce((sum, q) => sum + q.points, 0)}`);
        } else {
            console.log('ℹ️  Quiz already exists:', quiz.title);
        }

        // Step 4: Create a test student user
        let student = await User.findOne({ email: 'student@test.com' });
        if (!student) {
            const studentPassword = await hashPassword('student123');
            student = new User({
                name: 'Test Student',
                email: 'student@test.com',
                password: studentPassword,
                role: 'student',
                enrolledCourses: 0,
            });
            await student.save();
            console.log('✅ Test student created: student@test.com / student123');
        } else {
            console.log('ℹ️  Test student already exists:', student.email);
        }

        console.log('\n🎉 Setup Complete!');
        console.log('\n📋 Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Login:');
        console.log('  Email: admin@skillbuilder.com');
        console.log('  Password: admin123');
        console.log('\nStudent Login:');
        console.log('  Email: student@test.com');
        console.log('  Password: student123');
        console.log('\nQuiz Details:');
        console.log(`  Title: ${quiz.title}`);
        console.log(`  Course: ${course.title}`);
        console.log(`  Questions: ${quiz.questions.length}`);
        console.log(`  Duration: ${quiz.durationMinutes} minutes`);
        console.log(`  Quiz ID: ${quiz._id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ All data saved to MongoDB!');
        console.log('📊 Check MongoDB Atlas to see:');
        console.log('   - users collection (admin and student)');
        console.log('   - courses collection (JavaScript Fundamentals)');
        console.log('   - quizzes collection (JavaScript Basics Quiz)');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error setting up quiz:', error.message);
        console.error(error);
        process.exit(1);
    }
}

setupQuiz();
