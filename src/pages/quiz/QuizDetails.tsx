import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layouts/StudentLayout';
import apiService from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import type { Quiz } from '../../types';

const QuizDetails: React.FC = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (quizId) {
            loadQuizDetails(quizId);
        }
    }, [quizId]);

    const loadQuizDetails = async (id: string) => {
        try {
            const data = await apiService.getQuizQuestions(id);
            setQuiz(data);
        } catch (err) {
            console.error('Error loading quiz details:', err);
            setError('Failed to load quiz details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StudentLayout>
            <div className="max-w-5xl mx-auto py-12 px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading assessment details...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Header & Stats */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Assessment Details</h1>
                            <div className="text-7xl font-black text-gray-900 leading-none">25</div>
                            <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                                {quiz?.description || 'Test your knowledge on data structures, recursion, and algorithmic efficiency.'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pb-12 border-b border-gray-100">
                                {[
                                    { label: 'Questions', val: quiz?.questions?.length?.toString() || '0', color: 'text-blue-600' },
                                    { label: 'Duration', val: quiz?.durationMinutes?.toString() || '30', suffix: 'mins', color: 'text-green-600' },
                                    { label: 'Total Points', val: quiz?.questions?.reduce((sum, q) => sum + (q.points || 0), 0).toString() || '0', color: 'text-purple-600' },
                                    { label: 'Type', val: 'Mixed', color: 'text-red-600' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                        <div className={`text-4xl font-black ${stat.color} mb-1`}>{stat.val}</div>
                                        <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-[0.2em] text-center">Structure Breakdown</h2>
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-4">
                                {[
                                    { title: 'Multiple Choice', desc: '10 Questions × 2 marks each', val: '20', icon: 'fa-list-ul', color: 'bg-blue-50 text-blue-500' },
                                    { title: 'Aptitude', desc: '14 Questions × 3.5 marks each', val: '49', icon: 'fa-brain', color: 'bg-green-50 text-green-500' },
                                    { title: 'Programming', desc: '1 Challenge × 30 marks', val: '30', icon: 'fa-code', color: 'bg-purple-50 text-purple-500' },
                                    { title: 'Total Possible Score', desc: 'Sum of all sections', val: '99', icon: 'fa-trophy', color: 'bg-indigo-50 text-indigo-500', isTotal: true },
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center justify-between p-6 rounded-2xl ${item.isTotal ? 'bg-blue-50/50 border border-blue-100' : 'border border-gray-50'}`}>
                                        <div className="flex items-center space-x-6">
                                            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-xl`}>
                                                <i className={`fas ${item.icon}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
                                                <p className="text-sm font-medium text-gray-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-900">{item.val}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marks</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-[0.2em] text-center">Guidelines</h2>
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-4">
                                {[
                                    { title: 'Proctoring Rules', text: 'Screen sharing is strictly prohibited. The test will auto-submit after 3 warnings.', icon: 'fa-video-slash', color: 'bg-red-50 text-red-600', borderColor: 'border-red-100' },
                                    { title: 'Important Notice', text: "There's no internet restriction. Refreshing the page may cause data loss.", icon: 'fa-exclamation-triangle', color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-100' },
                                    { title: 'Time Management', text: 'Timer starts immediately after confirmation. Use your time wisely across sections.', icon: 'fa-clock', color: 'bg-green-50 text-green-600', borderColor: 'border-green-100' },
                                ].map((rule, i) => (
                                    <div key={i} className={`flex items-start p-6 rounded-2xl ${rule.borderColor} border`}>
                                        <div className={`w-10 h-10 ${rule.color} rounded-xl flex items-center justify-center mr-6 shrink-0`}>
                                            <i className={`fas ${rule.icon} text-sm`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{rule.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{rule.text}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-6">
                                    <label className="flex items-start space-x-4 cursor-pointer group">
                                        <div className="relative mt-1">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={agreed}
                                                onChange={() => setAgreed(!agreed)}
                                            />
                                            <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                                <i className="fas fa-check text-white text-[10px] opacity-0 peer-checked:opacity-100"></i>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium leading-relaxed">
                                            I have read and understood all the guidelines. I confirm that I will adhere to the assessment rules and complete the quiz without any malpractice.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full md:w-auto px-12 py-5 bg-white text-gray-500 font-black tracking-widest uppercase rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition"
                            >
                                <i className="fas fa-times mr-3"></i> Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (agreed && quizId) {
                                        navigate(`/quiz/${quizId}`);
                                    }
                                }}
                                disabled={!agreed || loading}
                                className={`w-full md:w-auto px-16 py-5 rounded-2xl font-black tracking-widest uppercase shadow-2xl transition flex items-center justify-center ${agreed && !loading
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200 hover:scale-105 active:scale-95'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <i className="fas fa-play-circle mr-3"></i> {loading ? 'Loading...' : 'Confirm & Start Quiz'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default QuizDetails;
