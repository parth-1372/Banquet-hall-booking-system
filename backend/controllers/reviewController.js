const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');
const { BOOKING_STATUS } = require('../utils/constants');

/**
 * @desc    Create a new review
 * @route   POST /api/v1/reviews
 * @access  Private (Customer)
 */
const createReview = asyncHandler(async (req, res, next) => {
    const { review, rating, hall, booking: bookingId } = req.body;

    // 1. Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    if (booking.user.toString() !== req.user.id) {
        return next(new AppError('You can only review your own bookings', 403));
    }

    // 2. Check if booking is completed (optional, but usually reviews happen after)
    // For hackathon, we allow pending/confirmed too or just check if it's not cancelled
    if (booking.status === BOOKING_STATUS.CANCELLED) {
        return next(new AppError('Cannot review a cancelled booking', 400));
    }

    // 3. Create review
    const newReview = await Review.create({
        review,
        rating,
        hall,
        booking: bookingId,
        user: req.user.id,
    });

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
});

/**
 * @desc    Get all reviews for a hall
 * @route   GET /api/v1/halls/:hallId/reviews
 * @access  Public
 */
const getHallReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({ hall: req.params.hallId })
        .populate('user', 'name')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

/**
 * @desc    Update review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private (Owner)
 */
const updateReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id) {
        return next(new AppError('You can only update your own reviews', 403));
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            review: updatedReview,
        },
    });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Owner or Admin)
 */
const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to delete this review', 403));
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    createReview,
    getHallReviews,
    updateReview,
    deleteReview,
};
