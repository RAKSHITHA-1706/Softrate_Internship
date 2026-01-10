import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface StudentLayoutProps {
    children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Top Navigation Bar */}
            <header className="bg-blue-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-lg">SB</span>
                            </div>
                            <h1 className="text-xl font-bold">Skill Builder</h1>
                        </div>

                        {/* Nav Links + Profile */}
                        <div className="flex items-center space-x-8">
                            <nav className="hidden md:flex space-x-6 text-sm font-medium">
                                <Link to="/student/dashboard" className="opacity-100 hover:opacity-100">
                                    Dashboard
                                </Link>
                                <Link to="/student/quizzes" className="opacity-80 hover:opacity-100">
                                    Quizzes
                                </Link>
                                <Link to="/student/report" className="opacity-80 hover:opacity-100">
                                    Reports
                                </Link>
                                <Link to="/student/profile" className="opacity-80 hover:opacity-100">
                                    Profile
                                </Link>
                            </nav>

                            <div className="flex items-center space-x-4">
                                <button className="relative hover:opacity-80">
                                    <i className="fas fa-bell text-lg"></i>
                                    <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition shadow-sm border border-white/10"
                                    title="Logout"
                                >
                                    <i className="fas fa-sign-out-alt text-sm"></i>
                                    <span className="text-sm font-bold uppercase tracking-wider">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default StudentLayout;
