const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { route } = require('./campgrounds');
const catchAsync = require('../Helpers/catchAsync');
const userController = require('../controllers/usersControllers');

router
  .route('/register')
  .get(userController.renderRegister)
  .post(catchAsync(userController.registerNewUser));

router
  .route('/login')
  .get(userController.renderLogInForm)
  .post(
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true,
    }),
    userController.logInUser
  );

router.get('/logout', userController.logOutUser);

module.exports = router;
