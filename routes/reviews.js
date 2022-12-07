const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../Helpers/catchAsync');
const ExpressError = require('../Helpers/ExpressError');

const Review = require('../models/review');
const Campground = require('../models/campground');

const { reviewSchema } = require('../schema.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

const reviewController = require('../controllers/reviewsControllers');

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(reviewController.createReview)
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewController.deleteReview)
);

module.exports = router;
