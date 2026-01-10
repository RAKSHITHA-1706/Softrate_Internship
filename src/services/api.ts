import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
    APIResponse,
    AuthResponse,
    LoginCredentials,
    RegisterData,
    StudentDashboardData,
    AdminDashboardStats,
    Course,
    Quiz,
    QuizSubmission,
    QuizResult,
    SkillReport,
    AnalyticsData,
    Activity,
} from '../types';

// API Configuration - MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

class APIService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                // Use the appropriate token based on the route
                let token = null;
                
                if (config.url?.includes('/admin/')) {
                    // Admin routes need admin token
                    token = localStorage.getItem('admin_auth_token');
                    if (!token) {
                        console.warn('⚠️ Admin route but no admin token found');
                    }
                } else if (config.url?.includes('/student/') || config.url?.includes('/quiz/')) {
                    // Student routes need student token
                    token = localStorage.getItem('student_auth_token');
                    if (!token) {
                        console.warn('⚠️ Student route but no student token found');
                    }
                } else {
                    // For other routes (like auth), try both but prioritize based on what exists
                    const adminToken = localStorage.getItem('admin_auth_token');
                    const studentToken = localStorage.getItem('student_auth_token');
                    token = adminToken || studentToken;
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    console.warn('⚠️ No auth token found for request:', config.url);
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Only redirect if not on login pages and not during login attempt
                    const currentPath = window.location.pathname;
                    const isLoginPage = currentPath.includes('/login') || currentPath === '/';
                    const isAuthCallback = currentPath.includes('/auth/callback') || currentPath.includes('/auth/google');
                    const isLoginRequest = error.config?.url?.includes('/auth/student/login') || 
                                         error.config?.url?.includes('/auth/admin/login') ||
                                         error.config?.url?.includes('/auth/google/login') ||
                                         error.config?.url?.includes('/auth/google/signup');
                    
                    // Don't redirect if we're on login page, auth callback, or during login attempt
                    if (!isLoginPage && !isAuthCallback && !isLoginRequest) {
                        // Unauthorized - clear token and redirect to login
                        localStorage.removeItem('student_auth_token');
                        localStorage.removeItem('admin_auth_token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // ========== Authentication APIs ==========

    async studentLogin(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await this.api.post<APIResponse<AuthResponse>>(
                '/auth/student/login',
                credentials
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }
            return response.data.data;
        } catch (error: any) {
            console.error('Student login API error:', error);
            if (error.response) {
                throw error;
            }
            throw new Error(error.message || 'Failed to connect to server');
        }
    }

    async adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await this.api.post<APIResponse<AuthResponse>>(
                '/auth/admin/login',
                credentials
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }
            return response.data.data;
        } catch (error: any) {
            console.error('Admin login API error:', error);
            if (error.response) {
                throw error;
            }
            throw new Error(error.message || 'Failed to connect to server');
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await this.api.post<APIResponse<AuthResponse>>(
            '/auth/register',
            data
        );
        return response.data.data;
    }

    async logout(): Promise<void> {
        await this.api.post('/auth/logout');
    }

    // ========== Student APIs ==========

    async getStudentDashboard(): Promise<StudentDashboardData> {
        const response = await this.api.get<APIResponse<StudentDashboardData>>(
            '/student/dashboard'
        );
        return response.data.data;
    }

    async getStudentCourses(): Promise<Course[]> {
        const response = await this.api.get<APIResponse<Course[]>>(
            '/student/courses'
        );
        return response.data.data;
    }

    async getStudentQuizzes(): Promise<Quiz[]> {
        try {
            const response = await this.api.get<APIResponse<Quiz[]>>(
                '/student/quizzes'
            );
            console.log('📚 API Response:', response.data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            console.warn('⚠️ API returned unsuccessful response:', response.data);
            return [];
        } catch (error: any) {
            console.error('❌ Error in getStudentQuizzes:', error);
            throw error;
        }
    }

    async getStudentProfile() {
        const response = await this.api.get('/student/profile');
        return response.data.data;
    }

    async updateStudentProfile(data: any) {
        const response = await this.api.put('/student/profile', data);
        return response.data.data;
    }

    async getStudentReport(): Promise<SkillReport> {
        const response = await this.api.get<APIResponse<SkillReport>>(
            '/student/report'
        );
        return response.data.data;
    }

    async getStudentActivity(): Promise<Activity[]> {
        const response = await this.api.get<APIResponse<Activity[]>>(
            '/student/activity'
        );
        return response.data.data;
    }

    // ========== Quiz APIs ==========

    async getQuiz(quizId: number | string): Promise<Quiz> {
        const response = await this.api.get<APIResponse<Quiz>>(
            `/quiz/${quizId}/questions`
        );
        return response.data.data;
    }

    async getQuizQuestions(quizId: number | string): Promise<Quiz> {
        const response = await this.api.get<APIResponse<Quiz>>(
            `/quiz/${quizId}/questions`
        );
        return response.data.data;
    }

    async createQuiz(quizData: any): Promise<Quiz> {
        const response = await this.api.post<APIResponse<Quiz>>(
            '/admin/quizzes',
            quizData
        );
        return response.data.data;
    }

    async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
        const response = await this.api.post<APIResponse<QuizResult>>(
            `/quiz/${submission.quizId}/submit`,
            { answers: submission.answers }
        );
        return response.data.data;
    }

    async getQuizResults(quizId: number | string): Promise<QuizResult> {
        const response = await this.api.get<APIResponse<QuizResult>>(
            `/quiz/${quizId}/results`
        );
        return response.data.data;
    }

    // ========== Admin APIs ==========

    async getAdminDashboardStats(): Promise<AdminDashboardStats> {
        const response = await this.api.get<APIResponse<AdminDashboardStats>>(
            '/admin/dashboard/stats'
        );
        return response.data.data;
    }

    async getAdminRecentActivity(): Promise<Activity[]> {
        const response = await this.api.get<APIResponse<Activity[]>>(
            '/admin/activity/recent'
        );
        return response.data.data;
    }

    async getStudents(): Promise<import('../types').User[]> {
        const response = await this.api.get<APIResponse<import('../types').User[]>>('/admin/students');
        return response.data.data;
    }

    async getStudent(studentId: number) {
        const response = await this.api.get(`/admin/students/${studentId}`);
        return response.data.data;
    }

    async getCourses() {
        const response = await this.api.get('/admin/courses');
        return response.data.data;
    }

    async createCourse(courseData: any) {
        const response = await this.api.post('/admin/courses', courseData);
        return response.data.data;
    }

    async updateCourse(courseId: number, courseData: any) {
        const response = await this.api.put(`/admin/courses/${courseId}`, courseData);
        return response.data.data;
    }

    async deleteCourse(courseId: number) {
        const response = await this.api.delete(`/admin/courses/${courseId}`);
        return response.data.data;
    }

    async getAnalytics(): Promise<AnalyticsData> {
        const response = await this.api.get<APIResponse<AnalyticsData>>(
            '/admin/analytics'
        );
        return response.data.data;
    }

    async getAllStudentReports() {
        const response = await this.api.get('/admin/reports/students');
        return response.data.data;
    }

    async getOverallReport() {
        const response = await this.api.get('/admin/reports/overall');
        return response.data.data;
    }

    async getAdminQuizzes() {
        const response = await this.api.get('/admin/quizzes');
        return response.data.data;
    }
}

// Export singleton instance
const apiService = new APIService();
export default apiService;
