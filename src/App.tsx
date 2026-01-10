import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection';
import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
import GoogleCallback from './pages/auth/GoogleCallback';
import GoogleSignup from './pages/auth/GoogleSignup';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentQuizzes from './pages/student/Quizzes';
import StudentProfile from './pages/student/Profile';
import StudentReport from './pages/student/Report';

// Quiz Pages
import QuizInterface from './pages/quiz/QuizInterface';
import QuizResults from './pages/quiz/QuizResults';
import QuizDetails from './pages/quiz/QuizDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCourses from './pages/admin/Courses';
import CreateQuiz from './pages/admin/CreateQuiz';
import AdminAnalytics from './pages/admin/Analytics';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/role-selection" element={<RoleSelection />} />
                    <Route path="/student/login" element={<StudentLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/auth/callback" element={<GoogleCallback />} />
                    <Route path="/auth/google/signup" element={<GoogleSignup />} />

                    {/* Student Protected Routes */}
                    <Route
                        path="/student/*"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <Routes>
                                    <Route path="dashboard" element={<StudentDashboard />} />
                                    <Route path="quizzes" element={<StudentQuizzes />} />
                                    <Route path="profile" element={<StudentProfile />} />
                                    <Route path="report" element={<StudentReport />} />
                                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />

                    {/* Quiz Routes (accessible to students) */}
                    <Route
                        path="/quiz/*"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <Routes>
                                    <Route path=":quizId" element={<QuizInterface />} />
                                    <Route path=":quizId/details" element={<QuizDetails />} />
                                    <Route path=":quizId/results" element={<QuizResults />} />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <Routes>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="students" element={<AdminStudents />} />
                                    <Route path="courses" element={<AdminCourses />} />
                                    <Route path="courses/create" element={<CreateQuiz />} />
                                    <Route path="analytics" element={<AdminAnalytics />} />
                                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
