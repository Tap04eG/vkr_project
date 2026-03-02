import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboards/StudentDashboard';
import ParentDashboard from './pages/Dashboards/ParentDashboard';
import TeacherDashboard from './pages/Dashboards/TeacherDashboard';

// Placeholder components for dashboards if they don't exist yet
const NotFound = () => <div className="container section-padding"><h2>404 - Page Not Found</h2></div>;

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes (Placeholder for now) */}
                    <Route path="/student/*" element={<StudentDashboard />} />
                    <Route path="/parent/*" element={<ParentDashboard />} />
                    <Route path="/teacher/*" element={<TeacherDashboard />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
