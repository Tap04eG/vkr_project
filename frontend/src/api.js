import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/',
    timeout: 10000,
});

// 1. Интерцептор ЗАПРОСА: подставляем актуальный токен в каждый запрос
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Интерцептор ОТВЕТА: обработка обновления токена при 401 ошибке
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Проверяем, что ошибка 401 и это не повторный запрос (чтобы избежать бесконечного цикла)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Используем axios (не api), чтобы не срабатывали эти же интерцепторы
                    const response = await axios.post(`${api.defaults.baseURL}/refresh-token`, {
                        refresh_token: refreshToken
                    });

                    const newToken = response.data.access_token;
                    localStorage.setItem('token', newToken);

                    // Если сервер возвращает новый refresh токен (опционально, но хорошая практика), обновляем и его
                    if (response.data.refresh_token) {
                        localStorage.setItem('refreshToken', response.data.refresh_token);
                    }

                    // Обновляем заголовок в оригинальном запросе к API
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    // Если Refresh токен тоже закончился — разлогиниваем
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
