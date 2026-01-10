import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-blue-600 cursor-pointer"
            onClick={() => navigate('/role-selection')}
        >
            <div className="text-center text-white space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl mb-8">
                    <span className="text-blue-600 text-5xl font-bold">SB</span>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">Skill Builder</h1>
                <p className="text-blue-100 text-xl font-medium opacity-80">Empowering your learning journey</p>
                <div className="pt-12">
                    <p className="text-blue-200 animate-pulse">Tap anywhere to begin</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
