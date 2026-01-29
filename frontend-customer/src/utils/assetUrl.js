// API Base URL - Use production backend or local fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
