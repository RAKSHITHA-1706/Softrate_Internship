import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiService from '../../services/api';

const AdminAnalytics: React.FC = () => {
    const [overallReport, setOverallReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOverallReport();
    }, []);

    const loadOverallReport = async () => {
        try {
            const data = await apiService.getOverallReport();
            setOverallReport(data);
        } catch (err) {
            console.error('Error fetching overall report:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="py-20 flex justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!overallReport) {
        return (
            <AdminLayout>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <p className="text-gray-500">No data available</p>
                </div>
            </AdminLayout>
        );
    }

    const { overview, quizPerformance, coursePerformance } = overallReport;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Overall Platform Report</h1>
                    <p className="text-gray-500">Comprehensive analytics and statistics</p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{overview.totalStudents}</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Total Students</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-3xl font-bold text-indigo-600 mb-2">{overview.totalQuizzes}</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Total Quizzes</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">{overview.totalSubmissions}</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Total Submissions</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{overview.averageScore}%</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Average Score</div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">{overview.passRate}%</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Pass Rate</div>
                        <div className="text-xs text-gray-400 mt-1">
                            {overview.passedSubmissions} passed / {overview.totalSubmissions} total
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">{overview.passedSubmissions}</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Passed</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-2xl font-bold text-red-600 mb-2">{overview.failedSubmissions}</div>
                        <div className="text-sm text-gray-600 font-bold uppercase">Failed</div>
                    </div>
                </div>

                {/* Quiz Performance */}
                {quizPerformance && quizPerformance.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Performance</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Quiz</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Attempts</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Avg Score</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Pass Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {quizPerformance.map((quiz: any) => (
                                        <tr key={quiz.quizId}>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">{quiz.quizTitle}</td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600">{quiz.totalAttempts}</td>
                                            <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">{quiz.averageScore}%</td>
                                            <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{quiz.passRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Course Performance */}
                {coursePerformance && coursePerformance.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course/Subject Performance</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Course/Subject</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Quizzes</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Attempts</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coursePerformance.map((course: any) => (
                                        <tr key={course.courseId}>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">{course.courseTitle}</td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600">{course.totalQuizzes}</td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600">{course.totalAttempts}</td>
                                            <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">{course.averageScore}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
