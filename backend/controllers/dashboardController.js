const Hall = require('../models/Hall');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/asyncHandler');
const { BOOKING_STATUS } = require('../utils/constants');

/**
 * @desc    Get dashboard overview statistics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalHalls,
        totalUsers,
        totalBookings,
        pendingBookings,
        recentBookings,
        revenueData
    ] = await Promise.all([
        Hall.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
        Booking.find().sort('-createdAt').limit(5).populate('user', 'name').populate('halls', 'name'),
        Booking.aggregate([
            {
                $match: { status: { $ne: 'cancelled' } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$pricing.totalAmount' },
                    totalTax: { $sum: '$pricing.taxes' }
                }
            }
        ])
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            overview: {
                totalHalls,
                totalUsers,
                totalBookings,
                pendingBookings,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
            },
            recentBookings
        }
    });
});

module.exports = {
    getDashboardStats
};
