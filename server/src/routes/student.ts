import express, { Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Quiz from '../models/Quiz';
import QuizSubmission from '../models/QuizSubmission';
import Activity from '../models/Activity';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('student'));

// Student Dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const courses = await Course.find({ students: studentId });
        const submissions = await QuizSubmission.find({ studentId });
        const activities = await Activity.find({ userId: studentId })
            .sort({ timestamp: -1 })
            .limit(10);

        const completedQuizzes = submissions.filter((s) => s.passed).length;
        const pendingQuizzes = await Quiz.countDocuments({
            courseId: { $in: courses.map((c) => c._id) },
            _id: { $nin: submissions.map((s) => s.quizId) },
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    enrolledCourses: courses.length,
                },
                stats: {
                    totalCourses: courses.length,
                    hoursLearned: Math.floor(Math.random() * 50) + 10,
                    quizzesCompleted: completedQuizzes,
                    pendingQuizzes,
                },
                recentActivity: activities.map((a) => ({
                    id: a._id.toString(),
                    type: a.type,
                    title: a.title,
                    timestamp: a.timestamp.toISOString(),
                    details: a.details,
                })),
                aiJobPrediction: {
                    role: 'Software Developer',
                    confidence: 85,
                    salaryRange: {
                        min: 60000,
                        max: 120000,
                    },
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

// Get Enrolled Courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        const courses = await Course.find({ students: studentId });
        const submissions = await QuizSubmission.find({ studentId });

        const coursesWithProgress = await Promise.all(
            courses.map(async (course) => {
                const quizzes = await Quiz.find({ courseId: course._id });
                const completedQuizzes = submissions.filter(
                    (s) => s.quizId.toString() === course._id.toString() && s.passed
                ).length;

                return {
                    id: course._id.toString(),
                    title: course.title,
                    instructor: course.instructor,
                    progress: quizzes.length > 0 ? (completedQuizzes / quizzes.length) * 100 : 0,
                    thumbnail: course.thumbnail,
                    totalQuizzes: quizzes.length,
                    completedQuizzes,
                    isEnrolled: true,
                };
            })
        );

        res.json({
            success: true,
            data: coursesWithProgress,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Available Courses (for enrollment)
router.get('/courses/available', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        const allCourses = await Course.find();
        const enrolledCourses = await Course.find({ students: studentId });
        const enrolledCourseIds = enrolledCourses.map((c) => c._id.toString());

        const availableCourses = allCourses.map((course) => ({
            id: course._id.toString(),
            title: course.title,
            instructor: course.instructor,
            description: course.description,
            thumbnail: course.thumbnail,
            totalQuizzes: course.totalQuizzes,
            studentCount: course.students.length,
            isEnrolled: enrolledCourseIds.includes(course._id.toString()),
        }));

        res.json({
            success: true,
            data: availableCourses,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                grade: user.grade,
                enrolledCourses: user.enrolledCourses || 0,
                avatar: user.avatar,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Skill Report
router.get('/report', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        const submissions = await QuizSubmission.find({ studentId });
        
        // Calculate actual skill scores based on quiz submissions
        const skillScores: any[] = [];
        
        if (submissions.length > 0) {
            // Calculate average performance
            const avgScore = submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length;
            
            // Get unique courses from quizzes
            const quizIds = submissions.map(s => s.quizId).filter(id => id);
            const quizzes = await Quiz.find({ _id: { $in: quizIds } }).populate('courseId');
            
            // Group by course and calculate scores
            const courseScores: { [key: string]: { total: number; correct: number } } = {};
            
            quizzes.forEach((quiz: any) => {
                const courseTitle = (quiz.courseId as any)?.title || 'General';
                if (!courseScores[courseTitle]) {
                    courseScores[courseTitle] = { total: 0, correct: 0 };
                }
                
                const submission = submissions.find(s => s.quizId.toString() === quiz._id.toString());
                if (submission) {
                    courseScores[courseTitle].total += submission.correctAnswers + submission.incorrectAnswers;
                    courseScores[courseTitle].correct += submission.correctAnswers;
                }
            });
            
            // Convert to skill scores format
            Object.keys(courseScores).forEach(courseName => {
                const { total, correct } = courseScores[courseName];
                const score = total > 0 ? Math.round((correct / total) * 100) : 0;
                let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
                if (score >= 80) level = 'Advanced';
                else if (score >= 60) level = 'Intermediate';
                
                skillScores.push({
                    name: courseName,
                    score,
                    level,
                });
            });
            
            // If no course-based data, use overall performance
            if (skillScores.length === 0) {
                skillScores.push({
                    name: 'Overall Performance',
                    score: Math.round(avgScore),
                    level: avgScore >= 80 ? 'Advanced' : avgScore >= 60 ? 'Intermediate' : 'Beginner',
                });
            }
        } else {
            // No submissions yet
            skillScores.push({
                name: 'No Quizzes Taken',
                score: 0,
                level: 'Beginner' as const,
            });
        }

        // Generate recommendations based on actual performance
        const recommendations: string[] = [];
        if (submissions.length === 0) {
            recommendations.push('Start taking quizzes to assess your skills');
        } else {
            const avgScore = submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length;
            if (avgScore < 60) {
                recommendations.push('Focus on improving your understanding of core concepts');
                recommendations.push('Practice more questions to build confidence');
            } else if (avgScore < 80) {
                recommendations.push('You\'re doing well! Keep practicing to reach advanced level');
                recommendations.push('Review incorrect answers to identify weak areas');
            } else {
                recommendations.push('Excellent performance! Continue challenging yourself');
                recommendations.push('Try more advanced quizzes to further improve');
            }
        }

        res.json({
            success: true,
            data: {
                studentId,
                skills: skillScores,
                recommendations,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Available Quizzes (ALL quizzes available to all students)
router.get('/quizzes', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;

        console.log(`📚 Fetching quizzes for student: ${studentId}`);

        // Get ALL quizzes (available to all students)
        // Sort by creation date (newest first) so newly created quizzes appear at top
        // Use lean() for better performance and handle populate errors gracefully
        let quizzes;
        try {
            quizzes = await Quiz.find()
                .populate({
                    path: 'courseId',
                    select: 'title instructor',
                    model: 'Course'
                })
                .sort({ createdAt: -1 }) // Newest first
                .lean();
        } catch (populateError: any) {
            console.error('⚠️ Populate error, trying without populate:', populateError);
            // If populate fails, get quizzes without populating
            quizzes = await Quiz.find()
                .sort({ createdAt: -1 }) // Newest first
                .lean();
        }

        console.log(`📝 Found ${quizzes.length} quizzes in MongoDB quizzes collection`);

        if (quizzes.length === 0) {
            console.log('⚠️ No quizzes found in database');
            return res.json({
                success: true,
                data: [],
            });
        }

        // Get student's submissions
        const submissions = await QuizSubmission.find({ studentId });
        console.log(`📝 Student has ${submissions.length} submissions`);

        // Format quizzes with submission status
        const quizzesWithStatus = quizzes.map((quiz: any) => {
            try {
                const submission = submissions.find(
                    (s) => s.quizId.toString() === quiz._id.toString()
                );
                
                // Handle courseId - it might be populated or just an ObjectId
                let course = null;
                let courseIdStr = '';
                
                if (quiz.courseId) {
                    if (typeof quiz.courseId === 'object' && quiz.courseId._id) {
                        // Populated course
                        course = quiz.courseId;
                        courseIdStr = quiz.courseId._id.toString();
                    } else if (typeof quiz.courseId === 'object' && quiz.courseId.toString) {
                        // ObjectId
                        courseIdStr = quiz.courseId.toString();
                    } else {
                        // String
                        courseIdStr = quiz.courseId.toString();
                    }
                }

                return {
                    id: quiz._id.toString(),
                    title: quiz.title || 'Untitled Quiz',
                    courseId: courseIdStr,
                    courseTitle: course?.title || 'General Quiz',
                    instructor: course?.instructor || 'Admin',
                    description: quiz.description || '',
                    durationMinutes: quiz.durationMinutes || 30,
                    totalQuestions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
                    isCompleted: !!submission,
                    score: submission ? submission.percentage : null,
                    passed: submission ? submission.passed : null,
                };
            } catch (mapError: any) {
                console.error('Error mapping quiz:', quiz._id, mapError);
                // Return a basic quiz object even if mapping fails
                return {
                    id: quiz._id?.toString() || 'unknown',
                    title: quiz.title || 'Untitled Quiz',
                    courseId: 'unknown',
                    courseTitle: 'General Quiz',
                    instructor: 'Admin',
                    description: quiz.description || '',
                    durationMinutes: quiz.durationMinutes || 30,
                    totalQuestions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
                    isCompleted: false,
                    score: null,
                    passed: null,
                };
            }
        });

        console.log(`✅ Returning ${quizzesWithStatus.length} quizzes to student`);

        res.json({
            success: true,
            data: quizzesWithStatus,
        });
    } catch (error: any) {
        console.error('❌ Error fetching quizzes:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Enroll in Course
router.post('/courses/:courseId/enroll', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check if already enrolled
        if (course.students.includes(new mongoose.Types.ObjectId(studentId))) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course',
            });
        }

        // Enroll student
        course.students.push(new mongoose.Types.ObjectId(studentId));
        await course.save();

        // Update user's enrolled courses count
        await User.findByIdAndUpdate(studentId, {
            $inc: { enrolledCourses: 1 },
        });

        // Create activity
        const activity = new Activity({
            userId: studentId,
            type: 'course_enrolled',
            title: `Enrolled in course: ${course.title}`,
        });
        await activity.save();

        res.json({
            success: true,
            data: {
                message: 'Successfully enrolled in course',
                course: {
                    id: course._id.toString(),
                    title: course.title,
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
