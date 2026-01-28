const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query),
    ]);

    res.status(200).json({
        status: 'success',
        results: users.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
        data: {
            users,
        },
    });
});

/**
 * @desc    Get single user (Admin)
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin)
 */
const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * @desc    Update user (Admin)
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Admin)
 */
const updateUser = asyncHandler(async (req, res, next) => {
    const { name, role, isActive } = req.body;

    // Role hierarchy enforcement
    if (req.user.role === 'admin2') {
        if (role && !['admin1', 'customer'].includes(role)) {
            return next(new AppError('Operations Admin (L2) can only manage Analysis Admin (L1) and Customers', 403));
        }
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, role, isActive },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
            user,
        },
    });
});

/**
 * @desc    Deactivate user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'User deactivated successfully',
    });
});

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
};
