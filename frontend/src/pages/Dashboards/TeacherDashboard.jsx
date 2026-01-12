import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, PlusCircle, Send } from 'lucide-react';
import api from '../../api';
import { formatName } from '../../utils';

const TeacherOverview = () => (
    <div>
        <h1>Обзор Учителя</h1>
        <p>Добро пожаловать в панель управления. Выберите раздел слева.</p>
        <div className="grid-3">
            <div className="card"><h3>Ваши классы</h3><p>Управление группами</p></div>
            <div className="card"><h3>Задания</h3><p>Выдача и проверка</p></div>
        </div>
    </div>
);

const TeacherClasses = ({
    classes, newClassName, setNewClassName, handleCreateClass,
    selectedClassId, setSelectedClassId, handleAddStudent, studentToAdd, setStudentToAdd
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
                                    value={studentToAdd}
                                    onChange={e => setStudentToAdd(e.target.value)}
                                    placeholder="Логин ученика"
                                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                />
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

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            // Updated payload with new fields
            const payload = {
                title: taskTitle,
                description: taskDesc,
                reward_xp: parseInt(taskReward),
                student_ids: targetStudentIds,
                task_type: taskType,
                task_data: JSON.stringify(taskData) // Send as string for now
            };

            await api.post('/tasks/bulk', payload);
            alert('Задание успешно выдано!');
            // Reset
            setStep(1);
            setTaskTitle('');
            setTaskDesc('');
            setTaskType('text');
            setTaskData({});
            setTargetStudentIds([]);
        } catch (err) {
            console.error(err);
            alert('Ошибка выдачи задания');
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
    const TASK_TEMPLATES = [
        {
            title: "Найди букву А",
            desc: "Найди все буквы 'А' в словах: АРБУЗ, ДОМ, АИСТ.",
            reward: 10,
            type: "selection",
            data: {
                gameTitle: "Найди все буквы А",
                items: ["А", "Р", "Б", "У", "З", "Д", "О", "М", "А", "И", "С", "Т"],
                correctItems: ["А", "А"] // Indices or values? Values might be ambiguous if duplicates. 
                // Let's use objects for robustness in future, but simple strings for now.
                // Actually, for "items", let's make them structured: {id:0, val:'A'} 
            }
        },
        {
            title: "Собери слово ДОМ",
            desc: "Расставь буквы в правильном порядке: О, М, Д -> ДОМ.",
            reward: 15,
            type: "ordering",
            data: {
                targetWord: "ДОМ",
                scrambled: ["О", "М", "Д"]
            }
        },
        {
            title: "Азбука: А, Б, В",
            desc: "Расставь буквы по алфавиту: Б, А, В -> А, Б, В.",
            reward: 10,
            type: "ordering",
            data: {
                targetWord: "АБВ",
                scrambled: ["Б", "А", "В"]
            }
        },
        {
            title: "Посчитай звуки",
            desc: "Посчитай, сколько звуков в слове 'Ель' (3 звука).",
            reward: 20,
            type: "input",
            data: {
                question: "Сколько звуков в слове 'Ель'?",
                correctAnswer: "3"
            }
        },
        // Fill-in-blanks example
        {
            title: "Ж_знь и Ш_на",
            desc: "Вставь пропущенные буквы И/Ы.",
            reward: 15,
            type: "fill_blanks",
            data: {
                text: "В лесу кипит ж__знь. Машина проколола ш__ну.",
                blanks: [
                    { index: 0, correct: "и" },
                    { index: 1, correct: "и" }
                ]
                // Simplified for prototype: segment text? 
                // Let's stick to simple "Question" + "Answer" for Input type for now to start safe.
            }
        }
    ];

    const applyTemplate = (t) => {
        setTaskTitle(t.title);
        setTaskDesc(t.desc);
        setTaskReward(t.reward);
        setTaskType(t.type || 'text');
        setTaskData(t.data || {});
    };

    // --- RENDER ---
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

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
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Параметры задания</h2>
                    <div style={{ background: '#fafafa', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', color: '#555' }}>
                        Выбрано учеников: <b>{targetStudentIds.length}</b>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Templates Column */}
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Шаблоны (5-8 лет)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                                {TASK_TEMPLATES.map((t, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => applyTemplate(t)}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s'
                                        }}
                                        className="template-card"
                                    >
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>{t.desc.substring(0, 40)}...</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Column */}
                        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>&larr; Назад</button>
                        <button className="btn btn-primary" onClick={handleAssignTask} style={{ padding: '10px 30px' }}>
                            <Send size={18} style={{ marginRight: '8px' }} />
                            Выдать задание
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

    useEffect(() => {
        fetchClasses();
    }, []);

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

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { name: newClassName });
            alert('Класс создан!');
            setNewClassName('');
            fetchClasses();
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
                student_ids: targetStudentIds
            });
            alert(`Задание отправлено ${targetStudentIds.length} ученикам!`);
            setTaskTitle(''); setTaskDesc(''); setTargetStudentIds([]);
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
                <Route path="/" element={<TeacherOverview />} />
                <Route path="/classes" element={
                    <TeacherClasses
                        classes={classes}
                        newClassName={newClassName} setNewClassName={setNewClassName}
                        handleCreateClass={handleCreateClass}
                        selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId}
                        studentToAdd={studentToAdd} setStudentToAdd={setStudentToAdd}
                        handleAddStudent={handleAddStudent}
                        // Assignment Props passed down
                        taskTitle={taskTitle} setTaskTitle={setTaskTitle}
                        taskDesc={taskDesc} setTaskDesc={setTaskDesc}
                        taskReward={taskReward} setTaskReward={setTaskReward}
                        targetStudentIds={targetStudentIds} setTargetStudentIds={setTargetStudentIds}
                        handleAssignTask={handleAssignTask}
                    />
                } />
                <Route path="/assignments" element={
                    <TeacherAssignments
                        classes={classes}
                        taskTitle={taskTitle} setTaskTitle={setTaskTitle}
                        taskDesc={taskDesc} setTaskDesc={setTaskDesc}
                        taskReward={taskReward} setTaskReward={setTaskReward}
                        targetStudentIds={targetStudentIds} setTargetStudentIds={setTargetStudentIds}
                        handleAssignTask={handleAssignTask}
                    />
                } />
            </Routes>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
