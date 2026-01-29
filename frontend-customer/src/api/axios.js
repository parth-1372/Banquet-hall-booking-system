import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Auto-detect localhost environment
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api/v1';
    }

    // Fallback to production if none provided (Update with your Render URL)
    return 'https://banquet-backend.onrender.com/api/v1';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

export default api;
