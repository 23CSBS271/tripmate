const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Story = require('./models/Story');
const Expense = require('./models/Expense');
const Task = require('./models/Task');
const Photo = require('./models/Photo');
const Place = require('./models/Place');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tripmate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Trip.deleteMany({});
    await Story.deleteMany({});
    await Expense.deleteMany({});
    await Task.deleteMany({});
    await Photo.deleteMany({});
    await Place.deleteMany({});
    console.log('Data cleared');

    // Check if user exists, create if not
    let user = await User.findOne({ email: 'chinmayib32@gmail.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('Mybd@322006', 10);
      user = new User({
        _id: 'user_' + Date.now(),
        email: 'chinmayib32@gmail.com',
        fullName: 'Chinmay B',
        password: hashedPassword
      });
      await user.save();
      console.log('User created');
    } else {
      console.log('User already exists');
    }

    // Create sample trips
    const trips = [
      {
        userId: user._id,
        destination: 'Paris, France',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-25'),
        notes: 'Romantic getaway to the City of Light',
        budget: 3000,
        photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800'
      },
      {
        userId: user._id,
        destination: 'Tokyo, Japan',
        startDate: new Date('2024-07-10'),
        endDate: new Date('2024-07-20'),
        notes: 'Exploring modern culture and traditional temples',
        budget: 4000,
        photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
      },
      {
        userId: user._id,
        destination: 'Bali, Indonesia',
        startDate: new Date('2024-08-05'),
        endDate: new Date('2024-08-15'),
        notes: 'Beach vacation and cultural exploration',
        budget: 2500,
        photoUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'
      },
      {
        userId: user._id,
        destination: 'New York, USA',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-11'),
        notes: 'City that never sleeps adventure',
        budget: 3500,
        photoUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
      },
      {
        userId: user._id,
        destination: 'London, UK',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-10-11'),
        notes: 'Historic sites and modern attractions',
        budget: 3200,
        photoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'
      },
      {
        userId: user._id,
        destination: 'Sydney, Australia',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-11'),
        notes: 'Harbor city and outdoor activities',
        budget: 3800,
        photoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      },
      {
        userId: user._id,
        destination: 'Rome, Italy',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-11'),
        notes: 'Ancient history and Italian cuisine',
        budget: 2800,
        photoUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800'
      },
      {
        userId: user._id,
        destination: 'Barcelona, Spain',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-11'),
        notes: 'Gaudi architecture and Mediterranean beaches',
        budget: 2600,
        photoUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'
      },
      {
        userId: user._id,
        destination: 'Amsterdam, Netherlands',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-11'),
        notes: 'Canals, bikes, and vibrant culture',
        budget: 2900,
        photoUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800'
      },
      {
        userId: user._id,
        destination: 'Dubai, UAE',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-11'),
        notes: 'Luxury and futuristic landmarks',
        budget: 4500,
        photoUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'
      },
      {
        userId: user._id,
        destination: 'Goa, India',
        startDate: new Date('2026-01-16'),
        endDate: new Date('2026-01-23'),
        notes: 'Beach relaxation and water sports',
        budget: 1500,
        photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800'
      },
      {
        userId: user._id,
        destination: 'Cape Town, South Africa',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-11'),
        notes: 'Table Mountain and coastal beauty',
        budget: 3300,
        photoUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'
      },
      {
        userId: user._id,
        destination: 'Rio de Janeiro, Brazil',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-11'),
        notes: 'Carnival and iconic beaches',
        budget: 3100,
        photoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
      },
      {
        userId: user._id,
        destination: 'Bangkok, Thailand',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-11'),
        notes: 'Temples, markets, and street food',
        budget: 2400,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
      },
      {
        userId: user._id,
        destination: 'Istanbul, Turkey',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-11'),
        notes: 'Bridging Europe and Asia',
        budget: 2700,
        photoUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'
      },
      {
        userId: user._id,
        destination: 'Vancouver, Canada',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-11'),
        notes: 'Natural beauty and urban life',
        budget: 3600,
        photoUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800'
      }
    ];

    const createdTrips = [];
    for (const tripData of trips) {
      const trip = new Trip(tripData);
      await trip.save();
      createdTrips.push(trip);
      console.log(`Trip to ${trip.destination} created`);
    }

    // Create sample places for each trip
    const places = [
      {
        tripId: createdTrips[0]._id,
        name: 'Eiffel Tower',
        latitude: 48.8584,
        longitude: 2.2945,
        type: 'landmark',
        notes: 'Iconic iron lattice tower'
      },
      {
        tripId: createdTrips[1]._id,
        name: 'Senso-ji Temple',
        latitude: 35.7148,
        longitude: 139.7967,
        type: 'temple',
        notes: 'Ancient Buddhist temple in Asakusa'
      },
      {
        tripId: createdTrips[2]._id,
        name: 'Ubud Rice Terraces',
        latitude: -8.5191,
        longitude: 115.2625,
        type: 'nature',
        notes: 'Beautiful terraced rice fields'
      },
      {
        tripId: createdTrips[3]._id,
        name: 'Statue of Liberty',
        latitude: 40.6892,
        longitude: -74.0445,
        type: 'landmark',
        notes: 'Symbol of freedom and democracy'
      },
      {
        tripId: createdTrips[4]._id,
        name: 'Big Ben',
        latitude: 51.5007,
        longitude: -0.1246,
        type: 'landmark',
        notes: 'Famous clock tower in London'
      },
      {
        tripId: createdTrips[5]._id,
        name: 'Sydney Opera House',
        latitude: -33.8568,
        longitude: 151.2153,
        type: 'landmark',
        notes: 'Iconic performing arts venue'
      },
      {
        tripId: createdTrips[6]._id,
        name: 'Colosseum',
        latitude: 41.8902,
        longitude: 12.4922,
        type: 'landmark',
        notes: 'Ancient Roman amphitheater'
      },
      {
        tripId: createdTrips[7]._id,
        name: 'Sagrada Familia',
        latitude: 41.4036,
        longitude: 2.1744,
        type: 'landmark',
        notes: 'Gaudi\'s unfinished masterpiece'
      },
      {
        tripId: createdTrips[8]._id,
        name: 'Anne Frank House',
        latitude: 52.3752,
        longitude: 4.8840,
        type: 'museum',
        notes: 'Historic house and museum'
      },
      {
        tripId: createdTrips[9]._id,
        name: 'Burj Khalifa',
        latitude: 25.1972,
        longitude: 55.2744,
        type: 'landmark',
        notes: 'World\'s tallest building'
      },
      {
        tripId: createdTrips[10]._id,
        name: 'Table Mountain',
        latitude: -33.9628,
        longitude: 18.4098,
        type: 'nature',
        notes: 'Iconic flat-topped mountain'
      },
      {
        tripId: createdTrips[11]._id,
        name: 'Christ the Redeemer',
        latitude: -22.9519,
        longitude: -43.2105,
        type: 'landmark',
        notes: 'Art Deco statue of Jesus Christ'
      },
      {
        tripId: createdTrips[12]._id,
        name: 'Grand Palace',
        latitude: 13.7516,
        longitude: 100.4922,
        type: 'landmark',
        notes: 'Official residence of the King of Thailand'
      },
      {
        tripId: createdTrips[13]._id,
        name: 'Hagia Sophia',
        latitude: 41.0086,
        longitude: 28.9802,
        type: 'landmark',
        notes: 'Historic mosque and former cathedral'
      },
      {
        tripId: createdTrips[14]._id,
        name: 'Stanley Park',
        latitude: 49.3043,
        longitude: -123.1443,
        type: 'nature',
        notes: 'Urban park with seawall and totem poles'
      }
    ];

    for (const placeData of places) {
      const place = new Place(placeData);
      await place.save();
    }
    console.log('Places created');

    // Create sample expenses for each trip
    const expenses = [
      {
        tripId: createdTrips[0]._id,
        category: 'Accommodation',
        amount: 1200,
        description: 'Hotel stay for 10 nights',
        date: new Date('2024-06-15')
      },
      {
        tripId: createdTrips[1]._id,
        category: 'Accommodation',
        amount: 1500,
        description: 'Hotel in Shibuya',
        date: new Date('2024-07-10')
      },
      {
        tripId: createdTrips[2]._id,
        category: 'Accommodation',
        amount: 800,
        description: 'Villa rental',
        date: new Date('2024-08-05')
      },
      {
        tripId: createdTrips[3]._id,
        category: 'Accommodation',
        amount: 1400,
        description: 'Manhattan hotel',
        date: new Date('2024-09-01')
      },
      {
        tripId: createdTrips[4]._id,
        category: 'Accommodation',
        amount: 1100,
        description: 'Central London hotel',
        date: new Date('2024-10-01')
      },
      {
        tripId: createdTrips[5]._id,
        category: 'Accommodation',
        amount: 1600,
        description: 'Harbor view hotel',
        date: new Date('2024-11-01')
      },
      {
        tripId: createdTrips[6]._id,
        category: 'Accommodation',
        amount: 900,
        description: 'Historic district hotel',
        date: new Date('2024-12-01')
      },
      {
        tripId: createdTrips[7]._id,
        category: 'Accommodation',
        amount: 700,
        description: 'Beachfront apartment',
        date: new Date('2025-01-01')
      },
      {
        tripId: createdTrips[8]._id,
        category: 'Accommodation',
        amount: 1000,
        description: 'Canal view hotel',
        date: new Date('2025-02-01')
      },
      {
        tripId: createdTrips[9]._id,
        category: 'Accommodation',
        amount: 2000,
        description: 'Luxury Burj Al Arab',
        date: new Date('2025-03-01')
      },
      {
        tripId: createdTrips[10]._id,
        category: 'Accommodation',
        amount: 1200,
        description: 'Mountain view lodge',
        date: new Date('2025-04-01')
      },
      {
        tripId: createdTrips[11]._id,
        category: 'Accommodation',
        amount: 1300,
        description: 'Copacabana hotel',
        date: new Date('2025-05-01')
      },
      {
        tripId: createdTrips[12]._id,
        category: 'Accommodation',
        amount: 600,
        description: 'Budget guesthouse',
        date: new Date('2025-06-01')
      },
      {
        tripId: createdTrips[13]._id,
        category: 'Accommodation',
        amount: 850,
        description: 'Bosphorus view hotel',
        date: new Date('2025-07-01')
      },
      {
        tripId: createdTrips[14]._id,
        category: 'Accommodation',
        amount: 1400,
        description: 'Stanley Park hotel',
        date: new Date('2025-08-01')
      }
    ];

    for (const expenseData of expenses) {
      const expense = new Expense(expenseData);
      await expense.save();
    }
    console.log('Expenses created');

    // Create sample photos for each trip
    const photos = [
      {
        tripId: createdTrips[0]._id,
        url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        caption: 'Eiffel Tower at sunset'
      },
      {
        tripId: createdTrips[1]._id,
        url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        caption: 'Tokyo skyline'
      },
      {
        tripId: createdTrips[2]._id,
        url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
        caption: 'Bali beach sunset'
      },
      {
        tripId: createdTrips[3]._id,
        url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        caption: 'New York City skyline'
      },
      {
        tripId: createdTrips[4]._id,
        url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        caption: 'London Bridge'
      },
      {
        tripId: createdTrips[5]._id,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        caption: 'Sydney Harbor Bridge'
      },
      {
        tripId: createdTrips[6]._id,
        url: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
        caption: 'Roman Forum'
      },
      {
        tripId: createdTrips[7]._id,
        url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        caption: 'Park Güell'
      },
      {
        tripId: createdTrips[8]._id,
        url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
        caption: 'Amsterdam canals'
      },
      {
        tripId: createdTrips[9]._id,
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        caption: 'Dubai Marina'
      },
      {
        tripId: createdTrips[10]._id,
        url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        caption: 'Cape Town waterfront'
      },
      {
        tripId: createdTrips[11]._id,
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        caption: 'Copacabana Beach'
      },
      {
        tripId: createdTrips[12]._id,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        caption: 'Bangkok temples'
      },
      {
        tripId: createdTrips[13]._id,
        url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
        caption: 'Bosphorus Bridge'
      },
      {
        tripId: createdTrips[14]._id,
        url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        caption: 'Stanley Park seawall'
      }
    ];

    for (const photoData of photos) {
      const photo = new Photo(photoData);
      await photo.save();
    }
    console.log('Photos created');

    // Create sample tasks for each trip
    const tasks = [
      {
        userId: user._id,
        tripId: createdTrips[0]._id,
        title: 'Book Eiffel Tower tickets',
        description: 'Reserve tickets for Eiffel Tower visit',
        dueDate: new Date('2024-06-14'),
        completed: true
      },
      {
        userId: user._id,
        tripId: createdTrips[1]._id,
        title: 'Get JR Pass',
        description: 'Purchase Japan Rail Pass for transportation',
        dueDate: new Date('2024-07-09'),
        completed: true
      },
      {
        userId: user._id,
        tripId: createdTrips[2]._id,
        title: 'Rent scooter',
        description: 'Arrange scooter rental for island exploration',
        dueDate: new Date('2024-08-04'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[3]._id,
        title: 'Book Broadway show',
        description: 'Reserve tickets for a Broadway performance',
        dueDate: new Date('2024-08-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[4]._id,
        title: 'Book Tower of London tickets',
        description: 'Reserve entry tickets for Tower of London',
        dueDate: new Date('2024-09-30'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[5]._id,
        title: 'Book Sydney Opera House tour',
        description: 'Reserve guided tour of the Opera House',
        dueDate: new Date('2024-10-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[6]._id,
        title: 'Book Colosseum tickets',
        description: 'Reserve entry tickets for the Colosseum',
        dueDate: new Date('2024-11-30'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[7]._id,
        title: 'Book Sagrada Familia tickets',
        description: 'Reserve entry tickets for Sagrada Familia',
        dueDate: new Date('2024-12-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[8]._id,
        title: 'Book Anne Frank House tickets',
        description: 'Reserve entry tickets for Anne Frank House',
        dueDate: new Date('2025-01-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[9]._id,
        title: 'Book Burj Khalifa tickets',
        description: 'Reserve observation deck tickets',
        dueDate: new Date('2025-02-28'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[10]._id,
        title: 'Book Table Mountain cable car',
        description: 'Reserve cable car tickets for Table Mountain',
        dueDate: new Date('2025-03-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[11]._id,
        title: 'Book Christ the Redeemer tickets',
        description: 'Reserve entry tickets for Christ the Redeemer',
        dueDate: new Date('2025-04-30'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[12]._id,
        title: 'Book Grand Palace tickets',
        description: 'Reserve entry tickets for Grand Palace',
        dueDate: new Date('2025-05-31'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[13]._id,
        title: 'Book Hagia Sophia tickets',
        description: 'Reserve entry tickets for Hagia Sophia',
        dueDate: new Date('2025-06-30'),
        completed: false
      },
      {
        userId: user._id,
        tripId: createdTrips[14]._id,
        title: 'Book Stanley Park bike rental',
        description: 'Reserve bike rental for Stanley Park',
        dueDate: new Date('2025-07-31'),
        completed: false
      }
    ];

    for (const taskData of tasks) {
      const task = new Task(taskData);
      await task.save();
    }
    console.log('Tasks created');

    // Create sample stories
    const stories = [
      {
        userId: user._id,
        title: 'A Romantic Escape to Paris',
        content: 'Paris, the City of Light, exceeded all my expectations. From the moment I arrived, I was captivated by the charm of this beautiful city. The Eiffel Tower stood majestically against the evening sky, and strolling along the Seine River was pure magic. The Louvre Museum housed incredible art collections that left me speechless. Every corner of Paris tells a story, and I\'m grateful to have been part of it.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800', caption: 'Eiffel Tower' },
          { url: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=800', caption: 'Seine River' }
        ],
        location: 'Paris, France',
        tripId: createdTrips[0]._id,
        excerpt: 'An unforgettable journey through the romantic streets of Paris'
      },
      {
        userId: user._id,
        title: 'Tokyo: Where Tradition Meets Modernity',
        content: 'Tokyo is a fascinating blend of ancient traditions and cutting-edge technology. I visited the historic Senso-ji Temple in Asakusa, where I experienced the peaceful atmosphere of traditional Japanese architecture. The Shibuya Crossing was an exhilarating experience, watching thousands of people cross simultaneously. The food scene was incredible - from sushi to ramen, every meal was memorable.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', caption: 'Tokyo skyline' },
          { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', caption: 'Senso-ji Temple' }
        ],
        location: 'Tokyo, Japan',
        tripId: createdTrips[1]._id,
        excerpt: 'Discovering the perfect harmony of old and new in Japan\'s capital'
      },
      {
        userId: user._id,
        title: 'Bali: Island Paradise and Cultural Riches',
        content: 'Bali welcomed me with its stunning natural beauty and rich cultural heritage. The rice terraces in Ubud were breathtaking, showcasing the incredible agricultural landscape. I visited the iconic Tanah Lot Temple, perched on a rock in the ocean, creating a dramatic scene especially at sunset. The local cuisine was flavorful and diverse, and I even took a traditional cooking class to learn Balinese recipes.',
        status: 'draft',
        coverImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800', caption: 'Bali beach' },
          { url: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', caption: 'Rice terraces' }
        ],
        location: 'Bali, Indonesia',
        tripId: createdTrips[2]._id,
        excerpt: 'Exploring Bali\'s natural wonders and cultural treasures'
      },
      {
        userId: user._id,
        title: 'New York: The City That Never Sleeps',
        content: 'New York City is a whirlwind of energy and excitement. Times Square dazzled me with its bright lights and endless crowds. Central Park offered a peaceful retreat in the middle of the urban jungle. Walking across the Brooklyn Bridge at sunset was pure magic, with the Manhattan skyline glowing in the distance. The food scene is incredible - from pizza to bagels, every bite was delicious.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', caption: 'New York skyline' },
          { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Brooklyn Bridge' }
        ],
        location: 'New York, USA',
        tripId: createdTrips[3]._id,
        excerpt: 'Diving into the vibrant heart of the Big Apple'
      },
      {
        userId: user._id,
        title: 'London: Historic Charm and Modern Vibes',
        content: 'London is a perfect blend of history and modernity. The Tower of London told stories of kings and queens, while Buckingham Palace showcased royal tradition. A cruise along the Thames River revealed the city\'s architectural wonders. The British Museum housed treasures from around the world. Afternoon tea at a traditional spot was a delightful experience.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', caption: 'London Bridge' },
          { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', caption: 'Thames River' }
        ],
        location: 'London, UK',
        tripId: createdTrips[4]._id,
        excerpt: 'Exploring the timeless elegance of England\'s capital'
      },
      {
        userId: user._id,
        title: 'Sydney: Harbor City Adventures',
        content: 'Sydney welcomed me with its stunning harbor and outdoor lifestyle. Climbing the Sydney Harbour Bridge was an exhilarating challenge. The Opera House is even more beautiful up close. I tried surfing at Bondi Beach and explored the peaceful Royal Botanic Gardens. The seafood at the harbor markets was fresh and delicious.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Sydney Harbour Bridge' },
          { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', caption: 'Sydney Opera House' }
        ],
        location: 'Sydney, Australia',
        tripId: createdTrips[5]._id,
        excerpt: 'Discovering Sydney\'s coastal beauty and vibrant culture'
      },
      {
        userId: user._id,
        title: 'Rome: Eternal City Wonders',
        content: 'Rome is truly the Eternal City, filled with ancient wonders. The Colosseum transported me back to the glory days of the Roman Empire. Vatican City\'s St. Peter\'s Basilica and Sistine Chapel left me in awe. Wandering through charming piazzas and sampling authentic gelato was pure joy. Every cobblestone street tells a story of centuries past.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800', caption: 'Roman Forum' },
          { url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', caption: 'Colosseum' }
        ],
        location: 'Rome, Italy',
        tripId: createdTrips[6]._id,
        excerpt: 'Journeying through ancient Rome\'s timeless treasures'
      },
      {
        userId: user._id,
        title: 'Barcelona: Gaudi\'s Architectural Marvels',
        content: 'Barcelona is a feast for the eyes with Antoni Gaudi\'s incredible architecture. The Sagrada Familia is a masterpiece still under construction. Park Güell\'s colorful mosaics and whimsical designs were enchanting. The Gothic Quarter\'s narrow streets led to beautiful beaches. Tapas and sangria made every meal memorable.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', caption: 'Park Güell' },
          { url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800', caption: 'Sagrada Familia' }
        ],
        location: 'Barcelona, Spain',
        tripId: createdTrips[7]._id,
        excerpt: 'Marveling at Barcelona\'s artistic and cultural splendor'
      },
      {
        userId: user._id,
        title: 'Amsterdam: Canals and Culture',
        content: 'Amsterdam\'s canals and bike culture create a unique atmosphere. The Anne Frank House was a moving experience of history. The Van Gogh Museum housed incredible art collections. Biking along the canals and visiting the vibrant Vondelpark were highlights. The coffee shops and cheese markets added to the cultural richness.',
        status: 'draft',
        coverImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800', caption: 'Amsterdam canals' },
          { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', caption: 'Anne Frank House' }
        ],
        location: 'Amsterdam, Netherlands',
        tripId: createdTrips[8]._id,
        excerpt: 'Exploring Amsterdam\'s waterways and artistic heritage'
      },
      {
        userId: user._id,
        title: 'Dubai: Luxury in the Desert',
        content: 'Dubai is a showcase of luxury and innovation. The Burj Khalifa offers breathtaking views from the world\'s tallest building. Palm Jumeirah\'s artificial island is engineering marvel. Desert safaris with dune bashing were thrilling. Shopping at the gold souk and dining at rooftop restaurants were unforgettable experiences.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', caption: 'Dubai Marina' },
          { url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', caption: 'Burj Khalifa' }
        ],
        location: 'Dubai, UAE',
        tripId: createdTrips[9]._id,
        excerpt: 'Experiencing Dubai\'s opulent lifestyle and futuristic wonders'
      },
      {
        userId: user._id,
        title: 'Cape Town: Mountain and Sea',
        content: 'Cape Town offers stunning natural beauty with Table Mountain dominating the skyline. The cable car ride provided panoramic views. Camps Bay\'s beaches are pristine and beautiful. Exploring the Cape Peninsula and visiting penguins at Boulders Beach were highlights. The wine regions offered delicious tastings.',
        status: 'draft',
        coverImage: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', caption: 'Cape Town waterfront' },
          { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', caption: 'Table Mountain' }
        ],
        location: 'Cape Town, South Africa',
        tripId: createdTrips[10]._id,
        excerpt: 'Discovering Cape Town\'s coastal beauty and mountain majesty'
      },
      {
        userId: user._id,
        title: 'Rio: Carnival and Beaches',
        content: 'Rio de Janeiro pulses with vibrant energy. Christ the Redeemer stands majestically overlooking the city. Copacabana and Ipanema beaches are perfect for sunbathing and people-watching. The Carnival\'s samba rhythms and colorful parades were spectacular. Hiking to the top of Sugarloaf Mountain offered incredible views.',
        status: 'draft',
        coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', caption: 'Copacabana Beach' },
          { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', caption: 'Christ the Redeemer' }
        ],
        location: 'Rio de Janeiro, Brazil',
        tripId: createdTrips[11]._id,
        excerpt: 'Dancing through Rio\'s beaches and Carnival spirit'
      },
      {
        userId: user._id,
        title: 'Bangkok: Temples and Street Food',
        content: 'Bangkok is a sensory overload of temples and street food. The Grand Palace\'s golden temples are breathtaking. Wat Arun by the river is beautiful at sunset. The street food scene is incredible - from pad thai to mango sticky rice. Floating markets and tuk-tuk rides added to the adventure.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', caption: 'Bangkok temples' },
          { url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', caption: 'Grand Palace' }
        ],
        location: 'Bangkok, Thailand',
        tripId: createdTrips[12]._id,
        excerpt: 'Savoring Bangkok\'s temples and tantalizing street cuisine'
      },
      {
        userId: user._id,
        title: 'Istanbul: East Meets West',
        content: 'Istanbul beautifully bridges Europe and Asia. The Hagia Sophia\'s history spans centuries. The Blue Mosque\'s intricate tiles are stunning. The Grand Bazaar is a treasure trove of shopping. Bosphorus cruises and Turkish baths were relaxing. The food - from kebabs to baklava - was divine.',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', caption: 'Bosphorus Bridge' },
          { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', caption: 'Hagia Sophia' }
        ],
        location: 'Istanbul, Turkey',
        tripId: createdTrips[13]._id,
        excerpt: 'Crossing continents in Istanbul\'s rich tapestry'
      },
      {
        userId: user._id,
        title: 'Vancouver: Nature and Urban Life',
        content: 'Vancouver combines stunning natural beauty with urban sophistication. Stanley Park\'s seawall is perfect for cycling. Granville Island\'s markets and arts scene are vibrant. Hiking in nearby mountains and whale watching were highlights. The seafood and craft beer scene is excellent.',
        status: 'draft',
        coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        photos: [
          { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', caption: 'Stanley Park seawall' },
          { url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800', caption: 'Vancouver skyline' }
        ],
        location: 'Vancouver, Canada',
        tripId: createdTrips[14]._id,
        excerpt: 'Blending wilderness and city life in Vancouver'
      }
    ];

    for (const storyData of stories) {
      const story = new Story(storyData);
      await story.save();
    }
    console.log('Stories created');

    console.log('Database seeded successfully!');
    console.log(`Created ${createdTrips.length} trips, ${places.length} places, ${expenses.length} expenses, ${photos.length} photos, ${tasks.length} tasks, and ${stories.length} stories for user ${user.email}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();
