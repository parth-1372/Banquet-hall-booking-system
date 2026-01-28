const { z } = require('zod');

const createReviewSchema = z.object({
    review: z
        .string({ required_error: 'Review text is required' })
        .min(5, 'Review must be at least 5 characters')
        .max(500, 'Review cannot exceed 500 characters'),
    rating: z
        .number({ required_error: 'Rating is required' })
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot be more than 5'),
    hall: z
        .string({ required_error: 'Hall ID is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid hall ID'),
    booking: z
        .string({ required_error: 'Booking ID is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
});

const updateReviewSchema = z.object({
    review: z.string().min(5).max(500).optional(),
    rating: z.number().min(1).max(5).optional(),
});

module.exports = {
    createReviewSchema,
    updateReviewSchema,
};
