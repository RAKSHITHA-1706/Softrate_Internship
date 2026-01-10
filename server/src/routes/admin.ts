import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Quiz from '../models/Quiz';
import QuizSubmission from '../models/QuizSubmission';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin Dashboard Stats
router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const activeCourses = await Course.countDocuments();
        const submissions = await QuizSubmission.find();
        const avgScore =
            submissions.length > 0
                ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
                : 0;
        const totalEnrollments = await Course.aggregate([
            { $project: { studentCount: { $size: '$students' } } },
            { $group: { _id: null, total: { $sum: '$studentCount' } } },
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                activeCourses,
                avgQuizScore: Math.round(avgScore * 10) / 10,
                totalEnrollments: totalEnrollments[0]?.total || 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Students
router.get('/students', async (req: AuthRequest, res: Response) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');

        res.json({
            success: true,
            data: students.map((s) => ({
                id: s._id.toString(),
                name: s.name,
                email: s.email,
                enrolledCourses: s.enrolledCourses || 0,
                grade: s.grade,
            })),
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
    try {
        const courses = await Course.find().populate('students', 'name email');

        res.json({
            success: true,
            data: courses.map((c) => ({
                id: c._id.toString(),
                title: c.title,
                instructor: c.instructor,
                description: c.description,
                thumbnail: c.thumbnail,
                totalQuizzes: c.totalQuizzes,
                completedQuizzes: c.completedQuizzes,
                studentCount: c.students.length,
            })),
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Create Course
router.post('/courses', async (req: AuthRequest, res: Response) => {
    try {
        const { title, instructor, description, thumbnail } = req.body;

        if (!title || !instructor) {
            return res.status(400).json({
                success: false,
                message: 'Title and instructor are required',
            });
        }

        const course = new Course({
            title,
            instructor,
            description,
            thumbnail,
        });

        await course.save();

        res.status(201).json({
            success: true,
            data: {
                id: course._id.toString(),
                title: course.title,
                instructor: course.instructor,
                description: course.description,
                thumbnail: course.thumbnail,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Create Quiz
router.post('/quizzes', async (req: AuthRequest, res: Response) => {
    try {
        const { title, courseId, description, questions, durationMinutes } = req.body;

        console.log('📝 Create Quiz Request:', {
            title,
            courseId,
            description,
            questionsCount: questions?.length,
            durationMinutes
        });

        if (!title || !courseId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Title, courseId, and questions array are required',
            });
        }

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course with ID ${courseId} not found. Please create the course first.`,
            });
        }

        // Validate questions array
        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one question is required',
            });
        }

        // Validate each question
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text || !q.type) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} is missing required fields (text, type)`,
                });
            }
            if (q.type === 'mcq' && (!q.options || q.options.length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} (MCQ) must have options`,
                });
            }
            if (!q.correctAnswer) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have a correct answer`,
                });
            }
        }

        const quiz = new Quiz({
            title,
            courseId,
            description,
            questions,
            durationMinutes: durationMinutes || 30,
        });

        await quiz.save();
        
        console.log(`✅ Quiz created and saved to MongoDB quizzes collection`);
        console.log(`📝 Quiz ID: ${quiz._id}, Title: ${quiz.title}, Questions: ${questions.length}`);
        console.log(`📝 Course ID: ${courseId}, Quiz will be available to all students`);

        // Update course quiz count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { totalQuizzes: 1 },
        });

        // Verify quiz is saved and accessible
        const savedQuiz = await Quiz.findById(quiz._id);
        if (savedQuiz) {
            console.log(`✅ Quiz verified in database: ${savedQuiz.title} with ${savedQuiz.questions.length} questions`);
        } else {
            console.error(`❌ Quiz not found after save!`);
        }

        res.status(201).json({
            success: true,
            data: {
                id: quiz._id.toString(),
                title: quiz.title,
                courseId: quiz.courseId.toString(),
                description: quiz.description,
                questions: quiz.questions,
                durationMinutes: quiz.durationMinutes,
            },
        });
    } catch (error: any) {
        console.error('❌ Error creating quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while creating quiz',
        });
    }
});

// Get Analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
    try {
        const submissions = await QuizSubmission.find();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Generate sample analytics data
        const labels = months.slice(0, 6);
        const data = labels.map(() => Math.floor(Math.random() * 50) + 20);

        res.json({
            success: true,
            data: {
                labels,
                datasets: [
                    {
                        label: 'Quiz Completions',
                        data,
                    },
                ],
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Quiz Submissions (Results) - This is the admin database view
router.get('/quiz-submissions', async (req: AuthRequest, res: Response) => {
    try {
        const submissions = await QuizSubmission.find()
            .populate('quizId', 'title courseId')
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });
        
        console.log(`📝 Found ${submissions.length} quiz submissions in MongoDB quizsubmissions collection`);

        const results = await Promise.all(
            submissions.map(async (submission) => {
                const quiz = await Quiz.findById(submission.quizId).populate('courseId', 'title');
                const course = quiz ? (quiz as any).courseId : null;

                return {
                    id: submission._id.toString(),
                    quizId: submission.quizId.toString(),
                    quizTitle: quiz ? quiz.title : 'Unknown Quiz',
                    courseTitle: course ? course.title : 'Unknown Course',
                    studentId: submission.studentId.toString(),
                    studentName: (submission.studentId as any).name || 'Unknown Student',
                    studentEmail: (submission.studentId as any).email || 'Unknown Email',
                    score: submission.score,
                    totalPoints: submission.totalPoints,
                    percentage: submission.percentage,
                    passed: submission.passed,
                    correctAnswers: submission.correctAnswers,
                    incorrectAnswers: submission.incorrectAnswers,
                    submittedAt: submission.submittedAt,
                };
            })
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Quiz Submissions by Quiz ID
router.get('/quizzes/:quizId/submissions', async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId).populate('courseId', 'title');
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        const submissions = await QuizSubmission.find({ quizId })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id.toString(),
                    title: quiz.title,
                    courseTitle: (quiz as any).courseId?.title || 'Unknown Course',
                    totalQuestions: quiz.questions.length,
                },
                submissions: submissions.map((s) => ({
                    id: s._id.toString(),
                    studentId: s.studentId.toString(),
                    studentName: (s.studentId as any).name || 'Unknown Student',
                    studentEmail: (s.studentId as any).email || 'Unknown Email',
                    score: s.score,
                    totalPoints: s.totalPoints,
                    percentage: s.percentage,
                    passed: s.passed,
                    correctAnswers: s.correctAnswers,
                    incorrectAnswers: s.incorrectAnswers,
                    submittedAt: s.submittedAt,
                })),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Quizzes
router.get('/quizzes', async (req: AuthRequest, res: Response) => {
    try {
        const quizzes = await Quiz.find().populate('courseId', 'title instructor').sort({ createdAt: -1 });

        const quizzesWithDetails = await Promise.all(
            quizzes.map(async (quiz) => {
                const submissions = await QuizSubmission.find({ quizId: quiz._id });
                const course = (quiz as any).courseId;

                return {
                    id: quiz._id.toString(),
                    title: quiz.title,
                    courseId: quiz.courseId.toString(),
                    courseTitle: course?.title || 'Unknown Course',
                    instructor: course?.instructor || 'Unknown Instructor',
                    description: quiz.description,
                    durationMinutes: quiz.durationMinutes,
                    totalQuestions: quiz.questions.length,
                    totalSubmissions: submissions.length,
                    averageScore:
                        submissions.length > 0
                            ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
                            : 0,
                    createdAt: quiz.createdAt,
                };
            })
        );

        res.json({
            success: true,
            data: quizzesWithDetails,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Quiz Details by ID
router.get('/quizzes/:quizId', async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId).populate('courseId', 'title instructor');
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        const submissions = await QuizSubmission.find({ quizId });
        const course = (quiz as any).courseId;

        res.json({
            success: true,
            data: {
                id: quiz._id.toString(),
                title: quiz.title,
                courseId: quiz.courseId.toString(),
                courseTitle: course?.title || 'Unknown Course',
                instructor: course?.instructor || 'Unknown Instructor',
                description: quiz.description,
                durationMinutes: quiz.durationMinutes,
                questions: quiz.questions.map((q) => ({
                    id: q._id?.toString() || '',
                    text: q.text,
                    type: q.type,
                    options: q.options,
                    points: q.points,
                    correctAnswer: q.correctAnswer, // Admin can see correct answers
                })),
                totalSubmissions: submissions.length,
                averageScore:
                    submissions.length > 0
                        ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
                        : 0,
                createdAt: quiz.createdAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Student Results (for a specific student)
router.get('/students/:studentId/results', async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        const submissions = await QuizSubmission.find({ studentId })
            .populate('quizId', 'title courseId')
            .sort({ submittedAt: -1 });

        const results = await Promise.all(
            submissions.map(async (submission) => {
                const quiz = await Quiz.findById(submission.quizId).populate('courseId', 'title');
                const course = quiz ? (quiz as any).courseId : null;

                return {
                    id: submission._id.toString(),
                    quizId: submission.quizId.toString(),
                    quizTitle: quiz ? quiz.title : 'Unknown Quiz',
                    courseTitle: course ? course.title : 'Unknown Course',
                    score: submission.score,
                    totalPoints: submission.totalPoints,
                    percentage: submission.percentage,
                    passed: submission.passed,
                    correctAnswers: submission.correctAnswers,
                    incorrectAnswers: submission.incorrectAnswers,
                    submittedAt: submission.submittedAt,
                };
            })
        );

        res.json({
            success: true,
            data: {
                student: {
                    id: student._id.toString(),
                    name: student.name,
                    email: student.email,
                },
                results,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get All Student Reports (Comprehensive)
router.get('/reports/students', async (req: AuthRequest, res: Response) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        
        const studentReports = await Promise.all(
            students.map(async (student) => {
                const submissions = await QuizSubmission.find({ studentId: student._id });
                const totalQuizzes = submissions.length;
                const passedQuizzes = submissions.filter(s => s.passed).length;
                const avgScore = submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
                    : 0;
                const totalPoints = submissions.reduce((sum, s) => sum + s.score, 0);
                const maxPossiblePoints = submissions.reduce((sum, s) => sum + s.totalPoints, 0);

                return {
                    studentId: student._id.toString(),
                    name: student.name,
                    email: student.email,
                    totalQuizzes,
                    passedQuizzes,
                    failedQuizzes: totalQuizzes - passedQuizzes,
                    averageScore: Math.round(avgScore * 10) / 10,
                    totalPoints,
                    maxPossiblePoints,
                    overallPercentage: maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100 * 10) / 10 : 0,
                    lastActivity: submissions.length > 0 
                        ? submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0].submittedAt
                        : null,
                };
            })
        );

        res.json({
            success: true,
            data: studentReports.sort((a, b) => b.averageScore - a.averageScore),
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Overall Report (Platform-wide statistics)
router.get('/reports/overall', async (req: AuthRequest, res: Response) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalQuizzes = await Quiz.countDocuments();
        const totalSubmissions = await QuizSubmission.countDocuments();
        
        const allSubmissions = await QuizSubmission.find();
        const avgScore = allSubmissions.length > 0
            ? allSubmissions.reduce((sum, s) => sum + s.percentage, 0) / allSubmissions.length
            : 0;
        
        const passedSubmissions = allSubmissions.filter(s => s.passed).length;
        const passRate = allSubmissions.length > 0
            ? (passedSubmissions / allSubmissions.length) * 100
            : 0;

        // Quiz performance breakdown
        const quizStats = await Promise.all(
            (await Quiz.find()).map(async (quiz) => {
                const submissions = await QuizSubmission.find({ quizId: quiz._id });
                const quizAvgScore = submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
                    : 0;
                const quizPassRate = submissions.length > 0
                    ? (submissions.filter(s => s.passed).length / submissions.length) * 100
                    : 0;

                return {
                    quizId: quiz._id.toString(),
                    quizTitle: quiz.title,
                    totalAttempts: submissions.length,
                    averageScore: Math.round(quizAvgScore * 10) / 10,
                    passRate: Math.round(quizPassRate * 10) / 10,
                };
            })
        );

        // Subject/Course breakdown
        const courses = await Course.find();
        const courseStats = await Promise.all(
            courses.map(async (course) => {
                const courseQuizzes = await Quiz.find({ courseId: course._id });
                const courseSubmissions = await QuizSubmission.find({
                    quizId: { $in: courseQuizzes.map(q => q._id) }
                });
                const courseAvgScore = courseSubmissions.length > 0
                    ? courseSubmissions.reduce((sum, s) => sum + s.percentage, 0) / courseSubmissions.length
                    : 0;

                return {
                    courseId: course._id.toString(),
                    courseTitle: course.title,
                    totalQuizzes: courseQuizzes.length,
                    totalAttempts: courseSubmissions.length,
                    averageScore: Math.round(courseAvgScore * 10) / 10,
                };
            })
        );

        res.json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    totalQuizzes,
                    totalSubmissions,
                    averageScore: Math.round(avgScore * 10) / 10,
                    passRate: Math.round(passRate * 10) / 10,
                    passedSubmissions,
                    failedSubmissions: totalSubmissions - passedSubmissions,
                },
                quizPerformance: quizStats,
                coursePerformance: courseStats,
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
