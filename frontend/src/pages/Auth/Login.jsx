import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);

        try {
            const response = await fetch('http://127.0.0.1:8000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);

                // Decode token to get role (simple implementation, ideally verify with /users/me)
                // For now, let's fetch user details
                const userRes = await fetch('http://127.0.0.1:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                const userData = await userRes.json();

                if (userData.role === 'student') navigate('/student');
                else if (userData.role === 'parent') navigate('/parent');
                else if (userData.role === 'teacher') navigate('/teacher');
                else navigate('/');

            } else {
                alert("Ошибка входа: Неверное имя пользователя или пароль");
            }
        } catch (error) {
            console.error("Login error", error);
            alert("Ошибка сети! Сервер недоступен.");
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
