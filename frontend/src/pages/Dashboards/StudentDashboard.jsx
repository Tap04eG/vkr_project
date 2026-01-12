import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Trophy, Star, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';

const StudentOverview = ({ user }) => (
    <div>
        <header style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Привет, {formatName(user)}! 👋</h1>
            <p>Твое приключение продолжается!</p>
        </header>

        <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ffd166 0%, #fffc00 100%)', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '50%' }}>
                        <Star size={32} color="#b38f00" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '2rem' }}>{user.xp} XP</h3>
                        <p style={{ margin: 0 }}>Всего очков</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #4dade8 0%, #2087c0 100%)', border: 'none', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}>
                        <Trophy size={32} color="white" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '2rem' }}>Уровень {user.level}</h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>Мастер знаний</p>
                    </div>
                </div>
            </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
            <h3>Последние новости</h3>
            <p className="card">Сегодня отличный день для обучения!</p>
        </div>
    </div>
);

import StudentTaskPlayer from '../../components/StudentTaskPlayer';

const StudentTasks = ({ tasks, handleComplete }) => {
    const [activeTask, setActiveTask] = useState(null);

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Мои Задания 📝</h2>

            {/* TASK LIST */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.length === 0 ? (
                    <div className="card">Пока нет заданий от учителя. Отдыхай! 🎈</div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: task.status === 'completed' ? 0.7 : 1 }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                    {task.title}
                                </h3>
                                <p style={{ color: 'var(--text-light)' }}>{task.description}</p>
                                <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '4px 12px', background: '#f0fdf6', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                                    Награда: {task.reward_xp} XP
                                </span>
                            </div>

                            {task.status === 'completed' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#00b894', fontWeight: 'bold' }}>
                                    <CheckCircle /> Выполнено
                                </div>
                            ) : (
                                <button
                                    onClick={() => setActiveTask(task)}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', fontSize: '1rem' }}
                                >
                                    Выполнить
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* PLAYER MODAL */}
            {activeTask && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.2s'
                }}>
                    <div style={{
                        background: 'white', width: '90%', maxWidth: '600px',
                        borderRadius: '20px', overflow: 'hidden', position: 'relative',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <button
                            onClick={() => setActiveTask(null)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="#aaa" />
                        </button>

                        <StudentTaskPlayer
                            task={activeTask}
                            onComplete={(score) => {
                                handleComplete(activeTask.id, score);
                                setActiveTask(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentProgress = ({ user }) => (
    <div>
        <h2>Мой Прогресс 📈</h2>
        <div className="card" style={{ marginTop: '1rem' }}>
            <p><strong>Текущий уровень:</strong> {user.level}</p>
            <p><strong>Всего заработано XP:</strong> {user.xp}</p>
            <div style={{ width: '100%', height: '20px', background: '#eee', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${(user.xp % 100)}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }}></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>До следующего уровня: {100 - (user.xp % 100)} XP</p>
        </div>
    </div>
);

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/users/me');
                setUser(userRes.data);
                const tasksRes = await api.get('/tasks/my');
                setTasks(tasksRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleComplete = async (taskId, resultData) => {
        try {
            // Если мы получили данные о результате от плеера (интерактивная задача)
            if (resultData && resultData.correct) {
                alert(`Задание выполнено! +${resultData.earned_xp} XP`);
                // Масштабирование: в будущем проверять levelUp из ответа сервера
                const newLevel = Math.floor(resultData.new_xp / 100) + 1;
                setUser({ ...user, xp: resultData.new_xp, level: newLevel });
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
            } else {
                // Фоллбэк для неинтерактивных задач (если появятся)
                const res = await api.post(`/tasks/${taskId}/complete`);
                alert(`Задание выполнено! +${res.data.new_xp - user.xp} XP`);
                setUser({ ...user, xp: res.data.new_xp, level: res.data.new_level });
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка выполнения задания');
        }
    };

    if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#666' }}>Loading...</div>;

    return (
        <DashboardLayout role="student">
            <Routes>
                <Route path="/" element={<StudentOverview user={user} />} />
                <Route path="/tasks" element={<StudentTasks tasks={tasks} handleComplete={handleComplete} />} />
                <Route path="/progress" element={<StudentProgress user={user} />} />
            </Routes>
        </DashboardLayout>
    );
};

export default StudentDashboard;
