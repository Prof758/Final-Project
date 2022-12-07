const express = require('express');
const router = express.Router();
const catchAsync = require('../Helpers/catchAsync');
const ExpressError = require('../Helpers/ExpressError');
const { required } = require('joi');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schema.js');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const { populate } = require('../models/campground');
const campgroundsController = require('../controllers/campgroundsControllers');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
  .route('/')
  .get(catchAsync(campgroundsController.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    catchAsync(campgroundsController.createCampground)
  );

router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router
  .route('/:id')
  .get(catchAsync(campgroundsController.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(campgroundsController.updateCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundsController.deleteCampground)
  );

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsController.editCampground)
);

module.exports = router;
