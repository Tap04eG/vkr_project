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

const TeacherClasses = ({ classes, newClassName, setNewClassName, handleCreateClass, selectedClassId, setSelectedClassId, handleAddStudent, studentToAdd, setStudentToAdd }) => {
    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <div>
            <h2>Мои Классы</h2>
            {/* Create Class */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Создать Класс</h3>
                <form onSubmit={handleCreateClass} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        placeholder="Название (напр. 1 'А')"
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '8px' }}><PlusCircle /></button>
                </form>
            </div>

            <div className="card">
                <h3>Список Групп</h3>
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {classes.map(cls => (
                        <div
                            key={cls.id}
                            onClick={() => setSelectedClassId(cls.id)}
                            style={{
                                padding: '1rem',
                                border: '2px solid',
                                borderColor: selectedClassId === cls.id ? 'var(--primary)' : '#eee',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: selectedClassId === cls.id ? '#f0f9ff' : 'white'
                            }}
                        >
                            <h4>{cls.name}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                {cls.students.length} учеников
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {selectedClass && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3>Ученики: {selectedClass.name}</h3>
                    <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px', marginTop: '1rem', marginBottom: '1rem' }}>
                        <input
                            value={studentToAdd}
                            onChange={e => setStudentToAdd(e.target.value)}
                            placeholder="Добавить по Логину"
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button className="btn btn-secondary">Добавить</button>
                    </form>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedClass.students.map(student => (
                            <div key={student.id} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <strong>{formatName(student)}</strong> (Lvl {student.level})
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const TeacherAssignments = ({ classes, taskTitle, setTaskTitle, taskDesc, setTaskDesc, taskReward, setTaskReward, targetStudentId, setTargetStudentId, handleAssignTask }) => {
    // Flatten students list for easier selection for now, or group by class. Guard against undefined students.
    const allStudents = classes.flatMap(c => (c.students || []).map(s => ({ ...s, className: c.name })));

    return (
        <div>
            <h2>Выдача Заданий</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3>1. Выберите Ученика</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {allStudents.map(student => (
                            <div
                                key={student.id}
                                onClick={() => setTargetStudentId(student.id)}
                                style={{
                                    padding: '10px',
                                    border: '1px solid',
                                    borderColor: targetStudentId === student.id ? 'var(--primary)' : '#eee',
                                    background: targetStudentId === student.id ? '#e0f7fa' : 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <strong>{formatName(student)}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>{student.className}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>2. Создайте Задачу</h3>
                    <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            placeholder="Заголовок"
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <textarea
                            placeholder="Описание"
                            value={taskDesc}
                            onChange={e => setTaskDesc(e.target.value)}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label>Награда (XP):</label>
                            <input
                                type="number"
                                value={taskReward}
                                onChange={e => setTaskReward(e.target.value)}
                                style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button className="btn btn-primary" disabled={!targetStudentId} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            <Send size={18} /> Отправить Задание
                        </button>
                    </form>
                </div>
            </div>
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
    const [targetStudentId, setTargetStudentId] = useState(null);

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
            await api.post(`/classes/${selectedClassId}/add-student/${studentToAdd}`);
            alert('Ученик добавлен!');
            setStudentToAdd('');
            fetchClasses();
        } catch (err) { alert('Ошибка добавления ученика'); }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                title: taskTitle,
                description: taskDesc,
                reward_xp: parseInt(taskReward),
                student_id: parseInt(targetStudentId)
            });
            alert('Задание отправлено!');
            setTaskTitle(''); setTaskDesc(''); setTargetStudentId(null);
        } catch (err) {
            alert('Ошибка назначения');
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
                    />
                } />
                <Route path="/assignments" element={
                    <TeacherAssignments
                        classes={classes}
                        taskTitle={taskTitle} setTaskTitle={setTaskTitle}
                        taskDesc={taskDesc} setTaskDesc={setTaskDesc}
                        taskReward={taskReward} setTaskReward={setTaskReward}
                        targetStudentId={targetStudentId} setTargetStudentId={setTargetStudentId}
                        handleAssignTask={handleAssignTask}
                    />
                } />
            </Routes>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
