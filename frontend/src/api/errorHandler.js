export const handleApiError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 400:
                return `Ошибка валидации: ${error.response.data.detail}`;
            case 401:
                return 'Требуется повторная аутентификация';
            case 403:
                return 'У вас нет прав для этого действия';
            case 404:
                return 'Ресурс не найден';
            case 500:
                return 'Внутренняя ошибка сервера';
            default:
                return error.response.data.detail || 'Неизвестная ошибка';
        }
    } else if (error.request) {
        return 'Ошибка сети: сервер не ответил';
    }
    return 'Ошибка подключения';
};
