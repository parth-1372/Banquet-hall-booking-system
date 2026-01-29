const express = require('express');
const {
    createBooking,
    getMyBookings,
    getBooking,
    cancelBooking,
    getAllBookings,
    updateBooking,
    confirmBooking,
    getBookingStats,
    checkAvailability,
    admin1Process,
    admin2Process,
    admin3Process,
    updateMyBooking,
    markPaymentComplete
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    validate,
    validateQuery,
    createBookingSchema,
    updateBookingSchema,
    cancelBookingSchema,
    confirmBookingSchema,
    bookingQuerySchema,
    customerUpdateBookingSchema
} = require('../validators/bookingValidator');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Public routes
router.get('/check-availability', checkAvailability);

// Protected routes (all users)
router.use(protect);

// Customer routes - specific routes BEFORE parameterized routes
router.get('/my-bookings', getMyBookings);
router.patch('/my-bookings/:id', validate(customerUpdateBookingSchema), updateMyBooking);
router.post('/', validate(createBookingSchema), createBooking);

// Admin roles defined for convenience
const ALL_ADMINS = [USER_ROLES.ADMIN1, USER_ROLES.ADMIN2, USER_ROLES.ADMIN3, USER_ROLES.SUPER_ADMIN];

// Admin only routes - specific routes BEFORE parameterized routes
router.get(
    '/admin/all',
    authorize(...ALL_ADMINS),
    validateQuery(bookingQuerySchema),
    getAllBookings
);
router.get(
    '/stats/overview',
    authorize(...ALL_ADMINS),
    getBookingStats
);

// Parameterized routes (must come last)
router.get('/:id', getBooking);
router.patch('/:id/cancel', validate(cancelBookingSchema), cancelBooking);
router.patch(
    '/:id',
    authorize(...ALL_ADMINS),
    validate(updateBookingSchema),
    updateBooking
);

// New Approval Workflow Routes
router.patch(
    '/:id/admin1-process',
    authorize(USER_ROLES.ADMIN1, USER_ROLES.SUPER_ADMIN),
    admin1Process
);

router.patch(
    '/:id/admin2-process',
    authorize(USER_ROLES.ADMIN2, USER_ROLES.SUPER_ADMIN),
    admin2Process
);

router.post(
    '/:id/mark-payment',
    authorize(USER_ROLES.ADMIN2, USER_ROLES.SUPER_ADMIN),
    markPaymentComplete
);

router.patch(
    '/:id/admin3-process',
    authorize(USER_ROLES.ADMIN3, USER_ROLES.SUPER_ADMIN),
    admin3Process
);

router.patch(
    '/:id/confirm',
    authorize(...ALL_ADMINS),
    validate(confirmBookingSchema),
    confirmBooking
);

module.exports = router;
