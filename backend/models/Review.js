const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty'],
            trim: true,
            maxlength: [500, 'Review cannot exceed 500 characters'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Rating is required (1-5)'],
        },
        hall: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hall',
            required: [true, 'Review must belong to a hall'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Review must be associated with a booking'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Prevent user from reviewing the same booking twice
reviewSchema.index({ booking: 1 }, { unique: true });

// Static method to calculate average rating for a hall
reviewSchema.statics.calcAverageRatings = async function (hallId) {
    const stats = await this.aggregate([
        {
            $match: { hall: hallId },
        },
        {
            $group: {
                _id: '$hall',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model('Hall').findByIdAndUpdate(hallId, {
            'rating.count': stats[0].nRating,
            'rating.average': Math.round(stats[0].avgRating * 10) / 10,
        });
    } else {
        await mongoose.model('Hall').findByIdAndUpdate(hallId, {
            'rating.count': 0,
            'rating.average': 0,
        });
    }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.hall);
});

// Call calcAverageRatings after findOneAnd (update and delete)
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.hall);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
