const { z } = require('zod');
const { BOOKING_STATUS, PAYMENT_STATUS, TIME_SLOTS } = require('../utils/constants');

// Contact details schema
const contactDetailsSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'),
    email: z.string().email('Please provide a valid email'),
    alternatePhone: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number').optional(),
});

// Add-on schema
const addOnSchema = z.object({
    name: z.string().max(100),
    price: z.number().min(0),
});

// Create booking validation schema
const createBookingSchema = z.object({
    halls: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hall ID'))
        .min(1, 'Please select at least one hall')
        .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hall ID').transform(val => [val])),

    eventDate: z
        .string({ required_error: 'Event date is required' })
        .refine((date) => {
            const eventDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }, { message: 'Event date must be today or in the future' }),

    timeSlot: z
        .enum(TIME_SLOTS.map((slot) => slot.id), {
            errorMap: () => ({ message: 'Invalid time slot' }),
        }),

    eventType: z
        .string({ required_error: 'Event type is required' })
        .min(3, 'Event type must be at least 3 characters')
        .max(100),

    eventDescription: z
        .string()
        .max(500)
        .optional(),

    guestCount: z
        .number({ required_error: 'Guest count is required' })
        .int()
        .min(1, 'Guest count must be at least 1'),

    contactDetails: contactDetailsSchema,

    specialRequests: z
        .string()
        .max(1000)
        .optional(),

    addOns: z
        .array(addOnSchema)
        .optional()
        .default([]),
});

// Update booking validation schema (for admin)
const updateBookingSchema = z.object({
    status: z
        .enum(Object.values(BOOKING_STATUS))
        .optional(),

    eventDate: z
        .string()
        .refine((date) => {
            const eventDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }, { message: 'Event date must be today or in the future' })
        .optional(),

    timeSlot: z
        .enum(TIME_SLOTS.map((slot) => slot.id))
        .optional(),

    guestCount: z
        .number()
        .int()
        .min(1)
        .optional(),

    contactDetails: contactDetailsSchema.partial().optional(),

    specialRequests: z
        .string()
        .max(1000)
        .optional(),

    adminNotes: z
        .string()
        .max(1000)
        .optional(),

    addOns: z
        .array(addOnSchema)
        .optional(),
});

// Update booking validation schema (for customer)
const customerUpdateBookingSchema = z.object({
    eventDate: z
        .string()
        .refine((date) => {
            const eventDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }, { message: 'Event date must be today or in the future' })
        .optional(),

    timeSlot: z
        .enum(TIME_SLOTS.map((slot) => slot.id))
        .optional(),

    eventType: z.string().min(3).max(100).optional(),
    eventDescription: z.string().max(500).optional(),

    guestCount: z
        .number()
        .int()
        .min(1)
        .optional(),

    contactDetails: contactDetailsSchema.partial().optional(),

    specialRequests: z
        .string()
        .max(1000)
        .optional(),

    addOns: z
        .array(addOnSchema)
        .optional(),
});

// Cancel booking validation schema
const cancelBookingSchema = z.object({
    reason: z
        .string({ required_error: 'Cancellation reason is required' })
        .min(10, 'Reason must be at least 10 characters')
        .max(500),
});

// Confirm booking with payment validation schema
const confirmBookingSchema = z.object({
    paymentMethod: z
        .enum(['cash', 'card', 'upi', 'bank_transfer', 'online'], {
            errorMap: () => ({ message: 'Invalid payment method' }),
        }),

    transactionId: z
        .string()
        .optional(),

    paidAmount: z
        .number()
        .min(0)
        .optional(),
});

// Query params for listing bookings
const bookingQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(Object.values(BOOKING_STATUS)).optional(),
    hall: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['eventDate', 'createdAt', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.parse(req.body);
        req.body = result;
        next();
    } catch (error) {
        error.name = 'ZodError';
        next(error);
    }
};

// Query validation middleware
const validateQuery = (schema) => (req, res, next) => {
    try {
        const result = schema.parse(req.query);
        req.query = result;
        next();
    } catch (error) {
        error.name = 'ZodError';
        next(error);
    }
};

module.exports = {
    createBookingSchema,
    updateBookingSchema,
    cancelBookingSchema,
    confirmBookingSchema,
    bookingQuerySchema,
    customerUpdateBookingSchema,
    validate,
    validateQuery,
};
