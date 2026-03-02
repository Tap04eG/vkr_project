import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, PlusCircle, Send, CheckCircle } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';
import { TASK_TEMPLATES } from '../../constants/taskTemplates';

import { useNavigate } from 'react-router-dom';

// --- REVIEWS COMPONENT ---
const TeacherReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [bonusXP, setBonusXP] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/teacher/reviews');
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };

    const handleApprove = async () => {
        if (!selectedTask) return;
        try {
            await api.post(`/teacher/tasks/${selectedTask.id}/approve`, {
                bonus_xp: parseInt(bonusXP)
            });
            alert('Задание принято!');
            setSelectedTask(null);
            setBonusXP(0);
            fetchReviews(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Ошибка при сохранении');
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1>Проверка Заданий ✍️</h1>

            {reviews.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Нет заданий, ожидающих проверки. Отличная работа! 🎉
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {reviews.map(task => (
                        <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>{task.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Награда: {task.reward_xp} XP</p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setSelectedTask(task)}
                            >
                                Проверить
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedTask && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '20px',
                        width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h2>Проверка задания</h2>
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                            <strong>Задание:</strong>
                            <p>{selectedTask.description}</p>
                            {/* If we had student name here it would be great, but accessing it requires JOINs or extra field in TaskResponse */}
                        </div>

                        <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #7dd3fc' }}>
                            <strong>Ответ ученика:</strong>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', marginTop: '5px' }}>
                                {selectedTask.student_answer || "Нет ответа"}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Бонус XP (опционально):</label>
                            <input
                                type="number"
                                value={bonusXP}
                                onChange={e => setBonusXP(e.target.value)}
                                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn" style={{ background: '#ccc' }} onClick={() => setSelectedTask(null)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleApprove}>
                                Принять (+{selectedTask.reward_xp + parseInt(bonusXP || 0)} XP)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
const TeacherOverview = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '1000px' }}>
            <h1 style={{ marginBottom: '10px' }}>Обзор Учителя</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>Добро пожаловать в панель управления. Вот краткая сводка.</p>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.classes_count || 0}</div>
                    <div style={{ color: '#888' }}>Активных классов</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>{stats.students_count || 0}</div>
                    <div style={{ color: '#888' }}>Всего учеников</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.tasks_on_review || 0}</div>
                    <div style={{ color: '#888' }}>Заданий на проверке</div>
                </div>
            </div>

            <h3 style={{ marginBottom: '20px' }}>Быстрые действия</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div
                    className="card"
                    onClick={() => navigate('classes')}
                    style={{ cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center', transition: 'transform 0.2s', border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '50%', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>Мои Классы</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Управление учениками и группами</p>
                    </div>
                </div>

                <div
                    className="card"
                    onClick={() => navigate('assignments')}
                    style={{ cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center', transition: 'transform 0.2s', border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <div style={{ background: '#ecfdf5', padding: '15px', borderRadius: '50%', color: '#10b981' }}>
                        <Send size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>Выдать Задание</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Создать новую задачу для класса</p>
                    </div>
                </div>
                <div
                    className="card hover-scale"
                    onClick={() => navigate('/teacher/reviews')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
                >
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '10px' }}>
                        <CheckCircle size={24} color="#d97706" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Проверка заданий</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            {stats.tasks_on_review > 0 ? `Ждут проверки: ${stats.tasks_on_review}` : 'Нет новых заданий'}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

const TeacherClasses = ({
    classes, newClassName, setNewClassName, handleCreateClass,
    selectedClassId, setSelectedClassId, handleAddStudent, studentToAdd, setStudentToAdd, availableStudents = []
}) => {
    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Class List & Creation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                    <h3>Мои Классы</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {classes.map(cls => (
                            <div
                                key={cls.id}
                                onClick={() => setSelectedClassId(cls.id)}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid',
                                    borderColor: selectedClassId === cls.id ? 'var(--primary)' : '#eee',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedClassId === cls.id ? '#f0f9ff' : 'white',
                                    transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{cls.name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#666', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px' }}>
                                    {cls.students.length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>Создать Класс</h3>
                    <form onSubmit={handleCreateClass} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={newClassName}
                            onChange={e => setNewClassName(e.target.value)}
                            placeholder="Название (напр. 1 'А')"
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn btn-secondary" style={{ padding: '8px' }}><PlusCircle size={20} /></button>
                    </form>
                </div>
            </div>

            {/* Right Column: Students View Only */}
            <div>
                {selectedClass ? (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedClass.name}</h2>
                                <p style={{ color: '#666', margin: 0 }}>Список учеников</p>
                            </div>
                            {/* Simple Add Student Form */}
                            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    list="student-list"
                                    value={studentToAdd}
                                    onChange={e => setStudentToAdd(e.target.value)}
                                    placeholder="Логин ученика"
                                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                />
                                <datalist id="student-list">
                                    {availableStudents.map(s => (
                                        <option key={s.id} value={s.username} />
                                    ))}
                                </datalist>
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Добавить</button>
                            </form>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedClass.students.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>В классе пока нет учеников</p>}
                            {[...selectedClass.students]
                                .sort((a, b) => formatName(a).localeCompare(formatName(b)))
                                .map(student => (
                                    <div key={student.id} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{formatName(student)}</strong>
                                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Lvl {student.level}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#888' }}>
                        Выберите класс слева для управления учениками
                    </div>
                )}
            </div>
        </div>
    );
}

const TeacherAssignments = ({ classes = [], taskTitle, setTaskTitle, taskDesc, setTaskDesc, taskReward, setTaskReward, targetStudentIds, setTargetStudentIds }) => {
    // -------------------------------------------------------------------------
    // COMPLETE REWRITE: ROBUST WIZARD
    // -------------------------------------------------------------------------

    // Safety Force-Check
    const safeClasses = Array.isArray(classes) ? classes : [];

    // State
    const [step, setStep] = useState(1);
    const [selectedClassIds, setSelectedClassIds] = useState([]);

    // Derived Data: Students
    // We calculate this safely on every render to avoid complex dependency hooks causing issues
    let availableStudents = [];
    try {
        const selectedClasses = safeClasses.filter(c => selectedClassIds.includes(c.id));
        const flatStudents = selectedClasses.flatMap(c => Array.isArray(c.students) ? c.students : []);

        // Dedup by ID
        const seenIds = new Set();
        availableStudents = flatStudents.filter(s => {
            if (!s || !s.id) return false;
            if (seenIds.has(s.id)) return false;
            seenIds.add(s.id);
            return true;
        });

        // Sort
        availableStudents.sort((a, b) => {
            const nA = formatName(a) || '';
            const nB = formatName(b) || '';
            return nA.localeCompare(nB);
        });

    } catch (err) {
        console.error("Critical Error calculating students:", err);
        availableStudents = [];
    }

    // Toggle Handler
    const toggleClass = (id) => {
        if (selectedClassIds.includes(id)) {
            setSelectedClassIds(prev => prev.filter(cid => cid !== id));
        } else {
            setSelectedClassIds(prev => [...prev, id]);
        }
    };

    const [taskType, setTaskType] = useState('text');
    const [taskData, setTaskData] = useState({});

    // New State for the "cart" of tasks
    const [tasksToAssign, setTasksToAssign] = useState([]);

    const handleAddTaskToCart = (e) => {
        e.preventDefault();

        // Validation
        if (!taskTitle.trim() || !taskDesc.trim()) {
            alert("Пожалуйста, заполните название и описание задания.");
            return;
        }

        const newTask = {
            id: Date.now(), // temporary unique id for the cart
            title: taskTitle,
            description: taskDesc,
            reward_xp: parseInt(taskReward),
            task_type: taskType,
            task_data: JSON.stringify(taskData) // API expects stringified JSON
        };

        setTasksToAssign(prev => [...prev, newTask]);

        // Reset form for the next task
        setTaskTitle('');
        setTaskDesc('');
        setTaskReward(10);
        setTaskType('text');
        setTaskData({});
    };

    const handleRemoveTaskFromCart = (taskId) => {
        setTasksToAssign(prev => prev.filter(t => t.id !== taskId));
    };

    const handleAssignAllTasks = async (e) => {
        e.preventDefault();
        if (tasksToAssign.length === 0) {
            alert("Корзина заданий пуста. Добавьте хотя бы одно задание.");
            return;
        }

        try {
            // New bulk payload: { student_ids: [...], tasks: [...] }
            const payload = {
                student_ids: targetStudentIds,
                tasks: tasksToAssign.map(t => ({
                    title: t.title,
                    description: t.description,
                    reward_xp: t.reward_xp,
                    task_type: t.task_type,
                    task_data: t.task_data
                }))
            };

            await api.post('/tasks/bulk', payload);
            alert(`Успешно выдано ${tasksToAssign.length} заданий!`);
            // Reset wizard
            setStep(1);
            setTasksToAssign([]);
            setTargetStudentIds([]);
        } catch (err) {
            console.error(err);
            alert('Ошибка выдачи заданий');
        }
    };

    const toggleStudent = (id) => {
        if (targetStudentIds.includes(id)) {
            setTargetStudentIds(prev => prev.filter(sid => sid !== id));
        } else {
            setTargetStudentIds(prev => [...prev, id]);
        }
    };

    const toggleAllStudents = () => {
        const allIds = availableStudents.map(s => s.id);
        const isAllSelected = allIds.every(id => targetStudentIds.includes(id));
        if (isAllSelected) setTargetStudentIds([]);
        else setTargetStudentIds(allIds);
    };

    // --- TEMPLATES ---
    // --- TEMPLATES (Imported) ---
    // TASK_TEMPLATES are now imported from constants

    const applyTemplate = (t) => {
        setTaskTitle(t.title);
        setTaskDesc(t.desc);
        setTaskReward(t.reward);
        setTaskType(t.type || 'text');
        setTaskData(t.data || {});
    };

    // --- RENDER ---
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

            {/* Header / Steps  */}
            <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        onClick={() => {
                            // Validation checks for navigation
                            if (s === 1) setStep(1);
                            if (s === 2 && selectedClassIds.length > 0) setStep(2);
                            if (s === 3 && targetStudentIds.length > 0) setStep(3);
                        }}
                        style={{
                            flex: 1,
                            textAlign: 'center',
                            fontWeight: step === s ? 'bold' : 'normal',
                            color: step === s ? 'var(--primary)' : '#aaa',
                            cursor: 'pointer',
                            borderBottom: step === s ? '2px solid var(--primary)' : 'none',
                            marginBottom: '-17px',
                            paddingBottom: '15px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {s === 1 && '1. Классы'}
                        {s === 2 && '2. Ученики'}
                        {s === 3 && '3. Задание'}
                    </div>
                ))}
            </div>

            {/* STEP 1: CLASSES */}
            {step === 1 && (
                <div style={{ animation: 'fadeIn 0.2s' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Кого будем учить?</h2>

                    {safeClasses.length === 0 && <p style={{ color: '#888' }}>Нет доступных классов.</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                        {safeClasses.map(cls => {
                            const isSelected = selectedClassIds.includes(cls.id);
                            return (
                                <div
                                    key={cls.id}
                                    onClick={() => toggleClass(cls.id)}
                                    style={{
                                        border: `2px solid ${isSelected ? 'var(--primary)' : '#eee'}`,
                                        background: isSelected ? '#f0f9ff' : '#fff',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    <div style={{ fontSize: '1.1rem' }}>{cls.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {Array.isArray(cls.students) ? cls.students.length : 0} уч.
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button
                            className="btn btn-primary"
                            disabled={selectedClassIds.length === 0}
                            onClick={() => setStep(2)}
                        >
                            Далее &rarr;
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: STUDENTS */}
            {step === 2 && (
                <div style={{ animation: 'fadeIn 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Список учеников</h2>
                        <button onClick={toggleAllStudents} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                            {targetStudentIds.length === availableStudents.length && availableStudents.length > 0 ? 'Снять все' : 'Выбрать всех'}
                        </button>
                    </div>

                    {availableStudents.length === 0 && <p>В выбранных классах нет учеников.</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                        {availableStudents.map(s => {
                            const isSel = targetStudentIds.includes(s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => toggleStudent(s.id)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: isSel ? 'var(--primary)' : '#eee',
                                        background: isSel ? '#f0f9ff' : '#fff',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '4px', border: '1px solid #ccc',
                                        background: isSel ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {isSel && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <span>{formatName(s)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>&larr; Назад</button>
                        <button className="btn btn-primary" disabled={targetStudentIds.length === 0} onClick={() => setStep(3)}>Далее &rarr;</button>
                    </div>
                </div>
            )}

            {/* STEP 3: FORM */}
            {step === 3 && (
                <div style={{ animation: 'fadeIn 0.2s' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Сформировать пакет заданий</h2>
                    <div style={{ background: '#fafafa', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Выбрано учеников: <b>{targetStudentIds.length}</b></span>
                        <span>В корзине заданий: <b>{tasksToAssign.length}</b></span>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>

                        {/* CART: List of Tasks to Assign */}
                        {tasksToAssign.length > 0 && (
                            <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2e7d32', fontSize: '1rem' }}>Готовы к отправке ({tasksToAssign.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {tasksToAssign.map(taskItem => (
                                        <div key={taskItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                            <div>
                                                <strong>{taskItem.title}</strong>
                                                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{taskItem.task_type}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ fontSize: '0.9rem', color: '#e65100', fontWeight: 'bold' }}>{taskItem.reward_xp} XP</span>
                                                <button onClick={() => handleRemoveTaskFromCart(taskItem.id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '20px' }}>
                            {/* Configuration Column */}
                            <div style={{ flex: 4, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Конфигурация задания</label>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Тип задания</label>
                                        <select
                                            value={taskType}
                                            onChange={e => {
                                                setTaskType(e.target.value);
                                                // Reset data structure on type change to avoid inconsistencies
                                                if (e.target.value === 'text') setTaskData({});
                                                if (e.target.value === 'selection') setTaskData({ gameTitle: '', items: [], correctItems: [] });
                                                if (e.target.value === 'ordering') setTaskData({ targetWord: '', scrambled: [] });
                                                if (e.target.value === 'input') setTaskData({ question: '', correctAnswer: '' });
                                                if (e.target.value === 'essay') setTaskData({ question: '' });
                                                if (e.target.value === 'fill_blanks') setTaskData({ text: '', blanks: [] });
                                            }}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        >
                                            <option value="text">Простое (Чтение)</option>
                                            <option value="input">Простое (Ввод)</option>
                                            <option value="selection">Выбор (Найди буквы)</option>
                                            <option value="ordering">Порядок (Собери слово)</option>
                                            <option value="essay">Эссе (Ручная проверка)</option>
                                            <option value="fill_blanks">Заполнение пропусков</option>
                                        </select>
                                    </div>

                                    {/* Integrated Template Selector */}
                                    {(() => {
                                        const availableTemplates = TASK_TEMPLATES.filter(t => t.type === taskType);
                                        if (availableTemplates.length > 0) {
                                            return (
                                                <div style={{ marginBottom: '15px', padding: '10px', background: '#e0f7fa', borderRadius: '6px' }}>
                                                    <label style={{ fontSize: '0.85rem', color: '#006064', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                                                        Доступные шаблоны
                                                    </label>
                                                    <select
                                                        onChange={e => {
                                                            const idx = e.target.value;
                                                            if (idx !== "") {
                                                                applyTemplate(availableTemplates[idx]);
                                                                // Optional: clear selection after apply or keep it? 
                                                                // Keep it "controlled" is hard if we edit later, but useful for quick pick.
                                                                // Simple approach: reset select to "" after click?
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #0097a7', color: '#006064', cursor: 'pointer' }}
                                                    >
                                                        <option value="">-- Выберите шаблон (необязательно) --</option>
                                                        {availableTemplates.map((t, idx) => (
                                                            <option key={idx} value={idx}>{t.title} - {t.desc}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {/* Dynamic Fields based on Type */}
                                    {taskType === 'selection' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                                                <strong>Как работает:</strong> Ученик должен кликнуть на правильные буквы из списка.
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Заголовок игры</label>
                                                <input
                                                    placeholder="Например: Найди все буквы А"
                                                    value={taskData.gameTitle || ''}
                                                    onChange={e => setTaskData({ ...taskData, gameTitle: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Все буквы на экране</label>
                                                <input
                                                    placeholder="Например: А, Р, Б, У, З, А"
                                                    value={taskData.items ? taskData.items.join(', ') : ''}
                                                    onChange={e => setTaskData({ ...taskData, items: e.target.value.split(',').map(s => s.trim()) })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>Через запятую</div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Правильные буквы</label>
                                                <input
                                                    placeholder="Например: А, А"
                                                    value={taskData.correctItems ? taskData.correctItems.join(', ') : ''}
                                                    onChange={e => setTaskData({ ...taskData, correctItems: e.target.value.split(',').map(s => s.trim()) })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>То, что ученик должен найти (тоже через запятую)</div>
                                            </div>
                                        </div>
                                    )}

                                    {taskType === 'ordering' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                                                <strong>Как работает:</strong> Ученик должен расставить перемешанные буквы, чтобы получилось целевое слово.
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Целевое слово (Ответ)</label>
                                                <input
                                                    placeholder="Например: ДОМ"
                                                    value={taskData.targetWord || ''}
                                                    onChange={e => setTaskData({ ...taskData, targetWord: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Перемешанные буквы</label>
                                                <input
                                                    placeholder="Например: Д, М, О"
                                                    value={taskData.scrambled ? taskData.scrambled.join(', ') : ''}
                                                    onChange={e => setTaskData({ ...taskData, scrambled: e.target.value.split(',').map(s => s.trim()) })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>Буквы, которые увидит ученик (через запятую)</div>
                                            </div>
                                        </div>
                                    )}

                                    {taskType === 'input' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                                                <strong>Как работает:</strong> Ученик видит вопрос и должен ввести точный ответ (авто-проверка).
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Вопрос</label>
                                                <input
                                                    placeholder="Например: Сколько звуков в слове 'Ель'?"
                                                    value={taskData.question || ''}
                                                    onChange={e => setTaskData({ ...taskData, question: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Правильный ответ</label>
                                                <input
                                                    placeholder="Например: 3"
                                                    value={taskData.correctAnswer || ''}
                                                    onChange={e => setTaskData({ ...taskData, correctAnswer: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {taskType === 'essay' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                                                <strong>Как работает:</strong> Ученик пишет развернутый ответ. Проверка выполняется учителем вручную.
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Тема / Вопрос</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Например: Напиши, как ты провел лето..."
                                                    value={taskData.question || ''}
                                                    onChange={e => setTaskData({ ...taskData, question: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {taskType === 'fill_blanks' && (
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: '5px' }}>
                                                Текст с пропусками
                                                <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '10px' }}>
                                                    (слова в скобках [] станут пропусками)
                                                </span>
                                            </label>
                                            <textarea
                                                placeholder="Например: В лесу кипит ж[и]знь."
                                                defaultValue={(() => {
                                                    // Reverse engineer for initial display if data exists
                                                    if (!taskData.text) return '';
                                                    let displayText = taskData.text;
                                                    const sortedBlanks = taskData.blanks ? [...taskData.blanks].sort((a, b) => a.index - b.index) : [];

                                                    // This is tricky to reverse perfectly if we used split('__'), but for fresh input it's fine.
                                                    // Let's just rely on the user clearing it or standard editing.
                                                    // Ideally, we would track the "raw" input separately, but for now let's just use a clean state.
                                                    return '';
                                                })()}
                                                onChange={e => {
                                                    const raw = e.target.value;

                                                    // Parse [word] regex
                                                    const regex = /\[(.*?)\]/g;
                                                    let match;
                                                    const newBlanks = [];
                                                    let newText = raw;
                                                    let count = 0;

                                                    // We need to replace systematically. 
                                                    // Actually, split by regex is easier to reconstruct.
                                                    const parts = raw.split(regex);
                                                    // "A [B] C" -> split -> ["A ", "B", " C"]
                                                    // Every odd index is a match group.

                                                    let constructedText = "";

                                                    for (let i = 0; i < parts.length; i++) {
                                                        if (i % 2 === 1) {
                                                            // This is a blank (captured group)
                                                            newBlanks.push({ index: count, correct: parts[i] });
                                                            constructedText += "__";
                                                            count++;
                                                        } else {
                                                            constructedText += parts[i];
                                                        }
                                                    }

                                                    setTaskData({
                                                        text: constructedText,
                                                        blanks: newBlanks
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'sans-serif' }}
                                            />

                                            {/* Preview of detected blanks */}
                                            {taskData.blanks && taskData.blanks.length > 0 && (
                                                <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                                    <strong>Будет скрыто:</strong>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                                                        {taskData.blanks.map((b, i) => (
                                                            <span key={i} style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px' }}>
                                                                {b.correct}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Column */}
                            <div style={{ flex: 6, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Название</label>
                                    <input
                                        value={taskTitle}
                                        onChange={e => setTaskTitle(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder="Напишите название или выберите шаблон"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Описание</label>
                                    <textarea
                                        value={taskDesc}
                                        onChange={e => setTaskDesc(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '120px' }}
                                        placeholder="Инструкция для ученика..."
                                    />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Награда (XP)</label>
                                    <input
                                        type="number"
                                        value={taskReward}
                                        onChange={e => setTaskReward(e.target.value)}
                                        style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                </div>

                                <button className="btn btn-secondary" onClick={handleAddTaskToCart} style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
                                    + Добавить в пакет
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>&larr; Назад к ученикам</button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAssignAllTasks}
                            style={{ padding: '10px 30px', background: tasksToAssign.length > 0 ? 'var(--primary)' : '#ccc', cursor: tasksToAssign.length > 0 ? 'pointer' : 'not-allowed' }}
                            disabled={tasksToAssign.length === 0}
                        >
                            <Send size={18} style={{ marginRight: '8px' }} />
                            Выдать все задания ({tasksToAssign.length})
                        </button>
                    </div>

                    <style>{`
                        .template-card:hover { background: #f0f9ff !important; border-color: var(--primary) !important; }
                    `}</style>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const TeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [studentToAdd, setStudentToAdd] = useState('');

    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskReward, setTaskReward] = useState(10);
    const [targetStudentIds, setTargetStudentIds] = useState([]);
    const [taskType, setTaskType] = useState('text');
    const [taskData, setTaskData] = useState({});

    const [availableStudents, setAvailableStudents] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchClasses();
        fetchStudents();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/teachers/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/teachers/my-classes');
            setClasses(res.data);
            if (res.data.length > 0 && !selectedClassId) {
                setSelectedClassId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setAvailableStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { name: newClassName });
            alert('Класс создан!');
            setNewClassName('');
            fetchClasses();
            fetchStats();
        } catch (err) { alert('Ошибка создания'); }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            // New secure endpoint: POST /classes/{id}/students with body { child_username: ... }
            await api.post(`/classes/${selectedClassId}/students`, { child_username: studentToAdd });
            alert('Ученик добавлен!');
            setStudentToAdd('');
            fetchClasses();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Ошибка добавления ученика');
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/bulk', {
                title: taskTitle,
                description: taskDesc,
                reward_xp: parseInt(taskReward),
                student_ids: targetStudentIds,
                task_type: taskType, // Ensure task_type is sent
                task_data: JSON.stringify(taskData) // Ensure task_data stringified
            });
            alert(`Задание отправлено ${targetStudentIds.length} ученикам!`);
            setTaskTitle(''); setTaskDesc(''); setTargetStudentIds([]);
            // maybe fetch stats if we count total tasks some day
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;

            let errorMsg = 'Проверьте данные';
            if (Array.isArray(detail)) {
                // Pydantic validation error array
                errorMsg = detail.map(e => {
                    const field = e.loc[e.loc.length - 1];
                    return `${field}: ${e.msg}`;
                }).join('\n');
            } else if (typeof detail === 'string') {
                errorMsg = detail;
            } else if (typeof detail === 'object') {
                errorMsg = JSON.stringify(detail, null, 2);
            }

            alert(`Ошибка назначения:\n${errorMsg}`);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Учительская 🍎</h1>
            </header>
            <Routes>
                <Route index element={<TeacherOverview stats={stats} />} />
                <Route path="classes" element={
                    <TeacherClasses
                        classes={classes}
                        newClassName={newClassName}
                        setNewClassName={setNewClassName}
                        handleCreateClass={handleCreateClass}
                        selectedClassId={selectedClassId}
                        setSelectedClassId={setSelectedClassId}
                        handleAddStudent={handleAddStudent}
                        studentToAdd={studentToAdd}
                        setStudentToAdd={setStudentToAdd}
                        availableStudents={availableStudents}
                    />
                } />
                <Route path="assignments" element={
                    <TeacherAssignments
                        classes={classes}
                        taskTitle={taskTitle} setTaskTitle={setTaskTitle}
                        taskDesc={taskDesc} setTaskDesc={setTaskDesc}
                        taskReward={taskReward} setTaskReward={setTaskReward}
                        targetStudentIds={targetStudentIds} setTargetStudentIds={setTargetStudentIds}
                        handleAssignTask={handleAssignTask}
                    />
                } />
                <Route path="reviews" element={<TeacherReviews />} />
            </Routes>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
