const express = require('express');
const {
    createHall,
    getAllHalls,
    getHall,
    updateHall,
    deleteHall,
    getFeaturedHalls,
    toggleFeatured,
    getHallAvailability,
    getAllHallsAdmin,
    uploadHallImages,
    uploadHall360Image,
} = require('../controllers/hallController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    validate,
    validateQuery,
    createHallSchema,
    updateHallSchema,
    hallQuerySchema,
} = require('../validators/hallValidator');
const { USER_ROLES } = require('../utils/constants');

const reviewRouter = require('./reviewRoutes');
const router = express.Router();

// Nested routes
router.use('/:hallId/reviews', reviewRouter);

// Public routes
router.get('/featured', getFeaturedHalls);
router.get('/', validateQuery(hallQuerySchema), getAllHalls);
router.get('/:id', getHall);
router.get('/:id/availability', getHallAvailability);

// Protected routes (Admin only)
router.use(protect);
const ALL_ADMINS = [USER_ROLES.ADMIN1, USER_ROLES.ADMIN2, USER_ROLES.ADMIN3, USER_ROLES.SUPER_ADMIN];

router.post('/', authorize(...ALL_ADMINS), validate(createHallSchema), createHall);
router.patch('/:id', authorize(...ALL_ADMINS), validate(updateHallSchema), updateHall);
router.delete('/:id', authorize(...ALL_ADMINS), deleteHall);
router.patch('/:id/featured', authorize(...ALL_ADMINS), toggleFeatured);
router.get('/admin/all', authorize(...ALL_ADMINS), getAllHallsAdmin);

// Upload routes
router.post('/:id/images', authorize(...ALL_ADMINS), upload.array('images', 5), uploadHallImages);
router.post('/:id/360-image', authorize(...ALL_ADMINS), upload.single('panorama'), uploadHall360Image);

module.exports = router;
