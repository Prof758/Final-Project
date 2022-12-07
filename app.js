if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const path = require('path');
const { campgroundSchema, reviewSchema } = require('./schema.js');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const { findByIdAndDelete } = require('./models/campground');

const catchAsync = require('./Helpers/catchAsync');
const asyncError = require('./Helpers/asyncError');
const ExpressError = require('./Helpers/ExpressError');
const { required } = require('joi');
const {
  isLoggedIn,
  validateCampground,
  validateReview,
} = require('./middleware');

const Review = require('./models/review');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const MongoStore = require('connect-mongo');
//const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-app';
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
  //useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database online');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ crossOriginEmbedderPolicy: false }));

const secret = process.env.SECRET || 'testsecretyelpapp';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('session store error', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    //secure:true,
  },
};

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js',
  'https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js',
];
const styleSrcUrls = [
  'http://localhost:3000/stylessheets/home.css',
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css',
];
const connectSrcUrls = [
  'https://www.mapbox.com/mapbox-gl-js/api/',
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        "'data:'",
        'https://res.cloudinary.com/dx1sfgftf/',
        'https://cloudinary.com/dx1sfgftf/',
        'https://images.unsplash.com',
        'https://res.cloudinary.com/dx1sfgftf/',
        'https://res.cloudinary.com/dx1sfgftf/image/upload/v1663700842/YelpCamp/i4malottewj3u4ebpcny.jpg',
        'https://res.cloudinary.com/dx1sfgftf/image/upload/v1663426364/YelpCamp/qbaq86wjdtah0sxkuffn.png',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.session);
  if (!['login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

// app.get('/makecampground', async (req, res) => {
//   const camp = new Campground({ title: 'first camp ', price: '50' });
//   await camp.save();
//   res.send(camp);
// });

app.all('*', (req, res, next) => {
  next(new ExpressError('Cannot find page', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'something gone wrong';
  res.status(statusCode).render('error_template', { err });
});

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`test port ${port}`);
});
