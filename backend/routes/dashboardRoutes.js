const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN1, USER_ROLES.ADMIN2, USER_ROLES.ADMIN3, USER_ROLES.SUPER_ADMIN));

router.get('/stats', getDashboardStats);

module.exports = router;
