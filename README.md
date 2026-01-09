# KidsLearn - Образовательная Платформа 🚀

Веб-приложение для обучения детей с элементами геймификации. Платформа объединяет учеников, учителей и родителей.

## 🛠 Технологический Стек

- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Security:** JWT, Rate Limiting (slowapi), bcrypt
- **Logging:** Python logging с ротацией
- **Миграции:** Alembic

## ✨ Возможности

### 🎓 Ученик
- Личный кабинет с уровнем и XP
- Выполнение заданий
- Система геймификации

### 🍎 Учитель
- Создание классов
- Выдача заданий с наградами
- Мониторинг прогресса

### 🏠 Родитель
- Привязка ребенка
- Просмотр статистики

## 🔐 Безопасность

- **Rate Limiting:** Защита от brute force и spam
  - /register - 5/minute
  - /token - 10/minute
  - /refresh-token - 20/minute (NEW!)
  - /tasks - 20/minute
  - /classes - 10/minute
- **JWT с Refresh Token** для безопасной аутентификации
- **Логирование** всех действий
- **Обработка ошибок** с правильными статус кодами

## 🚀 Установка

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

# Создать .env файл
echo 'SECRET_KEY=your-secret-key' > .env
echo 'DATABASE_URL=sqlite:///./test.db' >> .env

# Миграции
alembic upgrade head

# Запуск
uvicorn main:app --reload
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs

### Frontend
```bash
cd frontend
npm install

# Создать .env.local
echo 'VITE_API_URL=http://127.0.0.1:8000' > .env.local

# Запуск
npm run dev
```

Приложение: http://localhost:5173

## 📋 Структура

```
backend/
  ├── migrations/       # Alembic миграции
  ├── logs/            # Логи (автоматически)
  ├── main.py          # FastAPI приложение
  ├── auth.py          # JWT & Rate Limiting
  ├── models.py        # БД модели
  ├── schemas.py       # Pydantic схемы
  └── requirements.txt

frontend/
  └── src/
      ├── api/
      │   ├── api.js
      │   └── errorHandler.js  (NEW!)
      ├── components/
      ├── pages/
      └── App.jsx
```

## 🔄 Миграции БД

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "Описание"

# Применить
alembic upgrade head

# Откатить
alembic downgrade -1
```

## 📖 API Endpoints

| Метод | Endpoint | Лимит | Описание |
|-------|----------|-------|----------|
| POST | /register | 5/min | Регистрация |
| POST | /token | 10/min | Вход |
| POST | /refresh-token | 20/min | Обновление токена (NEW!) |
| GET | /users/me | 60/min | Профиль |
| POST | /classes | 10/min | Создать класс |
| POST | /tasks | 20/min | Создать задачу |

## 🔑 Переменные окружения

### Backend (.env)
```
SECRET_KEY=your-secret-key (min 32 chars)
DATABASE_URL=sqlite:///./test.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)
```
VITE_API_URL=http://127.0.0.1:8000
```

## 📊 XP & Уровни

- 100 XP = Повышение на уровень 1
- 200 XP = Повышение на уровень 2
- Переполнение XP сохраняется

## 📝 Логирование

Логи: `backend/logs/app.log`
- Max 10MB с ротацией
- Уровни: DEBUG, INFO, WARNING, ERROR
- Пример: `2026-01-10 02:00:00 - kidslearn - INFO - ✅ Пользователь зарегистрирован`

## 🚨 Rate Limiting

При превышении лимита:
```json
{
  "detail": "Слишком много запросов. Попробуйте позже."
}
```
HTTP 429 Too Many Requests

## 📱 Поддерживаемые браузеры

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Версия:** 2.0 (Rate Limiting + Refresh Token)  
**Статус:** Production-Ready (87%)  
**Дата:** Январь 2026
