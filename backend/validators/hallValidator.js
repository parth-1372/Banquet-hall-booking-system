const { z } = require('zod');
const { HALL_TYPES } = require('../utils/constants');

// Image schema
const imageSchema = z.object({
    url: z.string().url('Please provide a valid image URL'),
    caption: z.string().max(200, 'Caption cannot exceed 200 characters').optional(),
    isPrimary: z.boolean().optional().default(false),
});

// Location schema
const locationSchema = z.object({
    address: z.string().min(5, 'Address must be at least 5 characters').max(500, 'Address too long'),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City name too long'),
    state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State name too long'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode'),
});

// Contact info schema
const contactInfoSchema = z.object({
    phone: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'),
    email: z.string().email('Please provide a valid email'),
});

// Pricing schema
const pricingSchema = z.object({
    morning: z.number().min(0, 'Price cannot be negative'),
    afternoon: z.number().min(0, 'Price cannot be negative'),
    evening: z.number().min(0, 'Price cannot be negative'),
    fullDay: z.number().min(0, 'Price cannot be negative'),
});

// Capacity schema
const capacitySchema = z.object({
    minimum: z.number().int().min(1, 'Minimum capacity must be at least 1'),
    maximum: z.number().int().min(1, 'Maximum capacity must be at least 1'),
}).refine((data) => data.minimum <= data.maximum, {
    message: 'Minimum capacity cannot be greater than maximum capacity',
    path: ['minimum'],
});

// Policies schema
const policiesSchema = z.object({
    cancellation: z.string().max(500).optional(),
    refund: z.string().max(500).optional(),
    rules: z.array(z.string().max(200)).optional(),
});

// Create hall validation schema
const createHallSchema = z.object({
    name: z
        .string({ required_error: 'Hall name is required' })
        .min(3, 'Hall name must be at least 3 characters')
        .max(100, 'Hall name cannot exceed 100 characters')
        .trim(),

    description: z
        .string({ required_error: 'Description is required' })
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim(),

    type: z
        .enum(Object.values(HALL_TYPES), {
            errorMap: () => ({ message: 'Invalid hall type' }),
        })
        .optional()
        .default(HALL_TYPES.BANQUET),

    capacity: capacitySchema,

    pricing: pricingSchema,

    amenities: z
        .array(z.string().trim().max(100))
        .optional()
        .default([]),

    images: z
        .array(imageSchema)
        .optional()
        .default([]),

    location: locationSchema,

    contactInfo: contactInfoSchema,

    policies: policiesSchema.optional(),

    isActive: z.boolean().optional().default(true),

    isFeatured: z.boolean().optional().default(false),
});

// Update hall validation schema (all fields optional)
const updateHallSchema = z.object({
    name: z
        .string()
        .min(3, 'Hall name must be at least 3 characters')
        .max(100, 'Hall name cannot exceed 100 characters')
        .trim()
        .optional(),

    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional(),

    type: z
        .enum(Object.values(HALL_TYPES), {
            errorMap: () => ({ message: 'Invalid hall type' }),
        })
        .optional(),

    capacity: capacitySchema.optional(),

    pricing: pricingSchema.optional(),

    amenities: z
        .array(z.string().trim().max(100))
        .optional(),

    images: z
        .array(imageSchema)
        .optional(),

    location: locationSchema.optional(),

    contactInfo: contactInfoSchema.optional(),

    policies: policiesSchema.optional(),

    isActive: z.boolean().optional(),

    isFeatured: z.boolean().optional(),
});

// Query params validation for listing halls
const hallQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.enum(Object.values(HALL_TYPES)).optional(),
    city: z.string().optional(),
    minCapacity: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    featured: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'capacity', 'rating', 'createdAt']).optional(),
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
    createHallSchema,
    updateHallSchema,
    hallQuerySchema,
    validate,
    validateQuery,
};
