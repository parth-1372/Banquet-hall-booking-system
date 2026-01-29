const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');
const { BOOKING_STATUS, PAYMENT_STATUS, TIME_SLOTS } = require('../utils/constants');

/**
 * Calculate booking price
 */
const calculatePrice = (halls, timeSlot, addOns = []) => {
    let basePrice = 0;
    halls.forEach(hall => {
        basePrice += hall.getPriceForSlot(timeSlot);
    });

    const addOnsTotal = (addOns || []).reduce((sum, addon) => sum + (addon.price || 0), 0);
    const subtotal = basePrice + addOnsTotal;

    // Apply 5% combo discount if more than 1 hall is booked
    const discount = halls.length > 1 ? Math.round(subtotal * 0.05) : 0;

    const taxableAmount = subtotal - discount;
    const taxes = Math.round(taxableAmount * 0.18); // 18% GST
    const totalAmount = taxableAmount + taxes;

    return {
        basePrice,
        taxes,
        discount,
        totalAmount,
    };
};

/**
 * @desc    Create a new booking
 * @route   POST /api/v1/bookings
 * @access  Private (Customer)
 */
const createBooking = asyncHandler(async (req, res, next) => {
    const { halls: hallIds, eventDate, timeSlot, guestCount, addOns, ...rest } = req.body;

    if (!hallIds || !Array.isArray(hallIds) || hallIds.length === 0) {
        return next(new AppError('Please select at least one hall', 400));
    }

    // Get halls details
    const halls = await Hall.find({ _id: { $in: hallIds } });
    if (halls.length !== hallIds.length) {
        return next(new AppError('One or more halls not found', 404));
    }

    // Check if all halls are active
    const inactiveHalls = halls.filter(h => !h.isActive);
    if (inactiveHalls.length > 0) {
        return next(new AppError(`${inactiveHalls.map(h => h.name).join(', ')} is not available`, 400));
    }

    // Sum up capacities or check individual? 
    // Usually, multiple halls booked together should accommodate the total guest count.
    const totalMaxCapacity = halls.reduce((sum, h) => sum + h.capacity.maximum, 0);
    const minRequiredCapacity = Math.min(...halls.map(h => h.capacity.minimum));

    if (guestCount > totalMaxCapacity) {
        return next(new AppError(`Guest count exceeds combined capacity of ${totalMaxCapacity}`, 400));
    }

    if (guestCount < minRequiredCapacity) {
        return next(new AppError(`Minimum guest count for selected halls is ${minRequiredCapacity}`, 400));
    }

    // Check slot availability for all halls
    const isAvailable = await Booking.isSlotAvailable(hallIds, eventDate, timeSlot);
    if (!isAvailable) {
        return next(new AppError('One or more halls are already booked for this slot', 400));
    }

    // Calculate pricing
    const pricing = calculatePrice(halls, timeSlot, addOns);

    // Create booking
    const booking = await Booking.create({
        user: req.user.id,
        halls: hallIds,
        eventDate: new Date(eventDate),
        timeSlot,
        guestCount,
        addOns,
        pricing,
        ...rest,
    });

    // Populate halls and user details
    await booking.populate([
        { path: 'halls', select: 'name location contactInfo' },
        { path: 'user', select: 'name email phone' },
    ]);

    res.status(201).json({
        status: 'success',
        message: 'Booking created successfully. Awaiting initial analysis (Admin1).',
        data: {
            booking,
        },
    });
});

/**
 * @desc    Get user's bookings
 * @route   GET /api/v1/bookings/my-bookings
 * @access  Private (Customer)
 */
const getMyBookings = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: req.user.id };
    if (status) {
        query.status = status;
    }

    const [bookings, total] = await Promise.all([
        Booking.find(query)
            .sort({ eventDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('halls', 'name location images primaryImage'),
        Booking.countDocuments(query),
    ]);

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
        data: {
            bookings,
        },
    });
});

/**
 * @desc    Update user's own booking
 * @route   PATCH /api/v1/bookings/my-bookings/:id
 * @access  Private (Customer)
 */
const updateMyBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });

    if (!booking) {
        return next(new AppError('Booking not found or you are not authorized', 404));
    }

    // Only allow editing if the status is action-pending or changes-requested
    if (![BOOKING_STATUS.ACTION_PENDING, BOOKING_STATUS.CHANGE_REQUESTED].includes(booking.status)) {
        return next(new AppError('This booking cannot be edited as it has already been processed', 400));
    }

    const { eventDate, timeSlot, guestCount, addOns, ...rest } = req.body;

    // Check availability if date or slot is changed
    if (eventDate || timeSlot) {
        const checkDate = eventDate ? new Date(eventDate) : booking.eventDate;
        const checkSlot = timeSlot || booking.timeSlot;

        const isAvailable = await Booking.isSlotAvailable(
            booking.halls,
            checkDate,
            checkSlot,
            booking._id
        );

        if (!isAvailable) {
            return next(new AppError('The selected slot is not available for one or more halls', 400));
        }

        if (eventDate) booking.eventDate = checkDate;
        if (timeSlot) booking.timeSlot = checkSlot;
    }

    // Update other fields
    if (guestCount) booking.guestCount = guestCount;
    if (addOns) booking.addOns = addOns;

    // Update rest of the fields (eventType, eventDescription, contactDetails, etc.)
    Object.keys(rest).forEach(key => {
        if (rest[key] !== undefined) {
            booking[key] = rest[key];
        }
    });

    // Recalculate price if halls (implicitly kept same here), slot, or addOns changed
    const halls = await Hall.find({ _id: { $in: booking.halls } });
    booking.pricing = calculatePrice(halls, booking.timeSlot, booking.addOns);

    // Reset status to action-pending if it was change-requested
    if (booking.status === BOOKING_STATUS.CHANGE_REQUESTED) {
        booking.status = BOOKING_STATUS.ACTION_PENDING;
    }

    await booking.save();

    res.status(200).json({
        status: 'success',
        message: 'Booking updated successfully',
        data: {
            booking,
        },
    });
});

/**
 * @desc    Mark payment as complete (Admin2)
 * @route   POST /api/v1/bookings/:id/mark-payment
 * @access  Private (Admin2, SuperAdmin)
 */
const markPaymentComplete = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('halls user');

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    if (booking.status !== BOOKING_STATUS.PAYMENT_REQUESTED) {
        return next(new AppError('Payment not requested for this booking', 400));
    }

    // Mark payment as paid
    booking.paymentStatus = 'paid';
    booking.status = BOOKING_STATUS.APPROVED_ADMIN2;
    await booking.save();

    res.status(200).json({
        status: 'success',
        message: 'Payment marked as complete. Booking forwarded to Admin3 for final approval.',
        data: {
            booking,
        },
    });
});

const getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
        .populate('halls', 'name description location contactInfo images pricing')
        .populate('user', 'name email phone')
        .populate('confirmedBy', 'name email')
        .populate('cancellation.cancelledBy', 'name email');

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (
        booking.user._id.toString() !== req.user.id &&
        req.user.role === 'customer'
    ) {
        return next(new AppError('You are not authorized to view this booking', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    });
});

/**
 * @desc    Cancel booking
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Private (Owner or Admin)
 */
const cancelBooking = asyncHandler(async (req, res, next) => {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (
        booking.user.toString() !== req.user.id &&
        req.user.role === 'customer'
    ) {
        return next(new AppError('You are not authorized to cancel this booking', 403));
    }

    // Check if booking can be cancelled
    if (booking.status === BOOKING_STATUS.CANCELLED) {
        return next(new AppError('Booking is already cancelled', 400));
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
        return next(new AppError('Cannot cancel a completed booking', 400));
    }

    // Cancel the booking
    await booking.cancel(req.user.id, reason);

    await booking.populate([
        { path: 'halls', select: 'name' },
        { path: 'cancellation.cancelledBy', select: 'name email' },
    ]);

    res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully',
        data: {
            booking,
            refundAmount: booking.cancellation.refundAmount,
        },
    });
});

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/v1/bookings
 * @access  Private (Admin)
 */
const getAllBookings = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        status,
        hall,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (hall) query.halls = hall;

    if (startDate || endDate) {
        query.eventDate = {};
        if (startDate) query.eventDate.$gte = new Date(startDate);
        if (endDate) query.eventDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
        Booking.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('halls', 'name location')
            .populate('user', 'name email phone'),
        Booking.countDocuments(query),
    ]);

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
        data: {
            bookings,
        },
    });
});

/**
 * @desc    Update booking (Admin)
 * @route   PATCH /api/v1/bookings/:id
 * @access  Private (Admin)
 */
const updateBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    // If changing date/slot, check availability
    if (req.body.eventDate || req.body.timeSlot) {
        const newDate = req.body.eventDate || booking.eventDate;
        const newSlot = req.body.timeSlot || booking.timeSlot;

        const isAvailable = await Booking.isSlotAvailable(
            booking.halls,
            newDate,
            newSlot,
            booking._id
        );

        if (!isAvailable) {
            return next(new AppError('The new slot is not available', 400));
        }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate([
        { path: 'halls', select: 'name location' },
        { path: 'user', select: 'name email phone' },
    ]);

    res.status(200).json({
        status: 'success',
        message: 'Booking updated successfully',
        data: {
            booking: updatedBooking,
        },
    });
});

/**
 * @desc    Confirm booking (Admin)
 * @route   PATCH /api/v1/bookings/:id/confirm
 * @access  Private (Admin)
 */
const confirmBooking = asyncHandler(async (req, res, next) => {
    const { paymentMethod, transactionId, paidAmount } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
        return next(new AppError(`Cannot confirm a ${booking.status} booking`, 400));
    }

    // Update payment info
    booking.payment = {
        status: PAYMENT_STATUS.PAID,
        method: paymentMethod,
        transactionId,
        paidAt: new Date(),
        paidAmount: paidAmount || booking.pricing.totalAmount,
    };

    // Confirm booking
    await booking.confirm(req.user.id);

    await booking.populate([
        { path: 'halls', select: 'name location' },
        { path: 'user', select: 'name email phone' },
        { path: 'confirmedBy', select: 'name email' },
    ]);

    res.status(200).json({
        status: 'success',
        message: 'Booking confirmed successfully',
        data: {
            booking,
        },
    });
});

/**
 * @desc    Get booking statistics (Admin Dashboard)
 * @route   GET /api/v1/bookings/stats
 * @access  Private (Admin)
 */
const getBookingStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        todayBookings,
        monthlyRevenue,
        upcomingBookings,
    ] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
        Booking.countDocuments({ status: BOOKING_STATUS.CONFIRMED }),
        Booking.countDocuments({ eventDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }),
        Booking.aggregate([
            {
                $match: {
                    status: BOOKING_STATUS.CONFIRMED,
                    createdAt: { $gte: thisMonth, $lt: nextMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.totalAmount' },
                },
            },
        ]),
        Booking.countDocuments({
            eventDate: { $gte: today },
            status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
        }),
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats: {
                totalBookings,
                pendingBookings,
                confirmedBookings,
                todayBookings,
                upcomingBookings,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
            },
        },
    });
});

/**
 * @desc    Check hall availability
 * @route   GET /api/v1/bookings/check-availability
 * @access  Public
 */
const checkAvailability = asyncHandler(async (req, res, next) => {
    const { hallId, date } = req.query;

    if (!hallId || !date) {
        return next(new AppError('Hall ID and date are required', 400));
    }

    const hall = await Hall.findById(hallId);
    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    // Get existing bookings for the date
    const existingBookings = await Booking.find({
        halls: hallId,
        eventDate: new Date(date),
        status: { $ne: BOOKING_STATUS.CANCELLED },
    }).select('timeSlot');

    const bookedSlots = existingBookings.map((b) => b.timeSlot);
    const hasFullDay = bookedSlots.includes('full-day');

    const availability = TIME_SLOTS.map((slot) => {
        let isAvailable = true;

        if (hasFullDay) {
            isAvailable = false;
        } else if (slot.id === 'full-day') {
            isAvailable = bookedSlots.length === 0;
        } else {
            isAvailable = !bookedSlots.includes(slot.id);
        }

        return {
            ...slot,
            price: hall.getPriceForSlot(slot.id),
            isAvailable,
        };
    });

    res.status(200).json({
        status: 'success',
        data: {
            hall: {
                id: hall._id,
                name: hall.name,
            },
            date,
            slots: availability,
        },
    });
});

/**
 * @desc    Admin1 Process (Initial Analysis)
 * @route   PATCH /api/v1/bookings/:id/admin1-process
 * @access  Private (Admin1/SuperAdmin)
 */
const admin1Process = asyncHandler(async (req, res, next) => {
    const { action, note } = req.body; // action: approve, reject, changes-requested
    const booking = await Booking.findById(req.params.id);

    if (!booking) return next(new AppError('Booking not found', 404));

    if (action === 'approve') {
        booking.status = BOOKING_STATUS.APPROVED_ADMIN1;
        booking.workflow.admin1 = { status: 'approved', note, processedBy: req.user.id, processedAt: new Date() };
    } else if (action === 'reject') {
        booking.status = BOOKING_STATUS.REJECTED;
        booking.workflow.admin1 = { status: 'rejected', note, processedBy: req.user.id, processedAt: new Date() };
    } else if (action === 'changes-requested') {
        booking.status = BOOKING_STATUS.CHANGE_REQUESTED;
        booking.workflow.admin1 = { status: 'changes-requested', note, processedBy: req.user.id, processedAt: new Date() };
    }

    await booking.save();
    res.status(200).json({ status: 'success', data: { booking } });
});

/**
 * @desc    Admin2 Process (Availability & Payment)
 * @route   PATCH /api/v1/bookings/:id/admin2-process
 * @access  Private (Admin2/SuperAdmin)
 */
const admin2Process = asyncHandler(async (req, res, next) => {
    const { action, note } = req.body; // action: request-payment, reject, approve (forward to admin3)
    const booking = await Booking.findById(req.params.id);

    if (!booking) return next(new AppError('Booking not found', 404));

    if (action === 'request-payment') {
        booking.status = BOOKING_STATUS.PAYMENT_REQUESTED;
        booking.workflow.admin2 = { status: 'payment-requested', note, processedBy: req.user.id, processedAt: new Date() };
    } else if (action === 'approve') {
        booking.status = BOOKING_STATUS.APPROVED_ADMIN2;
        booking.workflow.admin2 = { status: 'approved', note, processedBy: req.user.id, processedAt: new Date() };
    } else if (action === 'reject') {
        booking.status = BOOKING_STATUS.REJECTED;
        booking.workflow.admin2 = { status: 'rejected', note, processedBy: req.user.id, processedAt: new Date() };
    }

    await booking.save();
    res.status(200).json({ status: 'success', data: { booking } });
});

/**
 * @desc    Admin3 Process (Final Approval)
 * @route   PATCH /api/v1/bookings/:id/admin3-process
 * @access  Private (Admin3/SuperAdmin)
 */
const admin3Process = asyncHandler(async (req, res, next) => {
    const { action, note } = req.body; // action: approve, reject
    const booking = await Booking.findById(req.params.id);

    if (!booking) return next(new AppError('Booking not found', 404));

    if (action === 'approve') {
        booking.status = BOOKING_STATUS.CONFIRMED;
        booking.workflow.admin3 = { status: 'approved', note, processedBy: req.user.id, processedAt: new Date() };
        booking.confirmedBy = req.user.id;
        booking.confirmedAt = new Date();
    } else if (action === 'reject') {
        booking.status = BOOKING_STATUS.REJECTED;
        booking.workflow.admin3 = { status: 'rejected', note, processedBy: req.user.id, processedAt: new Date() };
    }

    await booking.save();
    res.status(200).json({ status: 'success', data: { booking } });
});

module.exports = {
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
};
