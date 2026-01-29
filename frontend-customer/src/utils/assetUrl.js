// API Base URL Detection
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api/v1';
    }
    return 'https://banquet-backend.onrender.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Extract the backend URL (without /api/v1) for assets
export const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');

// Helper to construct asset URLs
export const getAssetUrl = (path) => {
    if (!path) return `${BACKEND_URL}/uploads/hall_main.png`;
    if (path.startsWith('http')) return path; // Already absolute URL
    return `${BACKEND_URL}${path}`;
};

// Default placeholder images
export const DEFAULT_HALL_IMAGE = `${BACKEND_URL}/uploads/hall_main.png`;
export const DEFAULT_360_IMAGE = `${BACKEND_URL}/uploads/hall_360.png`;

// Razorpay Configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_S9TV39vroh2fIB';
