import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
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

                    // Обновляем заголовок в оригинальном запросе и повторяем его
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Если Refresh токен тоже протух — разлогиниваем
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
