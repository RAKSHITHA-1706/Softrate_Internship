import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizSubmission from '../models/QuizSubmission';
import Activity from '../models/Activity';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get Quiz Questions
router.get('/:id/questions', async (req: AuthRequest, res: Response) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Return questions without correct answers for security
        const questions = quiz.questions.map((q, index) => ({
            id: q._id?.toString() || `q${index}`,
            text: q.text,
            type: q.type,
            options: q.options,
            points: q.points,
        }));

        res.json({
            success: true,
            data: {
                id: quiz._id.toString(),
                title: quiz.title,
                description: quiz.description,
                questions,
                durationMinutes: quiz.durationMinutes,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Submit Quiz
router.post('/:id/submit', async (req: AuthRequest, res: Response) => {
    try {
        const { answers } = req.body;
        const quizId = req.params.id;
        const studentId = req.user!.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
            });
        }

        // Calculate score
        let score = 0;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

        console.log('📝 Evaluating quiz answers...');
        console.log('📝 Total questions:', quiz.questions.length);
        console.log('📝 Answers received:', answers.length);
        
        answers.forEach((answer: { questionId: string; answer: string }, answerIndex: number) => {
            // Try multiple ways to find the question
            let question = quiz.questions.find(
                (q) => q._id?.toString() === answer.questionId
            );
            
            // If not found by _id, try by index
            if (!question && answer.questionId.startsWith('q')) {
                const indexMatch = answer.questionId.match(/q(\d+)/);
                if (indexMatch) {
                    const index = parseInt(indexMatch[1]);
                    question = quiz.questions[index];
                }
            }
            
            // If still not found, try by array index
            if (!question && answerIndex < quiz.questions.length) {
                question = quiz.questions[answerIndex];
            }
            
            if (question) {
                let isCorrect = false;
                
                // For MCQ questions
                if (question.type === 'mcq' && question.options && question.options.length > 0) {
                    const correctAnswerValue = question.correctAnswer;
                    
                    // Check if correctAnswer is a letter (A, B, C, D)
                    if (correctAnswerValue && ['A', 'B', 'C', 'D'].includes(correctAnswerValue)) {
                        const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswerValue);
                        if (optionIndex >= 0 && optionIndex < question.options.length) {
                            const correctOptionText = question.options[optionIndex];
                            // Compare both the option text and the letter
                            isCorrect = correctOptionText === answer.answer || 
                                       correctAnswerValue === answer.answer ||
                                       answer.answer === correctOptionText;
                        }
                    } else if (correctAnswerValue) {
                        // CorrectAnswer is the actual option text - compare directly
                        isCorrect = correctAnswerValue.trim() === answer.answer.trim() ||
                                   question.options.some(opt => opt.trim() === answer.answer.trim() && opt.trim() === correctAnswerValue.trim());
                    }
                } else if (question.type === 'aptitude') {
                    // For aptitude questions, compare directly (case-insensitive, trimmed)
                    if (question.correctAnswer && answer.answer) {
                        const correctAnswer = question.correctAnswer.trim().toLowerCase();
                        const studentAnswer = answer.answer.trim().toLowerCase();
                        isCorrect = correctAnswer === studentAnswer;
                    }
                }
                
                console.log(`Question ${answerIndex + 1}: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`, {
                    questionId: answer.questionId,
                    correctAnswer: question.correctAnswer,
                    studentAnswer: answer.answer,
                    isCorrect
                });
                
                if (isCorrect) {
                    score += question.points;
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }
            } else {
                console.warn(`⚠️ Question not found for answer:`, answer);
                incorrectAnswers++;
            }
        });
        
        console.log(`📊 Evaluation complete: ${correctAnswers} correct, ${incorrectAnswers} incorrect, Score: ${score}/${totalPoints}`);

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const passed = percentage >= 60;

        // Save submission to MongoDB quizsubmissions collection
        const submission = new QuizSubmission({
            quizId,
            studentId,
            answers,
            score,
            totalPoints,
            percentage,
            passed,
            correctAnswers,
            incorrectAnswers,
        });
        await submission.save();
        
        console.log(`✅ Quiz submission saved to MongoDB quizsubmissions collection`);
        console.log(`📝 Student: ${studentId}, Quiz: ${quizId}, Score: ${score}/${totalPoints} (${percentage.toFixed(1)}%)`);

        // Create activity
        const activity = new Activity({
            userId: studentId,
            type: 'quiz_completed',
            title: `Completed quiz: ${quiz.title}`,
            details: `Score: ${score}/${totalPoints} (${percentage.toFixed(1)}%)`,
        });
        await activity.save();

        res.json({
            success: true,
            data: {
                quizId: submission.quizId.toString(),
                score: submission.score,
                totalPoints: submission.totalPoints,
                percentage: submission.percentage,
                passed: submission.passed,
                correctAnswers: submission.correctAnswers,
                incorrectAnswers: submission.incorrectAnswers,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// Get Quiz Results
router.get('/:id/results', async (req: AuthRequest, res: Response) => {
    try {
        const quizId = req.params.id;
        const studentId = req.user!.id;

        const quiz = await Quiz.findById(quizId);
        const submission = await QuizSubmission.findOne({ quizId, studentId });

        if (!quiz || !submission) {
            return res.status(404).json({
                success: false,
                message: 'Quiz or submission not found',
            });
        }

        const user = await import('../models/User').then((m) => m.default.findById(studentId));

        // Calculate section breakdown based on actual question types
        const mcqQuestions = quiz.questions.filter(q => q.type === 'mcq');
        const aptitudeQuestions = quiz.questions.filter(q => q.type === 'aptitude');
        
        // Calculate correct/incorrect for each section based on answers
        let mcqCorrect = 0;
        let mcqTotal = mcqQuestions.length;
        let aptitudeCorrect = 0;
        let aptitudeTotal = aptitudeQuestions.length;

        // Analyze answers to determine section-wise performance
        submission.answers.forEach((answer: any) => {
            const question = quiz.questions.find((q, idx) => 
                q._id?.toString() === answer.questionId || 
                idx.toString() === answer.questionId ||
                `q${idx}` === answer.questionId
            );
            
            if (question) {
                // Check if answer is correct
                let isCorrect = false;
                if (question.type === 'mcq' && question.options) {
                    const correctAnswerValue = question.correctAnswer;
                    if (correctAnswerValue && ['A', 'B', 'C', 'D'].includes(correctAnswerValue)) {
                        const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswerValue);
                        if (optionIndex >= 0 && optionIndex < question.options.length) {
                            const correctOptionText = question.options[optionIndex];
                            isCorrect = correctOptionText === answer.answer || correctAnswerValue === answer.answer;
                        }
                    } else {
                        isCorrect = question.correctAnswer === answer.answer;
                    }
                } else if (question.type === 'aptitude') {
                    if (question.correctAnswer && answer.answer) {
                        isCorrect = question.correctAnswer.trim().toLowerCase() === answer.answer.trim().toLowerCase();
                    }
                }
                
                if (question.type === 'mcq') {
                    if (isCorrect) mcqCorrect++;
                } else if (question.type === 'aptitude') {
                    if (isCorrect) aptitudeCorrect++;
                }
            }
        });

        // Build section breakdown based on actual data
        const sectionBreakdown: any[] = [];
        if (mcqTotal > 0) {
            sectionBreakdown.push({
                name: 'MCQ',
                correct: mcqCorrect,
                total: mcqTotal,
                color: 'bg-blue-500',
            });
        }
        if (aptitudeTotal > 0) {
            sectionBreakdown.push({
                name: 'Aptitude',
                correct: aptitudeCorrect,
                total: aptitudeTotal,
                color: 'bg-indigo-500',
            });
        }

        // Generate performance analysis based on actual results
        const strongAreas: string[] = [];
        const toImprove: string[] = [];
        
        if (mcqTotal > 0) {
            const mcqPercentage = (mcqCorrect / mcqTotal) * 100;
            if (mcqPercentage >= 70) {
                strongAreas.push('Multiple Choice Questions');
            } else {
                toImprove.push('Multiple Choice Questions');
            }
        }
        
        if (aptitudeTotal > 0) {
            const aptitudePercentage = (aptitudeCorrect / aptitudeTotal) * 100;
            if (aptitudePercentage >= 70) {
                strongAreas.push('Aptitude & Reasoning');
            } else {
                toImprove.push('Aptitude & Reasoning');
            }
        }

        // Career prediction based on actual score
        let role = 'Junior Developer';
        let salaryRange = '₹4.0 - ₹6.0 LPA';
        let confidence = Math.min(95, Math.max(60, submission.percentage));

        if (submission.percentage >= 80) {
            role = 'Senior Developer';
            salaryRange = '₹8.0 - ₹12.0 LPA';
        } else if (submission.percentage >= 60) {
            role = 'Mid-Level Developer';
            salaryRange = '₹6.0 - ₹8.0 LPA';
        }

        res.json({
            success: true,
            data: {
                quizId: submission.quizId.toString(),
                studentName: user?.name || 'Student',
                score: submission.score,
                totalPoints: submission.totalPoints,
                percentage: submission.percentage,
                passed: submission.passed,
                correctAnswers: submission.correctAnswers,
                incorrectAnswers: submission.incorrectAnswers,
                sectionBreakdown,
                performanceAnalysis: {
                    strongAreas: strongAreas.length > 0 ? strongAreas : ['General Knowledge'],
                    toImprove: toImprove.length > 0 ? toImprove : ['Practice More'],
                },
                careerPrediction: {
                    role,
                    salaryRange,
                    confidence: Math.round(confidence),
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
