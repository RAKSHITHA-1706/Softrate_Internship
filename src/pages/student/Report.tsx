import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layouts/StudentLayout';
import apiService from '../../services/api';

const StudentReport: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            const data = await apiService.getStudentReport();
            setReportData(data);
        } catch (err: any) {
            console.error('Error fetching report:', err);
            alert('Failed to load report. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <StudentLayout>
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6">Skill Assessment Report</h2>
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reportData ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reportData.skills?.map((skill: any, index: number) => (
                                <div key={index} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-2">{skill.name}</h4>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-black text-blue-600">{skill.score}%</span>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                            skill.level === 'Advanced' ? 'bg-green-100 text-green-700' :
                                            skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {skill.level}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${skill.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {reportData.recommendations && reportData.recommendations.length > 0 && (
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <i className="fas fa-lightbulb text-blue-600 mr-2"></i>
                                    Recommendations
                                </h3>
                                <ul className="space-y-2">
                                    {reportData.recommendations.map((rec: string, index: number) => (
                                        <li key={index} className="flex items-start text-gray-700">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <i className="fas fa-chart-bar text-5xl mb-4"></i>
                        <p>No report data available</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentReport;
