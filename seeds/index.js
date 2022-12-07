const mongoose = require('mongoose');
const campground = require('../models/campground');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-app', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database online');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 5;
    const camp = new Campground({
      author: '631129ade332bfabd38cb836',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugit vero temporibus saepe at, excepturi aut, praesentium laborum recusandae similique sit cum eligendi provident. Porro magni quam laudantium voluptas, ratione consectetur?',
      images: [
        {
          url: 'https://res.cloudinary.com/dx1sfgftf/image/upload/v1663076733/YelpCamp/czfd6xpiub2ktchdxx3q.png',
          filename: 'YelpCamp/czfd6xpiub2ktchdxx3q',
        },
        {
          url: 'https://res.cloudinary.com/dx1sfgftf/image/upload/v1663700842/YelpCamp/i4malottewj3u4ebpcny.jpg',
          filename: 'YelpCamp/hehzphjprytx9quzkubi',
        },
      ],
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
