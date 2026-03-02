import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { UserPlus, Users, TrendingUp, Award, Target, BookOpen, X, Star, CheckCircle } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';

const ParentOverview = ({ children, user }) => {
    const navigate = useNavigate();

    // Calculate aggregate stats
    const totalXP = children.reduce((sum, child) => sum + (child.xp || 0), 0);
    const totalCompleted = children.reduce((sum, child) => sum + (child.tasks_completed || 0), 0);
    const avgLevel = children.length > 0 ? Math.round(children.reduce((sum, child) => sum + (child.level || 1), 0) / children.length) : 0;

    return (
        <div>
            {/* WELCOME BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                padding: '2rem 3rem',
                borderRadius: '20px',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>Добро пожаловать, {formatName(user)}! 👋</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Следите за успехами ваших детей</p>
                </div>
                <Award size={180} style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.2 }} />
            </div>

            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0284c7' }}>{children.length}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Детей</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #fcd34d' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#d97706' }}>{totalXP}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Общий XP</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '1px solid #86efac' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#16a34a' }}>{totalCompleted}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Заданий выполнено</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', border: '1px solid #f9a8d4' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#db2777' }}>{avgLevel}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Средний уровень</div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <h3 style={{ marginBottom: '20px' }}>Быстрые действия</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                <div
                    className="card hover-scale"
                    onClick={() => navigate('children')}
                    style={{ cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
                >
                    <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '50%', color: '#0284c7' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>Мои Дети</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Просмотр прогресса и статистики</p>
                    </div>
                </div>

                <div
                    className="card hover-scale"
                    onClick={() => navigate('children')}
                    style={{ cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
                >
                    <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '50%', color: '#16a34a' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>Добавить Ребенка</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Привязать аккаунт ученика</p>
                    </div>
                </div>
            </div>

            {/* CHILDREN PREVIEW */}
            {children.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: '20px' }}>Последние достижения</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {children.slice(0, 3).map(child => (
                            <div key={child.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {child.level}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{formatName(child)}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                            {child.xp} XP • {child.tasks_completed || 0} заданий
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('children')}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 20px' }}
                                >
                                    Подробнее
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {children.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <UserPlus size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
                    <h3>Добавьте первого ребенка</h3>
                    <p>Нажмите "Мои Дети" в меню слева, чтобы привязать аккаунт ученика</p>
                </div>
            )}
        </div>
    );
};

const ParentChildren = ({ children, childUsername, setChildUsername, handleAddChild, fetchChildren, availableStudents = [] }) => {
    const [selectedChild, setSelectedChild] = useState(null);

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Мои Дети 👨‍👩‍👧‍👦</h2>

            {/* ADD CHILD SECTION */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid #7dd3fc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ background: '#0284c7', padding: '10px', borderRadius: '50%', color: 'white' }}>
                        <UserPlus size={20} />
                    </div>
                    <h3 style={{ margin: 0 }}>Добавить Ребенка</h3>
                </div>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
                    Введите логин (username) ребенка, чтобы привязать его аккаунт к вашему профилю.
                </p>
                <form onSubmit={handleAddChild} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        list="student-list"
                        placeholder="Логин ученика (например: ivan123)"
                        value={childUsername}
                        onChange={(e) => setChildUsername(e.target.value)}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid #7dd3fc', fontSize: '1rem' }}
                        required
                    />
                    <datalist id="student-list">
                        {availableStudents.map(s => (
                            <option key={s.id} value={s.username} />
                        ))}
                    </datalist>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1rem' }}>
                        Добавить
                    </button>
                </form>
            </div>

            {/* CHILDREN GRID */}
            {children.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                    <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                    <h3>Дети пока не добавлены</h3>
                    <p>Используйте форму выше, чтобы добавить первого ребенка</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {children.map(child => {
                        const progressToNextLevel = (child.xp % 100);
                        return (
                            <div
                                key={child.id}
                                className="card hover-scale"
                                style={{
                                    cursor: 'pointer',
                                    border: selectedChild?.id === child.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                                    background: selectedChild?.id === child.id ? '#faf5ff' : 'white'
                                }}
                                onClick={() => setSelectedChild(child)}
                            >
                                {/* Header with Avatar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        position: 'relative'
                                    }}>
                                        {child.level}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            background: '#fbbf24',
                                            borderRadius: '50%',
                                            padding: '5px',
                                            border: '2px solid white'
                                        }}>
                                            <Star size={16} color="white" fill="white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3rem' }}>{formatName(child)}</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Уровень {child.level}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{child.xp}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>XP</div>
                                    </div>
                                    <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{child.tasks_completed || 0}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Выполнено</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>
                                        <span>До следующего уровня</span>
                                        <span>{progressToNextLevel}/100 XP</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${progressToNextLevel}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                                            transition: 'width 0.3s'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DETAILED MODAL */}
            {selectedChild && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.2s'
                }} onClick={() => setSelectedChild(null)}>
                    <div style={{
                        background: 'white',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        borderRadius: '20px',
                        overflow: 'auto',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedChild(null)}
                            style={{
                                position: 'sticky',
                                top: '15px',
                                right: '15px',
                                float: 'right',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            <X size={24} color="#666" />
                        </button>

                        <div style={{ padding: '30px' }}>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    margin: '0 auto 15px'
                                }}>
                                    {selectedChild.level}
                                </div>
                                <h2 style={{ margin: '0 0 10px 0' }}>{formatName(selectedChild)}</h2>
                                <p style={{ color: '#666', margin: 0 }}>Уровень {selectedChild.level}</p>
                            </div>

                            {/* Detailed Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bae6fd' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0284c7' }}>{selectedChild.xp}</div>
                                    <div style={{ color: '#666', marginTop: '5px' }}>Всего XP</div>
                                </div>
                                <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #fcd34d' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d97706' }}>{selectedChild.level}</div>
                                    <div style={{ color: '#666', marginTop: '5px' }}>Уровень</div>
                                </div>
                                <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #86efac' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{selectedChild.tasks_completed || 0}</div>
                                    <div style={{ color: '#666', marginTop: '5px' }}>Выполнено</div>
                                </div>
                                <div style={{ background: '#fce7f3', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f9a8d4' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#db2777' }}>{100 - (selectedChild.xp % 100)}</div>
                                    <div style={{ color: '#666', marginTop: '5px' }}>XP до уровня</div>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <TrendingUp size={20} color="#8b5cf6" />
                                    Прогресс к следующему уровню
                                </h3>
                                <div style={{ width: '100%', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                                    <div style={{
                                        width: `${selectedChild.xp % 100}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                                        transition: 'width 0.5s'
                                    }}></div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                                    {selectedChild.xp % 100} / 100 XP ({100 - (selectedChild.xp % 100)} до уровня {selectedChild.level + 1})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [childUsername, setChildUsername] = useState('');
    const [user, setUser] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);

    useEffect(() => {
        fetchUser();
        fetchChildren();
        fetchStudents();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchChildren = async () => {
        try {
            const res = await api.get('/parents/my-children');
            setChildren(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setAvailableStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parents/link-child', { child_username: childUsername });
            alert('Ребенок успешно добавлен! 🎉');
            setChildUsername('');
            fetchChildren();
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка: Пользователь не найден или уже добавлен.');
        }
    };

    return (
        <DashboardLayout role="parent">
            <Routes>
                <Route path="/" element={<ParentOverview children={children} user={user} />} />
                <Route path="/children" element={
                    <ParentChildren
                        children={children}
                        childUsername={childUsername}
                        setChildUsername={setChildUsername}
                        handleAddChild={handleAddChild}
                        fetchChildren={fetchChildren}
                        availableStudents={availableStudents}
                    />
                } />
            </Routes>
        </DashboardLayout>
    );
};

export default ParentDashboard;
