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

## 🚀 Установка и Запуск (Single-Port Deployment)

Проект настроен на работу через единый порт **8000**, где FastAPI раздает как API, так и собранный React-фронтенд.

### Шаг 1: Подготовка Фронтенда (Сборка)

1. Откройте терминал в папке проекта и перейдите в папку `frontend`:
```powershell
cd frontend
npm install
npm run build
```
*(Эта команда соберет фронтенд в папку `frontend/dist`, откуда его будет забирать бэкенд).*

### Шаг 2: Запуск Бэкенда (Сервер)

1. Откройте терминал и перейдите в папку `backend`:
```powershell
cd backend
python -m venv .venv
# Активация виртуального окружения (Windows):
.venv\Scripts\activate
# Установка зависимостей:
python -m pip install -r requirements.txt
```

2. Создайте файл `.env` в папке `backend`:
```env
SECRET_KEY=your-secret-key-change-me
DATABASE_URL=sqlite:///./sql_app.db
ALLOWED_ORIGINS="http://localhost:8000"
```

3. Примените миграции базы данных:
```powershell
alembic upgrade head
```

4. Запустите сервер:
```powershell
uvicorn main:app --reload
```

### 🎉 Готово!
- Сайт доступен по адресу: **http://127.0.0.1:8000**
- Документация API (Swagger): **http://127.0.0.1:8000/docs**

### 🌍 Публикация в интернете (Ngrok)
Поскольку фронтенд и бэкенд работают на одном порту, для доступа из интернета достаточно одной команды в терминале:
```powershell
ngrok http 8000
```
Скопируйте выданную HTTPS-ссылку и делитесь ей!

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

