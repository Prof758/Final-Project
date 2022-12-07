const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.registerNewUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    //console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Welcome To Yelp Camp');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

module.exports.renderLogInForm = (req, res) => {
  res.render('users/login');
};

module.exports.logInUser = (req, res) => {
  const redirectUrl = '/campgrounds';
  if (req.session.returnTo) {
    redirectUrl = req.session.returnTo;
    req.session.returnTo = null;
  }
  /*
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;*/
  req.flash('success', 'Welcome Back');
  res.redirect(redirectUrl);
};

module.exports.logOutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
  });
};
