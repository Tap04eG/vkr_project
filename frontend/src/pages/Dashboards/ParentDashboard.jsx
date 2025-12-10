import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { UserPlus, Users } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';

const ParentOverview = () => (
    <div>
        <h1>Кабинет Родителя 🏠</h1>
        <p>Добро пожаловать!</p>
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Статистика</h3>
            <p>Выберите "Дети" в меню слева, чтобы добавить ребенка или посмотреть детали.</p>
        </div>
    </div>
);

const ParentChildren = ({ children, childUsername, setChildUsername, handleAddChild }) => {
    const [selectedChild, setSelectedChild] = useState(null);

    return (
        <div>
            <h2>Мои Дети</h2>
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>

                {/* Add Child Form */}
                <div className="card">
                    <h3><UserPlus size={20} style={{ verticalAlign: 'middle' }} /> Добавить Ребенка</h3>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        Введите логин (username) ребенка, чтобы привязать его к аккаунту.
                    </p>
                    <form onSubmit={handleAddChild} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Логин ученика"
                            value={childUsername}
                            onChange={(e) => setChildUsername(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Добавить</button>
                    </form>
                </div>

                {/* Children List */}
                <div>
                    <h3><Users size={20} style={{ verticalAlign: 'middle' }} /> Список</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {children.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#888' }}>Дети пока не добавлены.</p>
                        ) : (
                            children.map(child => (
                                <div key={child.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedChild?.id === child.id ? '#f0f9ff' : 'white', border: selectedChild?.id === child.id ? '2px solid var(--primary)' : 'none' }}>
                                    <div>
                                        <h4>{formatName(child)}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Уровень: {child.level} | XP: {child.xp}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedChild(selectedChild?.id === child.id ? null : child)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        {selectedChild?.id === child.id ? 'Скрыть' : 'Подробнее'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Stats View */}
            {selectedChild && (
                <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease-in' }}>
                    <h3>📊 Подробности: {formatName(selectedChild)}</h3>
                    <div className="grid-3" style={{ marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedChild.level}</div>
                            <div style={{ color: '#666' }}>Уровень</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{selectedChild.xp}</div>
                            <div style={{ color: '#666' }}>Всего XP</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                            {/* Placeholder for future task stats */}
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{selectedChild.tasks_completed}</div>
                            <div style={{ color: '#666' }}>Выполнено задач</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ParentSettings = () => (
    <div className="container">
        <h2>Настройки</h2>
        <p>Настройки профиля будут здесь.</p>
    </div>
);

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [childUsername, setChildUsername] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await api.get('/parents/my-children');
            setChildren(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parents/link-child', { child_username: childUsername });
            alert('Ребенок добавлен!');
            setChildUsername('');
            fetchChildren();
        } catch (err) {
            alert('Ошибка: Пользователь не найден или уже добавлен.');
        }
    };

    return (
        <DashboardLayout role="parent">
            <Routes>
                <Route path="/" element={<ParentOverview />} />
                <Route path="/children" element={<ParentChildren children={children} childUsername={childUsername} setChildUsername={setChildUsername} handleAddChild={handleAddChild} />} />
                <Route path="/settings" element={<ParentSettings />} />
            </Routes>
        </DashboardLayout>
    );
};

export default ParentDashboard;
