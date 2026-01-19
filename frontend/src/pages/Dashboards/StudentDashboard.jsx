import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Trophy, Star, CheckCircle, Clock, X, Zap, Target, BookOpen } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';
import StudentTaskPlayer from '../../components/StudentTaskPlayer';

const StudentOverview = ({ user, tasks, onStartTask }) => {
    // Find first incomplete task
    const nextTask = tasks.find(t => t.status === 'pending');
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    return (
        <div>
            {/* WELCOME BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                color: 'white',
                padding: '2rem 3rem',
                borderRadius: '20px',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#ffffffff' }}>Привет, {formatName(user)}! 👋</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Готов к новым приключениям?</p>
                </div>
                <Trophy size={180} style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.2 }} />
            </div>

            {/* NEXT MISSION CARD */}
            {nextTask ? (
                <div className="card" style={{
                    marginBottom: '2rem',
                    border: '2px solid #818cf8',
                    background: '#eef2ff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '20px'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ background: '#c7d2fe', padding: '8px', borderRadius: '50%', color: '#4338ca' }}>
                                <Target size={24} />
                            </div>
                            <h3 style={{ margin: 0, color: '#3730a3' }}>Твоя следующая миссия</h3>
                        </div>
                        <h2 style={{ margin: '0 0 10px 0' }}>{nextTask.title}</h2>
                        <span style={{ background: '#fff', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', color: '#4338ca', fontWeight: 'bold' }}>
                            Награда: {nextTask.reward_xp} XP
                        </span>
                    </div>
                    <button
                        onClick={() => onStartTask(nextTask)}
                        className="btn btn-primary"
                        style={{ padding: '15px 40px', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
                    >
                        Начать! 🚀
                    </button>
                </div>
            ) : (
                <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '40px' }}>
                    <h3>Все задания выполнены! 🎉</h3>
                    <p>Ты настоящий герой! Отдохни пока учитель готовит новые приключения.</p>
                </div>
            )}

            {/* MINI STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
                <div className="card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#d97706' }}><Star /></div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.xp} XP</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Твой опыт</div>
                    </div>
                </div>
                <div className="card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px', color: '#16a34a' }}><CheckCircle /></div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{completedCount}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Выполнено</div>
                    </div>
                </div>
                <div className="card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '12px', color: '#9333ea' }}><BookOpen /></div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.level} Ур.</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Текущий ранг</div>
                    </div>
                </div>
            </div>

            {/* ENGAGEMENT / TIP */}
            <div className="card" style={{ background: '#fff', borderLeft: '5px solid #10b981' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#059669', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={20} /> Совет дня
                </h4>
                <p style={{ margin: 0, color: '#444' }}>
                    Чем больше заданий ты выполняешь подряд, тем быстрее ты учишься! Старайся заниматься каждый день хотя бы по 10 минут.
                </p>
            </div>
        </div>
    );
};

const StudentTasks = ({ tasks, onStartTask }) => {
    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Мои Задания 📝</h2>
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
                            ) : task.status === 'on_review' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0077b6', fontWeight: 'bold' }}>
                                    <Clock /> На проверке
                                </div>
                            ) : (
                                <button
                                    onClick={() => onStartTask(task)}
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
        </div>
    );
};

const BADGES = [
    { id: 'first_step', icon: '🌱', title: 'Первый шаг', desc: 'Выполни 1 задание', condition: (tasks) => tasks.filter(t => t.status === 'completed').length >= 1 },
    { id: 'scholar', icon: '🎓', title: 'Ученик', desc: 'Выполни 5 заданий', condition: (tasks) => tasks.filter(t => t.status === 'completed').length >= 5 },
    { id: 'expert', icon: '🧠', title: 'Эксперт', desc: 'Выполни 10 заданий', condition: (tasks) => tasks.filter(t => t.status === 'completed').length >= 10 },
    { id: 'writer', icon: '✍️', title: 'Писатель', desc: 'Напиши 1 эссе', condition: (tasks) => tasks.some(t => t.task_type === 'essay' && (t.status === 'completed' || t.status === 'on_review')) },
    { id: 'flash', icon: '⚡', title: 'Спринтер', desc: 'Набери 100 XP', condition: (tasks, user) => user.xp >= 100 },
];

const StudentProgress = ({ user, tasks }) => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const reviewCount = tasks.filter(t => t.status === 'on_review').length;
    const nextLevelXP = 100 - (user.xp % 100);

    const myBadges = BADGES.filter(b => b.condition(tasks, user));

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Мой Прогресс 📈</h2>

            {/* STATS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div className="card" style={{ textAlign: 'center', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#0ea5e9' }}>{user.level}</h3>
                    <p style={{ margin: 0, color: '#666' }}>Уровень</p>
                </div>
                <div className="card" style={{ textAlign: 'center', background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#d97706' }}>{user.xp}</h3>
                    <p style={{ margin: 0, color: '#666' }}>Всего XP</p>
                </div>
                <div className="card" style={{ textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#16a34a' }}>{completedCount}</h3>
                    <p style={{ margin: 0, color: '#666' }}>Заданий готово</p>
                </div>
                <div className="card" style={{ textAlign: 'center', background: '#fdf2f8', border: '1px solid #fbcfe8' }}>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#db2777' }}>{reviewCount}</h3>
                    <p style={{ margin: 0, color: '#666' }}>На проверке</p>
                </div>
            </div>

            {/* LEVEL PROGRESS */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3>Путь к следующему уровню</h3>
                <div style={{ width: '100%', height: '24px', background: '#eee', borderRadius: '12px', marginTop: '15px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${(user.xp % 100)}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80, #22c55e)', transition: 'width 0.5s' }}></div>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                        {user.xp % 100} / 100 XP
                    </span>
                </div>
                <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>Осталось всего {nextLevelXP} XP! Ты сможешь! 🚀</p>
            </div>

            {/* BADGES */}
            <h3 style={{ marginBottom: '15px' }}>Мои Достижения 🏆</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                {BADGES.map(badge => {
                    const isUnlocked = myBadges.includes(badge);
                    return (
                        <div key={badge.id} className="card" style={{
                            opacity: isUnlocked ? 1 : 0.5,
                            filter: isUnlocked ? 'none' : 'grayscale(100%)',
                            textAlign: 'center',
                            border: isUnlocked ? '2px solid #fbbf24' : '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{badge.icon}</div>
                            <h4 style={{ margin: '0 0 5px 0' }}>{badge.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{badge.desc}</p>
                            {!isUnlocked && <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#999' }}>Locked 🔒</div>}
                        </div>
                    );
                })}
            </div>

            {/* RECENT ACTIVITY */}
            <h3 style={{ marginBottom: '15px' }}>История активности 📜</h3>
            <div className="card">
                {tasks.filter(t => t.status === 'completed').length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Пока пусто. Выполни первое задание!</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {tasks
                            .filter(t => t.status === 'completed')
                            .slice(0, 5) // Show last 5
                            .map(task => (
                                <li key={task.id} style={{
                                    padding: '10px 0',
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{task.title}</span>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>Тип: {task.task_type}</div>
                                    </div>
                                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+{task.reward_xp} XP</span>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);

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
            if (resultData && resultData.correct) {
                alert(`Задание выполнено! +${resultData.earned_xp} XP`);
                const newLevel = Math.floor(resultData.new_xp / 100) + 1;
                setUser({ ...user, xp: resultData.new_xp, level: newLevel });

                const newStatus = resultData.status || 'completed';
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            } else {
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
                <Route path="/" element={<StudentOverview user={user} tasks={tasks} onStartTask={setActiveTask} />} />
                <Route path="/tasks" element={<StudentTasks tasks={tasks} onStartTask={setActiveTask} />} />
                <Route path="/progress" element={<StudentProgress user={user} tasks={tasks} />} />
            </Routes>

            {/* GLOBAL PLAYER MODAL */}
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
        </DashboardLayout>
    );
};

export default StudentDashboard;
