const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');
const env = require('../config/env');
const { BOOKING_STATUS } = require('../utils/constants');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payments/create-order
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    if (booking.user.toString() !== req.user.id) {
        return next(new AppError('Not authorized', 403));
    }

    const options = {
        amount: booking.pricing.totalAmount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${bookingId}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        return next(new AppError('Error creating Razorpay order', 500));
    }
});

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
        return next(new AppError('Payment verification failed', 400));
    }

    // Update booking status
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    booking.paymentStatus = 'paid';
    booking.paymentDetails = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
    };

    // If it was in payment-requested, move to approved-admin2
    if (booking.status === BOOKING_STATUS.PAYMENT_REQUESTED) {
        booking.status = BOOKING_STATUS.APPROVED_ADMIN2;
    }

    await booking.save();

    res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully',
        data: {
            booking,
        },
    });
});
