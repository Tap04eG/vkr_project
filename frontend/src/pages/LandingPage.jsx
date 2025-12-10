import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Mic, Trophy, Activity, MessageCircle, Users } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero section-padding" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)' }}>
                <div className="container grid-3" style={{ alignItems: 'center', gridTemplateColumns: '1.2fr 0.8fr' }}>
                    <div className="hero-content">
                        <h1 className="animate-float">Учение — это Приключение! 🚀</h1>
                        <p style={{ fontSize: '1.2rem', margin: '1.5rem 0', color: 'var(--text-light)' }}>
                            Волшебный мир для детей (6-8 лет) для изучения букв, речи и слов.
                            Родители и учителя помогают в пути.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/register" className="btn btn-primary">Начать Путешествие</Link>
                            <Link to="/login" className="btn btn-secondary">Войти</Link>
                        </div>
                    </div>
                    <div className="hero-image" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '8rem', userSelect: 'none' }} className="animate-float">🎨</div>
                    </div>
                </div>
            </section>

            {/* For Kids Section */}
            <section className="kids-features section-padding">
                <div className="container">
                    <h2 style={{ textAlign: 'center', color: 'var(--primary-dark)' }}>Для Учеников 🦁</h2>
                    <div className="grid-3">
                        <FeatureCard
                            icon={<BookOpen size={40} color="var(--primary)" />}
                            title="Учим Буквы"
                            desc="Веселые упражнения для изучения алфавита и чтения."
                            example="А — Арбуз, Б — Барабан!"
                        />
                        <FeatureCard
                            icon={<Mic size={40} color="var(--danger)" />}
                            title="Речь и Слух"
                            desc="Слушай звуки и учись говорить четко."
                            example="Опиши картинку, которую видишь!"
                        />
                        <FeatureCard
                            icon={<Trophy size={40} color="var(--accent)" />}
                            title="Получай Награды"
                            desc="Выполняй миссии, получай звезды и новые уровни!"
                            example="Миссия выполнена: +50 Звезд 🌟"
                        />
                    </div>
                </div>
            </section>

            {/* For Parents Section */}
            <section className="parents-features section-padding" style={{ backgroundColor: 'white' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center' }}>Для Родителей 🦸‍♂️</h2>
                    <div className="grid-3">
                        <FeatureCard
                            icon={<Activity size={40} color="var(--primary-dark)" />}
                            title="Следите за Прогрессом"
                            desc="Смотрите, как улучшаются навыки вашего ребенка."
                        />
                        <FeatureCard
                            icon={<MessageCircle size={40} color="var(--secondary)" />}
                            title="Будьте на Связи"
                            desc="Получайте уведомления на Email, Telegram или Push."
                        />
                        <FeatureCard
                            icon={<Users size={40} color="var(--danger)" />}
                            title="Чат с Учителем"
                            desc="Прямая связь с учителем для обсуждения обучения."
                        />
                    </div>
                </div>
            </section>

            {/* For Teachers Section */}
            <section className="teachers-features section-padding">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2>Для Учителей 👩‍🏫</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Управляйте классами, назначайте задания и смотрите подробные отчеты.
                    </p>
                    <div className="grid-3">
                        <div className="card">
                            <h3>Назначение Задач</h3>
                            <p>Создавайте упражнения для класса.</p>
                        </div>
                        <div className="card">
                            <h3>Мониторинг</h3>
                            <p>Видите, кому нужна помощь в реальном времени.</p>
                        </div>
                        <div className="card">
                            <h3>Обратная Связь</h3>
                            <p>Отправляйте персональные советы ученикам.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, example }) => (
    <div className="card">
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3>{title}</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: example ? '1rem' : '0' }}>{desc}</p>
        {example && (
            <div style={{ background: 'var(--bg-soft)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{example}"
            </div>
        )}
    </div>
);

export default LandingPage;
