# KidsLearn - Образовательная Платформа 🚀

Веб-приложение для обучения детей с элементами геймификации. Платформа объединяет учеников, учителей и родителей.

## 🛠 Технологический Стек

- **Frontend:** React, Vite, React Router, Axios, Lucide React, CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Security:** JWT, Rate Limiting (slowapi), bcrypt
- **Logging:** Python logging с ротацией
- **Testing:** Pytest

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

## � Установка и Запуск

**ВАЖНО:** Для работы сайта нужно открыть ДВА отдельных окна терминала.

### Терминал 1: Backend (Сервер)

1. Откройте терминал в папке проекта (`g:\vkr_project\`).
2. Перейдите в папку backend и настройте окружение:

```powershell
cd backend
python -m venv .venv
# Активация виртуального окружения (Windows):
.venv\Scripts\activate
# Установка зависимостей:
python -m pip install -r requirements.txt
```

3. Создайте файл `.env`. Можно использовать пример ниже или просто создать файл руками:
```powershell
echo SECRET_KEY=your-secret-key-change-me > .env
echo DATABASE_URL=sqlite:///./kidslearn.db >> .env
```

4. Примените миграции базы данных:
```powershell
alembic upgrade head
```

5. Запустите сервер:
```powershell
python -m uvicorn main:app --reload
```
API будет доступно по адресу: http://127.0.0.1:8000
Документация (Swagger): http://127.0.0.1:8000/docs

### Терминал 2: Frontend (Клиент)

1. Откройте ВТОРОЙ терминал в папке проекта (`g:\vkr_project\`).
2. Перейдите в папку frontend и запустите:

```powershell
cd frontend
npm install
# или npm.cmd install
```

3. Создайте файл `.env.local` (если нужно переопределить API URL):
```powershell
echo VITE_API_URL=http://127.0.0.1:8000 > .env.local
```

4. Запустите клиент:
```powershell
npm run dev
# или npm.cmd run dev
```
Приложение откроется по адресу: http://localhost:5173

## 🧪 Тестирование

Для запуска тестов бэкенда используется `pytest`.

```powershell
cd backend
# Убедитесь, что venv активирован (.venv\Scripts\activate)
pytest
```

## � Безопасность и API

- **Rate Limiting:** Защита от brute force и спама (Login: 10/min, Register: 5/min).
- **JWT:** Используются Access и Refresh токены.

## �📋 Структура Проекта

```
backend/
  ├── migrations/       # Alembic миграции
  ├── logs/             # Логи (автоматически создаются)
  ├── tests/            # Pytest тесты
  ├── main.py           # Точка входа FastAPI
  ├── auth.py           # Логика аутентификации
  ├── models.py         # SQLAlchemy модели
  ├── schemas.py        # Pydantic схемы
  └── requirements.txt

frontend/
  └── src/
      ├── api/          # Конфигурация Axios
      ├── components/   # UI компоненты
      ├── pages/        # Страницы маршрутизации
      └── App.jsx       # Корневой компонент
```

## 🔄 Работа с Базой Данных

```powershell
# Создать новую миграцию (после изменения models.py)
alembic revision --autogenerate -m "Описание изменений"

# Применить изменения
alembic upgrade head

# Откатить последнее изменение
alembic downgrade -1
```

