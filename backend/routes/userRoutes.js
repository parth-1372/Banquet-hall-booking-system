const express = require('express');
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Only Admin2 and SuperAdmin (Admin3) can manage users
router.use(protect);
router.use(authorize(USER_ROLES.ADMIN2, USER_ROLES.ADMIN3, USER_ROLES.SUPER_ADMIN));

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
