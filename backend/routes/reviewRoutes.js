const express = require('express');
const {
    createReview,
    getHallReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidator'); // Using helper from auth
const { createReviewSchema, updateReviewSchema } = require('../validators/reviewValidator');

// Merge params allows us to access hallId from the hall router
const router = express.Router({ mergeParams: true });

router.get('/', getHallReviews);

router.use(protect);

router.post('/', (req, res, next) => {
    // If used as nested route, inject hallId
    if (req.params.hallId) req.body.hall = req.params.hallId;
    next();
}, createReview);

router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
