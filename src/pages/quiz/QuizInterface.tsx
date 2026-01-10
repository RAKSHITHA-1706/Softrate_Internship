import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layouts/StudentLayout';
import apiService from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import type { Quiz } from '../../types';

const QuizInterface: React.FC = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (quizId) {
            loadQuiz(quizId);
        }
    }, [quizId]);

    const loadQuiz = async (id: string) => {
        try {
            const data = await apiService.getQuizQuestions(id);
            setQuiz(data);
        } catch (err) {
            console.error('Error loading quiz:', err);
            setError('Failed to load quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz || !quizId) return;
        
        try {
            setLoading(true);
            // Map answers properly - use the question ID from the quiz
            const answers = quiz.questions.map((q, index) => {
                const questionId = q.id?.toString() || q._id?.toString() || `q${index}`;
                const answerKey = q.id?.toString() || q._id?.toString() || `q${index}`;
                return {
                    questionId: questionId,
                    answer: selectedAnswers[answerKey] || ''
                };
            });
            
            console.log('📝 Submitting answers:', answers);

            // Filter out empty answers
            const validAnswers = answers.filter(a => a.answer);

            if (validAnswers.length === 0) {
                setError('Please answer at least one question before submitting.');
                setLoading(false);
                return;
            }

            await apiService.submitQuiz({
                quizId: quizId,
                answers: validAnswers
            });

            navigate(`/quiz/${quizId}/results`);
        } catch (err: any) {
            console.error('Error submitting quiz:', err);
            setError(err?.response?.data?.message || 'Failed to submit quiz. Please try again.');
            setLoading(false);
        }
    };

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    // For UI demo matching image

    return (
        <StudentLayout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center">Preparing Your Quiz...</p>
                        </div>
                    ) : error ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <p className="text-red-600 font-bold mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/student/quizzes')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                Back to Quizzes
                            </button>
                        </div>
                    ) : !quiz || !quiz.questions || quiz.questions.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <p className="text-gray-400 font-bold mb-4">No questions available</p>
                            <button
                                onClick={() => navigate('/student/quizzes')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                Back to Quizzes
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 md:p-12">
                            {/* Question Card Content (matching Image 0) */}
                            <div className="space-y-8">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                                    {currentQuestion?.text || 'Question'}
                                </h2>

                                {/* Options with Outlined Style */}
                                <div className="space-y-4">
                                    {(currentQuestion?.options || []).map((option, idx) => {
                                        const questionId = currentQuestion?.id?.toString() || `q${currentQuestionIndex}`;
                                        const isSelected = selectedAnswers[questionId] === option;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(questionId, option)}
                                                className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center group font-bold ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-white'
                                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 mr-6 flex items-center justify-center transition-all ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-600'
                                                        : 'border-gray-200'
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <span className={`text-lg ${isSelected ? 'text-blue-600' : ''}`}>
                                                    {option}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Mini Navigation (matching Image 0) */}
                                <div className="flex justify-between items-center py-4 text-gray-400 font-bold">
                                    <button 
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                        className="flex items-center hover:text-blue-600 transition tracking-widest uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i> Previous
                                    </button>
                                    <span className="text-xs">
                                        Question {currentQuestionIndex + 1} of {quiz?.questions.length || 0}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={currentQuestionIndex === (quiz?.questions.length || 1) - 1}
                                        className="flex items-center hover:text-blue-600 transition tracking-widest uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>

                                {/* Main Action (matching Image 0) */}
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={Object.keys(selectedAnswers).length === 0}
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

export default QuizInterface;
