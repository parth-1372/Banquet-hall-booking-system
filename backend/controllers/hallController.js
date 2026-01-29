const Hall = require('../models/Hall');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create a new hall
 * @route   POST /api/v1/halls
 * @access  Private (Admin only)
 */
const createHall = asyncHandler(async (req, res, next) => {
    // Add the creator's ID
    req.body.createdBy = req.user.id;

    const hall = await Hall.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Hall created successfully',
        data: {
            hall,
        },
    });
});

/**
 * @desc    Get all halls (with filtering, sorting, pagination)
 * @route   GET /api/v1/halls
 * @access  Public
 */
const getAllHalls = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        type,
        city,
        minCapacity,
        maxPrice,
        featured,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Filter by type
    if (type) {
        query.type = type;
    }

    // Filter by city
    if (city) {
        query['location.city'] = new RegExp(city, 'i');
    }

    // Filter by minimum capacity
    if (minCapacity) {
        query['capacity.maximum'] = { $gte: parseInt(minCapacity) };
    }

    // Filter by max price (full day)
    if (maxPrice) {
        query['pricing.fullDay'] = { $lte: parseInt(maxPrice) };
    }

    // Filter featured
    if (featured !== undefined) {
        query.isFeatured = featured;
    }

    // Text search - prefix based matching for responsive search
    if (search) {
        query.name = new RegExp('^' + search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
        sortOptions['pricing.fullDay'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'capacity') {
        sortOptions['capacity.maximum'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
        sortOptions['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [halls, total] = await Promise.all([
        Hall.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v'),
        Hall.countDocuments(query),
    ]);

    res.status(200).json({
        status: 'success',
        results: halls.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
        data: {
            halls,
        },
    });
});

/**
 * @desc    Get single hall by ID
 * @route   GET /api/v1/halls/:id
 * @access  Public
 */
const getHall = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findById(req.params.id).populate('createdBy', 'name email');

    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            hall,
        },
    });
});

/**
 * @desc    Update hall
 * @route   PATCH /api/v1/halls/:id
 * @access  Private (Admin only)
 */
const updateHall = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Hall updated successfully',
        data: {
            hall,
        },
    });
});

/**
 * @desc    Delete hall (soft delete)
 * @route   DELETE /api/v1/halls/:id
 * @access  Private (Admin only)
 */
const deleteHall = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Hall deleted successfully',
    });
});

/**
 * @desc    Get featured halls
 * @route   GET /api/v1/halls/featured
 * @access  Public
 */
const getFeaturedHalls = asyncHandler(async (req, res, next) => {
    const halls = await Hall.findFeatured()
        .limit(6)
        .select('name description type capacity pricing images location rating');

    res.status(200).json({
        status: 'success',
        results: halls.length,
        data: {
            halls,
        },
    });
});

/**
 * @desc    Toggle featured status
 * @route   PATCH /api/v1/halls/:id/featured
 * @access  Private (Admin only)
 */
const toggleFeatured = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    hall.isFeatured = !hall.isFeatured;
    await hall.save();

    res.status(200).json({
        status: 'success',
        message: `Hall ${hall.isFeatured ? 'featured' : 'unfeatured'} successfully`,
        data: {
            hall,
        },
    });
});

/**
 * @desc    Get hall availability for a date
 * @route   GET /api/v1/halls/:id/availability
 * @access  Public
 */
const getHallAvailability = asyncHandler(async (req, res, next) => {
    const { date } = req.query;

    if (!date) {
        return next(new AppError('Please provide a date', 400));
    }

    const hall = await Hall.findById(req.params.id);

    if (!hall) {
        return next(new AppError('Hall not found', 404));
    }

    // This will be expanded when Booking model is created
    // For now, return all slots as available
    const { TIME_SLOTS } = require('../utils/constants');

    const availability = TIME_SLOTS.map((slot) => ({
        ...slot,
        price: hall.getPriceForSlot(slot.id),
        isAvailable: true, // Will be calculated based on bookings
    }));

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
 * @desc    Get all halls for admin (including inactive)
 * @route   GET /api/v1/halls/admin/all
 * @access  Private (Admin only)
 */
const getAllHallsAdmin = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [halls, total] = await Promise.all([
        Hall.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email'),
        Hall.countDocuments(),
    ]);

    res.status(200).json({
        status: 'success',
        results: halls.length,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
        data: {
            halls,
        },
    });
});

/**
 * @desc    Upload multiple images for a hall
 * @route   POST /api/v1/halls/:id/images
 * @access  Private (Admin only)
 */
const uploadHallImages = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return next(new AppError('Hall not found', 404));

    if (!req.files || req.files.length === 0) {
        return next(new AppError('Please upload at least one image', 400));
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Add new images to the existing gallery
    const newImages = imageUrls.map(url => ({ url, isPrimary: false }));
    hall.images.push(...newImages);

    await hall.save();

    res.status(200).json({
        status: 'success',
        message: 'Images uploaded successfully',
        data: { images: hall.images }
    });
});

/**
 * @desc    Upload 360 image for a hall
 * @route   POST /api/v1/halls/:id/360-image
 * @access  Private (Admin only)
 */
const uploadHall360Image = asyncHandler(async (req, res, next) => {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return next(new AppError('Hall not found', 404));

    if (!req.file) return next(new AppError('Please upload a 360 image', 400));

    hall.rotationViewUrl = `/uploads/${req.file.filename}`;
    await hall.save();

    res.status(200).json({
        status: 'success',
        message: '360 Image uploaded successfully',
        data: { rotationViewUrl: hall.rotationViewUrl }
    });
});

module.exports = {
    createHall,
    getAllHalls,
    getHall,
    updateHall,
    deleteHall,
    getFeaturedHalls,
    toggleFeatured,
    getHallAvailability,
    getAllHallsAdmin,
    uploadHallImages,
    uploadHall360Image,
};
