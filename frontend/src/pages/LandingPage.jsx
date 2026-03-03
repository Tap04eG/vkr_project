import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Mic, Activity, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#fafafa', color: '#333' }}>
            {/* Minimalist Hero Section */}
            <section
                className="section-padding"
                style={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at top, #f0f9ff 0%, #fafafa 100%)'
                }}
            >
                <div
                    className="container"
                    style={{
                        textAlign: 'center',
                        maxWidth: '800px',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'opacity 0.8s ease, transform 0.8s ease'
                    }}
                >
                    <div className="mb-4" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '500' }}>
                        <Star size={16} fill="currentColor" />
                        <span>Новая образовательная платформа</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '800', lineHeight: '1.1', margin: '1.5rem 0', color: '#111827', letterSpacing: '-0.02em' }}>
                        Учение — это<br />
                        <span style={{ color: 'var(--primary)', background: '-webkit-linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Приключение!
                        </span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: '#6b7280', margin: '0 auto 2.5rem', maxWidth: '600px', lineHeight: '1.6' }}>
                        Элегантный и увлекательный мир для детей. Изучайте буквы, развивайте речь и достигайте новых уровней вместе с учителями.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to="/register"
                            className="btn btn-primary"
                            style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)' }}
                        >
                            Начать Путешествие <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/login"
                            className="btn btn-secondary"
                            style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', backgroundColor: 'white', color: '#111827', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                        >
                            Войти в аккаунт
                        </Link>
                    </div>
                </div>
            </section>

            {/* Consolidated Features Section */}
            <section className="section-padding" style={{ paddingBottom: '6rem' }}>
                <div className="container">
                    <div
                        className="grid-3"
                        style={{
                            gap: '2rem',
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s'
                        }}
                    >
                        {/* Feature 1 */}
                        <div style={cardStyle}>
                            <div style={{ ...iconWrapperStyle, backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
                                <BookOpen size={28} />
                            </div>
                            <h3 style={cardTitleStyle}>Интерактивные Задания</h3>
                            <p style={cardDescStyle}>
                                Увлекательные миссии по чтению и распознаванию речи, разработанные специально для детей 6-8 лет.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div style={cardStyle}>
                            <div style={{ ...iconWrapperStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                                <Activity size={28} />
                            </div>
                            <h3 style={cardTitleStyle}>Прогресс Онлайн</h3>
                            <p style={cardDescStyle}>
                                Подробная аналитика для родителей и учителей. Следите за успехами и зонами роста ребенка в реальном времени.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div style={cardStyle}>
                            <div style={{ ...iconWrapperStyle, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
                                <Mic size={28} />
                            </div>
                            <h3 style={cardTitleStyle}>Голосовой Ввод</h3>
                            <p style={cardDescStyle}>
                                Инновационная система распознавания речи помогает малышам тренировать правильное произношение и дикцию.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Minimalist inline styles for structural elements
const cardStyle = {
    backgroundColor: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '24px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
};

const iconWrapperStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
};

const cardTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.75rem',
};

const cardDescStyle = {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '1rem',
};

export default LandingPage;
