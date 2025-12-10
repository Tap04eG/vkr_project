import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, BookOpen, Star, Activity } from 'lucide-react';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        // Force reload to clear all React states (User, Role, etc) to prevent "Hello Teacher" on Student view
        window.location.href = '/login';
    };

    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: isActive ? 'white' : 'var(--text-main)',
        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.2s',
        marginBottom: '5px'
    });

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            background: 'white',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #f0f0f0',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🚀 KidsLearn</span>
            </div>

            <nav style={{ flex: 1 }}>
                {role === 'student' && (
                    <>
                        <NavLink to="/student" end style={linkStyle}><Home size={20} /> Главная</NavLink>
                        <NavLink to="/student/tasks" style={linkStyle}><BookOpen size={20} /> Задания</NavLink>
                        <NavLink to="/student/progress" style={linkStyle}><Star size={20} /> Прогресс</NavLink>
                    </>
                )}

                {role === 'parent' && (
                    <>
                        <NavLink to="/parent" end style={linkStyle}><Home size={20} /> Обзор</NavLink>
                        <NavLink to="/parent/children" style={linkStyle}><Users size={20} /> Дети</NavLink>
                        <NavLink to="/parent/settings" style={linkStyle}><Activity size={20} /> Настройки</NavLink>
                    </>
                )}

                {role === 'teacher' && (
                    <>
                        <NavLink to="/teacher" end style={linkStyle}><Home size={20} /> Обзор</NavLink>
                        <NavLink to="/teacher/classes" style={linkStyle}><Users size={20} /> Классы</NavLink>
                        <NavLink to="/teacher/assignments" style={linkStyle}><BookOpen size={20} /> Задания</NavLink>
                    </>
                )}
            </nav>

            <button onClick={handleLogout} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: 'var(--danger)',
                borderRadius: '12px',
                cursor: 'pointer',
                marginTop: 'auto'
            }}>
                <LogOut size={20} />
                Выйти
            </button>
        </div>
    );
};

export default Sidebar;
