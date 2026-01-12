import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    // ============================================================================
    // ОБРАБОТКА ВХОДА
    // ============================================================================
    const handleLogin = async (e) => {
        e.preventDefault();

        // OAuth2 на бэкенде ожидает формат x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);

        try {
            // Используем настроенный api клиент для входа
            const response = await api.post('/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data) {
                const { access_token, refresh_token } = response.data;

                // Сохраняем токены в localStorage
                localStorage.setItem('token', access_token);
                if (refresh_token) {
                    localStorage.setItem('refreshToken', refresh_token);
                }

                // Получаем данные текущего пользователя для определения роли
                const userRes = await api.get('/users/me');
                const userData = userRes.data;

                // Перенаправление на страницу в зависимости от роли
                if (userData.role === 'student') navigate('/student');
                else if (userData.role === 'parent') navigate('/parent');
                else if (userData.role === 'teacher') navigate('/teacher');
                else navigate('/');

            }
        } catch (error) {
            console.error("Login error", error);
            const errorMsg = error.response?.data?.detail || "Неверное имя пользователя или пароль";
            alert(`Ошибка входа: ${errorMsg}`);
        }
    };

    return (
        <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center' }}>С Возвращением! 🎈</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Пароль</label>
                        <input
                            type="password"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Войти</button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Впервые здесь? <Link to="/register">Создать Аккаунт</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
