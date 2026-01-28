const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS, TIME_SLOTS } = require('../utils/constants');

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Booking must belong to a user'],
        },
        halls: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hall',
            required: [true, 'Booking must be for at least one hall'],
        }],
        eventDate: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        timeSlot: {
            type: String,
            enum: TIME_SLOTS.map((slot) => slot.id),
            required: [true, 'Time slot is required'],
        },
        documents: [{
            name: String,
            url: String,
            verified: { type: Boolean, default: false }
        }],
        workflow: {
            admin1: {
                status: { type: String, enum: ['pending', 'approved', 'rejected', 'changes-requested'], default: 'pending' },
                note: String,
                processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                processedAt: Date
            },
            admin2: {
                status: { type: String, enum: ['pending', 'approved', 'rejected', 'payment-requested'], default: 'pending' },
                note: String,
                processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                processedAt: Date
            },
            admin3: {
                status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
                note: String,
                processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                processedAt: Date
            }
        },
        invoiceId: String,
        eventType: {
            type: String,
            required: [true, 'Event type is required'],
            trim: true,
            maxlength: [100, 'Event type cannot exceed 100 characters'],
        },
        eventDescription: {
            type: String,
            trim: true,
            maxlength: [500, 'Event description cannot exceed 500 characters'],
        },
        guestCount: {
            type: Number,
            required: [true, 'Expected guest count is required'],
            min: [1, 'Guest count must be at least 1'],
        },
        contactDetails: {
            name: {
                type: String,
                required: [true, 'Contact name is required'],
                trim: true,
            },
            phone: {
                type: String,
                required: [true, 'Contact phone is required'],
                match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
            },
            email: {
                type: String,
                required: [true, 'Contact email is required'],
                lowercase: true,
                trim: true,
            },
            alternatePhone: {
                type: String,
                match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
            },
        },
        pricing: {
            basePrice: {
                type: Number,
                required: true,
                min: 0,
            },
            taxes: {
                type: Number,
                default: 0,
                min: 0,
            },
            discount: {
                type: Number,
                default: 0,
                min: 0,
            },
            totalAmount: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        payment: {
            status: {
                type: String,
                enum: Object.values(PAYMENT_STATUS),
                default: PAYMENT_STATUS.PENDING,
            },
            method: {
                type: String,
                enum: ['cash', 'card', 'upi', 'bank_transfer', 'online'],
            },
            transactionId: String,
            paidAt: Date,
            paidAmount: {
                type: Number,
                default: 0,
            },
        },
        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.ACTION_PENDING,
        },
        specialRequests: {
            type: String,
            trim: true,
            maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
        },
        addOns: [{
            name: {
                type: String,
                trim: true,
            },
            price: {
                type: Number,
                min: 0,
            },
        }],
        cancellation: {
            cancelledAt: Date,
            cancelledBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            reason: String,
            refundAmount: {
                type: Number,
                default: 0,
            },
            refundStatus: {
                type: String,
                enum: ['pending', 'processed', 'completed', 'rejected'],
            },
        },
        adminNotes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        confirmedAt: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for faster queries
bookingSchema.index({ user: 1 });
bookingSchema.index({ halls: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ halls: 1, eventDate: 1, timeSlot: 1 }, { unique: true });

// Generate unique booking ID before saving
bookingSchema.pre('save', async function (next) {
    if (!this.bookingId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingId = `BK${year}${month}${random}`;
    }
    next();
});

// Virtual to check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function () {
    return new Date(this.eventDate) > new Date();
});

// Virtual to check if booking is past
bookingSchema.virtual('isPast').get(function () {
    return new Date(this.eventDate) < new Date();
});

// Static method to check slot availability
bookingSchema.statics.isSlotAvailable = async function (hallIds, eventDate, timeSlot, excludeBookingId = null) {
    const query = {
        halls: { $in: hallIds },
        eventDate: new Date(eventDate),
        timeSlot,
        status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED] },
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    // Check for full-day conflicts
    if (timeSlot === 'full-day') {
        // If booking full-day, no other bookings should exist
        query.timeSlot = { $in: ['morning', 'afternoon', 'evening', 'full-day'] };
    } else {
        // If booking a slot, check if full-day or same slot exists
        query.timeSlot = { $in: [timeSlot, 'full-day'] };
    }

    const existingBooking = await this.findOne(query);
    return !existingBooking;
};

// Static method to get bookings for a date range
bookingSchema.statics.getBookingsForHall = async function (hallId, startDate, endDate) {
    return this.find({
        halls: hallId,
        eventDate: { $gte: startDate, $lte: endDate },
        status: { $ne: BOOKING_STATUS.CANCELLED },
    }).select('eventDate timeSlot status');
};

// Instance method to cancel booking
bookingSchema.methods.cancel = async function (userId, reason) {
    this.status = BOOKING_STATUS.CANCELLED;
    this.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: userId,
        reason,
        refundStatus: 'pending',
    };

    // Calculate refund based on how far the event is
    const daysUntilEvent = Math.ceil(
        (new Date(this.eventDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEvent > 7) {
        this.cancellation.refundAmount = this.pricing.totalAmount * 0.9; // 90% refund
    } else if (daysUntilEvent > 2) {
        this.cancellation.refundAmount = this.pricing.totalAmount * 0.5; // 50% refund
    } else {
        this.cancellation.refundAmount = 0; // No refund
    }

    return this.save();
};

// Instance method to confirm booking
bookingSchema.methods.confirm = async function (adminId) {
    this.status = BOOKING_STATUS.CONFIRMED;
    this.confirmedBy = adminId;
    this.confirmedAt = new Date();
    return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
