import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiService from '../../services/api';

const AdminStudents: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsData, reportsData] = await Promise.all([
                apiService.getStudents(),
                apiService.getAllStudentReports()
            ]);
            setStudents(studentsData);
            setReports(reportsData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStudentReport = (studentId: string) => {
        return reports.find(r => r.studentId === studentId);
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Management & Reports</h1>
                    <p className="text-gray-500">View all students and their performance reports</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Quizzes Taken</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Average Score</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Pass Rate</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {students.map((student) => {
                                    const report = getStudentReport(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {report?.totalQuizzes || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className={`text-sm font-bold ${
                                                    report && report.averageScore >= 70 ? 'text-green-600' :
                                                    report && report.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {report ? `${report.averageScore}%` : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {report && report.totalQuizzes > 0
                                                        ? `${Math.round((report.passedQuizzes / report.totalQuizzes) * 100)}%`
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                                                >
                                                    {selectedStudent === student.id ? 'Hide' : 'View'} Report
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedStudent && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Report</h2>
                        {(() => {
                            const report = reports.find(r => r.studentId === selectedStudent);
                            const student = students.find(s => s.id === selectedStudent);
                            if (!report) {
                                return <p className="text-gray-500">No quiz attempts yet.</p>;
                            }
                            return (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">{report.totalQuizzes}</div>
                                        <div className="text-xs text-gray-600 font-bold uppercase">Total Quizzes</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl">
                                        <div className="text-2xl font-bold text-green-600">{report.passedQuizzes}</div>
                                        <div className="text-xs text-gray-600 font-bold uppercase">Passed</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl">
                                        <div className="text-2xl font-bold text-red-600">{report.failedQuizzes}</div>
                                        <div className="text-xs text-gray-600 font-bold uppercase">Failed</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">{report.averageScore}%</div>
                                        <div className="text-xs text-gray-600 font-bold uppercase">Avg Score</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminStudents;
