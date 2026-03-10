import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../api';

const StudentTaskPlayer = ({ task, onComplete }) => {
    const [status, setStatus] = useState('playing'); // playing, correct, incorrect
    const [attempts, setAttempts] = useState(0);
    const [data, setData] = useState({});

    // Game State
    const [selectedItems, setSelectedItems] = useState([]); // For selection
    const [orderedItems, setOrderedItems] = useState({ pool: [], answer: [] }); // For ordering (Pool -> Answer)
    const [inputAnswer, setInputAnswer] = useState(''); // For input
    const [blanks, setBlanks] = useState({}); // For fill_blanks
    const [htmlGameFinished, setHtmlGameFinished] = useState(false); // For html_game iframe callback

    useEffect(() => {
        // Безопасный парсинг данных задачи
        try {
            const parsed = typeof task.task_data === 'string' ? JSON.parse(task.task_data) : task.task_data;
            setData(parsed || {});

            // Инициализация состояния игры
            if (task.task_type === 'ordering') {
                // Determine initial state: usually scrambled. 
                let source = [];
                if (parsed.scrambled) {
                    // Assuming parsed.scrambled is an array of characters, convert to {id, char}
                    source = parsed.scrambled.map((char, i) => ({ id: i, char }));
                } else if (parsed.targetWord) {
                    // Create object with ID to handle duplicate letters correctly!
                    source = parsed.targetWord.split('').sort(() => Math.random() - 0.5)
                        .map((char, i) => ({ id: i, char }));
                }
                setOrderedItems({ pool: source, answer: [] });
            }
        } catch (e) {
            console.error("Error parsing task data", e);
        }
    }, [task]);

    // Слушатель для iframe (html_game)
    useEffect(() => {
        if (task.task_type !== 'html_game') return;
        
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'TASK_COMPLETED') {
                setHtmlGameFinished(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [task.task_type]);

    useEffect(() => {
        if (htmlGameFinished && status === 'playing') {
            checkAnswer();
            setHtmlGameFinished(false); // Reset to avoid multiple calls
        }
    }, [htmlGameFinished, status]);

    // ПОМОЩНИКИ
    const checkAnswer = async () => {
        // HTML Games are self-validating via the iframe.
        // We just need to signal the dashboard to ping the `/complete` endpoint.
        if (task.task_type === 'html_game') {
            setStatus('correct');
            setTimeout(() => {
                onComplete({ correct: false, status: 'completed' }); 
                // correct: false forces StudentDashboard to hit the `/complete` endpoint
                // because it doesn't have the new XP calculated yet. 
            }, 1000);
            return;
        }

        let answerPayload = null;

        // Prepare payload based on type
        switch (task.task_type) {
            case 'selection':
                // Send indices of selected items
                answerPayload = selectedItems;
                break;
            case 'ordering':
                // Send current string? Or list? Server expects string targetWord match.
                // Our Local state 'orderedItems.answer' is list of {id, char}.
                answerPayload = orderedItems.answer.map(o => o.char).join('');
                break;
            case 'input':
            case 'essay':
                answerPayload = inputAnswer;
                break;
            case 'fill_blanks':
                // Server expects { "0": "a", "1": "b" }
                answerPayload = blanks;
                break;
            default:
                answerPayload = {};
        }

        try {
            // Используем api клиент для проверки ответа на сервере
            const response = await api.post(`/tasks/${task.id}/check`, {
                user_answer: answerPayload,
                attempt_count: attempts + 1
            });

            const resData = response.data;

            if (resData.status === 'on_review') {
                // Особый статус для ручной проверки
                setStatus('review_pending');
                setTimeout(() => {
                    onComplete(resData);
                }, 2500);
            } else if (resData.correct) {
                setStatus('correct');
                // Ждем немного перед завершением, чтобы пользователь увидел успех
                setTimeout(() => {
                    onComplete(resData);
                }, 2000);
            } else {
                setStatus('incorrect');
                setAttempts(prev => prev + 1);
                // Показываем сообщение об ошибке
                alert(resData.message || "Неверно, попробуй еще раз!");
                setTimeout(() => setStatus('playing'), 1500);
            }

        } catch (error) {
            console.error("Check error", error);
            alert("Ошибка при проверке задания");
        }
    };

    // ОТРИСОВКА ИНТЕРФЕЙСА (UI RENDERERS)
    const renderSelection = () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
            {data.items?.map((item, idx) => {
                const isSel = selectedItems.includes(idx);
                return (
                    <div
                        key={idx}
                        onClick={() => {
                            if (isSel) setSelectedItems(prev => prev.filter(i => i !== idx));
                            else setSelectedItems(prev => [...prev, idx]);
                        }}
                        style={{
                            width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `2px solid ${isSel ? 'var(--primary)' : '#ddd'}`,
                            borderRadius: '10px', fontSize: '1.5rem', fontWeight: 'bold',
                            background: isSel ? '#e0f7fa' : 'white', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );

    const renderOrdering = () => {
        // Move from Pool -> Answer
        const addToAnswer = (item) => {
            setOrderedItems(prev => ({
                pool: prev.pool.filter(i => i.id !== item.id),
                answer: [...prev.answer, item]
            }));
        };

        // Move from Answer -> Pool
        const returnToPool = (item) => {
            setOrderedItems(prev => ({
                pool: [...prev.pool, item],
                answer: prev.answer.filter(i => i.id !== item.id)
            }));
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%' }}>

                {/* Answer Area (Draft) */}
                <div style={{
                    display: 'flex', gap: '10px', minHeight: '60px',
                    borderBottom: '2px solid var(--primary)', padding: '10px',
                    justifyContent: 'center', width: '80%', flexWrap: 'wrap'
                }}>
                    {orderedItems.answer && orderedItems.answer.length === 0 && (
                        <span style={{ color: '#ccc', fontSize: '1.2rem', alignSelf: 'center' }}>Нажимай на буквы снизу...</span>
                    )}
                    {orderedItems.answer && orderedItems.answer.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => returnToPool(item)}
                            title="Убрать"
                            style={{
                                width: '50px', height: '50px',
                                background: '#e3f2fd', border: '2px solid var(--primary)', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold',
                                cursor: 'pointer', userSelect: 'none', animation: 'popIn 0.2s'
                            }}
                        >
                            {item.char}
                        </div>
                    ))}
                </div>

                {/* Pool Area (Scrambled) */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {orderedItems.pool && orderedItems.pool.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => addToAnswer(item)}
                            title="Добавить"
                            style={{
                                width: '50px', height: '50px',
                                background: 'white', border: '2px dashed #bbb', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', color: '#555', fontWeight: 'bold',
                                cursor: 'pointer', userSelect: 'none', transition: 'transform 0.1s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {item.char}
                        </div>
                    ))}
                </div>

                <style>{`
                    @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
                `}</style>
            </div>
        );
    };

    const renderInput = () => (
        <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{data.question}</p>
            <input
                value={inputAnswer}
                onChange={e => setInputAnswer(e.target.value)}
                style={{ padding: '10px', fontSize: '1.2rem', width: '100px', textAlign: 'center', borderRadius: '8px', border: '2px solid #ddd' }}
                placeholder="?"
            />
        </div>
    );

    const renderFillBlanks = () => {
        // "В лесу кипит ж__знь."
        // We render text, replacing __ with inputs handled by blanks state
        // Very basic splitter: use some unique token or just render provided text structure.
        // For simplicity: data.text has placeholders like "__".
        // Actually, let's just use indices from data.blanks to overlay inputs? 
        // Or simpler: Text is "Part1 __ Part2 __". Split by "__".
        const parts = (data.text || "").split('__');

        return (
            <div style={{ fontSize: '1.2rem', lineHeight: '2rem', marginTop: '20px' }}>
                {parts.map((part, i) => (
                    <span key={i}>
                        {part}
                        {i < parts.length - 1 && (
                            <input
                                value={blanks[i] || ''}
                                onChange={e => setBlanks({ ...blanks, [i]: e.target.value })}
                                style={{
                                    width: '40px', padding: '5px', mx: '5px', textAlign: 'center',
                                    border: 'none', borderBottom: '2px solid var(--primary)',
                                    fontSize: '1.2rem', background: 'transparent', outline: 'none'
                                }}
                                maxLength={1}
                            />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    // ОСНОВНОЙ РЕНДЕР
    return (
        <div style={{ padding: task.task_type === 'html_game' ? '0' : '20px', textAlign: 'center', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header & Attempts */}
            {task.task_type !== 'html_game' && (
                <>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--primary-dark)' }}>{data.gameTitle || "Выполни задание"}</h3>
                    <p style={{ color: '#666' }}>{task.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', margin: '15px 0' }}>
                        {[...Array(Math.min(5, attempts))].map((_, i) => (
                            <X key={i} size={20} color="red" />
                        ))}
                    </div>
                </>
            )}

            {/* Game Area */}
            <div style={{ flexGrow: 1, minHeight: task.task_type === 'html_game' ? '0' : '200px', display: 'flex', flexDirection: 'column', width: '100%' }}>
                {task.task_type === 'selection' && renderSelection()}
                {task.task_type === 'ordering' && renderOrdering()}
                {task.task_type === 'input' && renderInput()}
                {task.task_type === 'essay' && (
                    <div style={{ marginTop: '20px', width: '100%' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{data.question}</p>
                        <textarea
                            value={inputAnswer}
                            onChange={e => setInputAnswer(e.target.value)}
                            style={{
                                padding: '15px',
                                fontSize: '1.1rem',
                                width: '100%',
                                minHeight: '150px',
                                flexGrow: 1,
                                borderRadius: '12px',
                                border: '2px solid #ddd',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Напиши свой ответ здесь..."
                        />
                    </div>
                )}
                {task.task_type === 'fill_blanks' && renderFillBlanks()}
                {task.task_type === 'html_game' && (
                    <div style={{ width: '100%', flexGrow: 1, position: 'relative', overflow: 'hidden', margin: 0, padding: 0 }}>
                        {data.url ? (
                            <iframe 
                                src={data.url} 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '0', background: '#E1F5FE', display: 'block' }}
                                title="interactive-game"
                            />
                        ) : (
                            <div style={{ color: 'red', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Ошибка загрузки: URL игры не указан</div>
                        )}
                    </div>
                )}
                {task.task_type === 'text' && <div style={{ fontSize: '1.2rem' }}>Просто нажми "Сдать", когда закончишь.</div>}
            </div>

            {/* Controls */}
            {task.task_type !== 'html_game' && (
                <div style={{ marginTop: '40px' }}>
                    {status === 'playing' && (
                        <button onClick={checkAnswer} className="btn btn-primary" style={{ padding: '12px 40px', fontSize: '1.2rem', borderRadius: '30px' }}>
                            Проверить ответ
                        </button>
                    )}
                    {status === 'incorrect' && (
                        <div style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2rem', animation: 'shake 0.5s' }}>
                            Попробуй еще раз!
                        </div>
                    )}
                    {status === 'correct' && (
                        <div style={{ color: '#00b894', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Check size={32} /> Молодец!
                        </div>
                    )}
                    {status === 'review_pending' && (
                        <div style={{ color: '#0077b6', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <RefreshCw size={32} className="spin" /> Отправлено учителю!
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } 100% { transform: translateX(0); } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StudentTaskPlayer;
