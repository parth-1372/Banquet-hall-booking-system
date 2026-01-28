const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/banquet_hall_booking',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_this',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Cookie
    COOKIE_EXPIRES_IN: parseInt(process.env.COOKIE_EXPIRES_IN, 10) || 7,

    // Frontend URLs
    FRONTEND_CUSTOMER_URL: process.env.FRONTEND_CUSTOMER_URL || 'http://localhost:3000',
    FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001',

    // Helper to check if in production
    isProduction: () => env.NODE_ENV === 'production',
    isDevelopment: () => env.NODE_ENV === 'development',
};

module.exports = env;
