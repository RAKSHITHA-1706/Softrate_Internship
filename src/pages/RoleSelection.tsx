import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection: React.FC = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Student',
            description: 'Access courses, take quizzes, and track your learning progress.',
            icon: 'fas fa-user-graduate',
            color: 'blue',
            path: '/student/login',
        },
        {
            title: 'Administrator',
            description: 'Manage courses, students, and view platform analytics.',
            icon: 'fas fa-user-shield',
            color: 'indigo',
            path: '/admin/login',
        },
    ];

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Skill Builder</h2>
                    <p className="text-gray-600">Please select your role to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roles.map((role) => (
                        <div
                            key={role.title}
                            onClick={() => navigate(role.path)}
                            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 bg-${role.color}-100 rounded-xl flex items-center justify-center text-${role.color}-600 text-2xl mb-6 group-hover:bg-${role.color}-600 group-hover:text-white transition-colors`}>
                                <i className={role.icon}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{role.title}</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {role.description}
                            </p>
                            <button className={`w-full py-3 rounded-lg font-bold border-2 border-${role.color}-600 text-${role.color}-600 group-hover:bg-${role.color}-600 group-hover:text-white transition-colors`}>
                                Select {role.title}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Back to Landing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
