const mongoose = require('mongoose');
const { HALL_TYPES, TIME_SLOTS } = require('../utils/constants');

const hallSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Hall name is required'],
            trim: true,
            maxlength: [100, 'Hall name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Hall description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        type: {
            type: String,
            enum: Object.values(HALL_TYPES),
            default: HALL_TYPES.BANQUET,
        },
        rotationViewUrl: {
            type: String,
            trim: true,
            default: '',
        },
        faqs: [{
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }],
        capacity: {
            minimum: {
                type: Number,
                required: [true, 'Minimum capacity is required'],
                min: [1, 'Minimum capacity must be at least 1'],
            },
            maximum: {
                type: Number,
                required: [true, 'Maximum capacity is required'],
                min: [1, 'Maximum capacity must be at least 1'],
            },
        },
        pricing: {
            morning: {
                type: Number,
                required: [true, 'Morning slot price is required'],
                min: [0, 'Price cannot be negative'],
            },
            afternoon: {
                type: Number,
                required: [true, 'Afternoon slot price is required'],
                min: [0, 'Price cannot be negative'],
            },
            evening: {
                type: Number,
                required: [true, 'Evening slot price is required'],
                min: [0, 'Price cannot be negative'],
            },
            fullDay: {
                type: Number,
                required: [true, 'Full day price is required'],
                min: [0, 'Price cannot be negative'],
            },
        },
        amenities: [{
            type: String,
            trim: true,
        }],
        images: [{
            url: {
                type: String,
                required: true,
            },
            caption: {
                type: String,
                trim: true,
                maxlength: [200, 'Image caption cannot exceed 200 characters'],
            },
            isPrimary: {
                type: Boolean,
                default: false,
            },
        }],
        location: {
            address: {
                type: String,
                required: [true, 'Address is required'],
                trim: true,
            },
            city: {
                type: String,
                required: [true, 'City is required'],
                trim: true,
            },
            state: {
                type: String,
                required: [true, 'State is required'],
                trim: true,
            },
            pincode: {
                type: String,
                required: [true, 'Pincode is required'],
                match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode'],
            },
        },
        contactInfo: {
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
        },
        policies: {
            cancellation: {
                type: String,
                trim: true,
                default: 'Cancellation allowed up to 48 hours before the event.',
            },
            refund: {
                type: String,
                trim: true,
                default: '50% refund on cancellation within policy period.',
            },
            rules: [{
                type: String,
                trim: true,
            }],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for faster queries
hallSchema.index({ name: 'text', description: 'text' });
hallSchema.index({ type: 1 });
hallSchema.index({ 'location.city': 1 });
hallSchema.index({ isActive: 1 });
hallSchema.index({ isFeatured: 1 });
hallSchema.index({ 'capacity.maximum': 1 });
hallSchema.index({ 'pricing.fullDay': 1 });

// Virtual for primary image
hallSchema.virtual('primaryImage').get(function () {
    if (!this.images || !Array.isArray(this.images) || this.images.length === 0) {
        return null;
    }
    const primary = this.images.find((img) => img.isPrimary);
    return primary ? primary.url : (this.images[0]?.url || null);
});

// Validate capacity range
hallSchema.pre('save', function (next) {
    if (this.capacity.minimum > this.capacity.maximum) {
        next(new Error('Minimum capacity cannot be greater than maximum capacity'));
    }
    next();
});

// Static method to find active halls
hallSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

// Static method to find featured halls
hallSchema.statics.findFeatured = function () {
    return this.find({ isActive: true, isFeatured: true });
};

// Instance method to get price for a slot
hallSchema.methods.getPriceForSlot = function (slotId) {
    const slotPricing = {
        'morning': this.pricing.morning,
        'afternoon': this.pricing.afternoon,
        'evening': this.pricing.evening,
        'full-day': this.pricing.fullDay,
    };
    return slotPricing[slotId] || null;
};

const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall;
