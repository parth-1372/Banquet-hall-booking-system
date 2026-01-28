const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    validate,
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.use(protect); // All routes below this require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/update-profile', validate(updateProfileSchema), updateProfile);
router.patch('/change-password', validate(changePasswordSchema), changePassword);

module.exports = router;
