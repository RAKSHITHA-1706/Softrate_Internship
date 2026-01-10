import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layouts/StudentLayout';
import apiService from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuizResult } from '../../types';

const QuizResults: React.FC = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (quizId) {
            loadResults(quizId);
        }
    }, [quizId]);

    const loadResults = async (id: string) => {
        try {
            const data = await apiService.getQuizResults(id);
            setResult(data);
        } catch (err: any) {
            console.error('Error loading results:', err);
            // Show error message instead of fallback data
            alert(err?.response?.data?.message || 'Failed to load quiz results. Please try again.');
            navigate('/student/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-blue-500';
        return 'text-orange-500';
    };

    const sections = result?.sectionBreakdown || [];

    return (
        <StudentLayout>
            <div className="max-w-2xl mx-auto py-8">
                <div className="flex items-center mb-12">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full mr-4 transition">
                        <i className="fas fa-chevron-left text-gray-600"></i>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 mx-auto">Quiz Results</h1>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="text-center space-y-12">
                        {/* Overall Score Circle */}
                        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="110"
                                    fill="transparent"
                                    stroke="#e5e7eb"
                                    strokeWidth="16"
                                />
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="110"
                                    fill="transparent"
                                    stroke="#2563eb"
                                    strokeWidth="16"
                                    strokeDasharray={2 * Math.PI * 110}
                                    strokeDashoffset={2 * Math.PI * 110 * (1 - (result?.percentage || 82) / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-7xl font-black ${getScoreColor(result?.percentage || 82)}`}>{result?.percentage || 82}%</span>
                                <span className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Overall Score</span>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="px-4">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Great Job, {result?.studentName || 'Alex'}!</h2>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">
                                You've demonstrated strong competence in most areas. Keep it up!
                            </p>
                        </div>

                        {/* Section Breakdown */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8 text-left">
                            <div className="flex items-center mb-8">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-list-ul text-xs font-bold"></i>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Section Breakdown</h3>
                            </div>

                            <div className="space-y-8">
                                {sections.map((section) => (
                                    <div key={section.name}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-gray-700">{section.name}</span>
                                            <span className="text-sm font-bold text-blue-600">{section.correct}/{section.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className={`${section.color} h-full rounded-full transition-all duration-1000`}
                                                style={{ width: `${(section.correct / section.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Analysis */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8 text-left">
                            <div className="flex items-center mb-8">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <i className="far fa-clock text-xs font-bold"></i>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Performance Analysis</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50">
                                    <div className="flex items-center text-green-600 mb-4">
                                        <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Strong Areas</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {(result?.performanceAnalysis?.strongAreas || ['Data Structures', 'Python Syntax']).map(area => (
                                            <li key={area} className="flex items-center text-sm text-gray-600 font-medium">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-3"></span>
                                                {area}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
                                    <div className="flex items-center text-orange-600 mb-4">
                                        <i className="fas fa-star mr-2 text-xs"></i>
                                        <span className="text-xs font-black uppercase tracking-widest">To Improve</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {(result?.performanceAnalysis?.toImprove || ['Time Complexity', 'Dynamic Prog.']).map(area => (
                                            <li key={area} className="flex items-center text-sm text-gray-600 font-medium">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-3"></span>
                                                {area}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* AI Career Prediction */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8 text-left">
                            <div className="flex items-center mb-8">
                                <i className="fas fa-sparkles text-blue-500 mr-2"></i>
                                <h3 className="text-lg font-bold text-gray-800">AI Career Prediction</h3>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <i className="fas fa-briefcase text-8xl text-white"></i>
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[10px] text-blue-100 font-black uppercase tracking-[0.2em] mb-4">Recommended Role</p>
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-3xl font-black text-white leading-tight">
                                            {result?.careerPrediction?.role || 'Junior Backend Dev'}
                                        </h4>
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                                            <i className="fas fa-briefcase"></i>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest">Expected Salary (LPA)</p>
                                        <p className="text-2xl font-black text-white">
                                            {result?.careerPrediction?.salaryRange || '₹6.5 - ₹8.0 LPA'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-blue-100/40 text-[10px] italic font-medium">
                                            * Based on your section performance
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8">
                            <button className="w-full bg-white text-blue-600 border-2 border-blue-600 font-black py-4 rounded-2xl hover:bg-blue-50 transition flex items-center justify-center uppercase tracking-widest text-sm">
                                <i className="fas fa-download mr-3"></i> Download Full Report
                            </button>
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 uppercase tracking-widest text-sm"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default QuizResults;
