import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    """ Настройка логирования приложения """
    
    # Создать папку logs если её нет
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Создать логгер
    logger = logging.getLogger('kidslearn')
    logger.setLevel(logging.DEBUG)
    
    # Обработчик для файла (с ротацией)
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10485760,  # 10MB
        backupCount=10,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Обработчик для консоли
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Формат
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Добавить обработчики
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Настройка логирования SQLAlchemy explicitly
    sql_logger = logging.getLogger('sqlalchemy.engine')
    sql_logger.setLevel(logging.INFO)
    sql_logger.addHandler(console_handler)
    sql_logger.addHandler(file_handler)
    
    return logger

logger = setup_logging()
