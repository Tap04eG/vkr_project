import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, GraduationCap, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import api from '../../api';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        firstName: '',
        lastName: '',
        middleName: '',
        username: '',
        password: ''
    });

    const isStep1Valid = formData.email.includes('@');
    const isStep2Valid = formData.role !== '';
    const isStep3Valid = formData.firstName && formData.lastName && formData.username && formData.password.length >= 6;

    const handleNext = () => {
        if (step === 1 && isStep1Valid) setStep(2);
        else if (step === 2 && isStep2Valid) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                first_name: formData.firstName,
                last_name: formData.lastName,
                middle_name: formData.middleName
            };

            await api.post('/register', payload);
            alert("Регистрация успешна! Теперь войдите.");
            navigate('/login');
        } catch (error) {
            alert(`Ошибка регистрации: ${error.response?.data?.detail || 'Проверьте данные'}`);
        }
    };

    return (
        <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: '#eee', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '0', width: `${((step - 1) / 2) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.3s' }}></div>

                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: step >= s ? 'var(--primary)' : '#eee',
                            color: step >= s ? 'white' : '#999',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, fontWeight: 'bold', fontSize: '0.9rem'
                        }}>
                            {step > s ? <Check size={16} /> : s}
                        </div>
                    ))}
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {step === 1 && "Начнем с Email 📧"}
                    {step === 2 && "Кто вы? 🤔"}
                    {step === 3 && "Представьтесь ✍️"}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* STEP 1: Email */}
                    {step === 1 && (
                        <div className="fade-in">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ваша почта</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                autoFocus
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                            />
                        </div>
                    )}

                    {/* STEP 2: Role */}
                    {step === 2 && (
                        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <RoleCard role="student" current={formData.role} set={r => setFormData({ ...formData, role: r })} icon={<User />} label="Ученик" />
                            <RoleCard role="parent" current={formData.role} set={r => setFormData({ ...formData, role: r })} icon={<Users />} label="Родитель" />
                            <RoleCard role="teacher" current={formData.role} set={r => setFormData({ ...formData, role: r })} icon={<GraduationCap />} label="Учитель" />
                        </div>
                    )}

                    {/* STEP 3: FIO & Password */}
                    {step === 3 && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#666' }}>Фамилия</label>
                                    <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#666' }}>Имя</label>
                                    <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#666' }}>Отчество (не обязательно)</label>
                                <input value={formData.middleName} onChange={e => setFormData({ ...formData, middleName: e.target.value })} style={inputStyle} />
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0.5rem 0' }} />

                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#666' }}>Придумайте Логин</label>
                                <input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#666' }}>Пароль (мин. 6 символов)</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="btn" style={{ background: '#f0f0f0', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ArrowLeft size={18} /> Назад
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                Далее <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button type="submit" disabled={!isStep3Valid} className="btn btn-primary" style={{ width: '100%', maxWidth: '200px' }}>
                                Зарегистрироваться
                            </button>
                        )}
                    </div>

                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Войти</Link>
                </p>
            </div>
        </div>
    );
};

const RoleCard = ({ role, current, set, icon, label }) => (
    <div
        onClick={() => set(role)}
        style={{
            border: current === role ? '2px solid var(--primary)' : '1px solid #ddd',
            background: current === role ? '#f0f9ff' : 'white',
            borderRadius: '12px',
            padding: '1rem 0.5rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            boxShadow: current === role ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
        }}
    >
        <div style={{ color: current === role ? 'var(--primary)' : '#666', marginBottom: '0.5rem' }}>
            {icon}
        </div>
        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</div>
    </div>
);

const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem'
};

export default Register;
