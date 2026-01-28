const { z } = require('zod');
const { USER_ROLES } = require('../utils/constants');

// Register validation schema
const registerSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),

    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),

    phone: z
        .string({
            required_error: 'Phone number is required',
        })
        .regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password cannot exceed 50 characters'),

    confirmPassword: z
        .string({
            required_error: 'Please confirm your password',
        }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Login validation schema
const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(1, 'Password is required'),
});

// Update profile validation schema
const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim()
        .optional(),

    phone: z
        .string()
        .regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number')
        .optional(),
});

// Change password validation schema
const changePasswordSchema = z.object({
    currentPassword: z
        .string({
            required_error: 'Current password is required',
        })
        .min(1, 'Current password is required'),

    newPassword: z
        .string({
            required_error: 'New password is required',
        })
        .min(6, 'New password must be at least 6 characters')
        .max(50, 'Password cannot exceed 50 characters'),

    confirmNewPassword: z
        .string({
            required_error: 'Please confirm your new password',
        }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
});

// Admin create user validation schema
const adminCreateUserSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),

    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),

    phone: z
        .string({
            required_error: 'Phone number is required',
        })
        .regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password cannot exceed 50 characters'),

    role: z
        .enum(Object.values(USER_ROLES), {
            errorMap: () => ({ message: 'Invalid role' }),
        })
        .default(USER_ROLES.CUSTOMER),
});

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.parse(req.body);
        req.body = result; // Replace with parsed & sanitized data
        next();
    } catch (error) {
        error.name = 'ZodError';
        next(error);
    }
};

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
    adminCreateUserSchema,
    validate,
};
