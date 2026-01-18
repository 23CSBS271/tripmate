# TripMate - Smart Trip Planner

A full-stack travel planning application built with modern web technologies. TripMate helps you organize trips, manage tasks, track expenses, and visualize your destinations.

## Features

### Core Features
- **User Authentication**: Secure registration and login with JWT
- **Trip Management**: Create, edit, and delete trips with destinations, dates, and budgets
- **Task Management**: Add to-do items for each trip with due dates and completion tracking
- **Budget Tracker**: Monitor expenses across categories (transport, hotel, food, etc.)
- **Interactive Maps**: Visualize trip destinations and add custom places with Leaflet
- **Calendar View**: See trips and tasks in a monthly calendar layout
- **Weather Integration**: Live weather forecasts for trip destinations
- **Dark Theme**: Modern dark UI throughout the entire application

### Advanced Features
- Responsive design for mobile and desktop
- Real-time data synchronization
- Trip filtering and search
- Expense categorization and budget tracking
- Task filtering (all, pending, completed)
- Interactive map with custom markers
- Weather data from Open-Meteo API
- Geocoding for destination mapping

## Tech Stack

### Frontend
- **React 18**: Component-based UI
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling with dark theme
- **Leaflet**: Interactive maps
- **Lucide React**: Modern icon library

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Auth**: JWT-based authentication
- **Row Level Security (RLS)**: Secure data access policies

### APIs
- **Open-Meteo**: Weather data
- **OpenStreetMap Nominatim**: Geocoding service

## Project Structure

```
project/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ExpenseTracker.jsx
│   │   ├── Navbar.jsx
│   │   ├── PlacesMap.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── TaskList.jsx
│   │   ├── TripCard.jsx
│   │   ├── TripModal.jsx
│   │   └── WeatherWidget.jsx
│   ├── contexts/            # React context providers
│   │   └── AuthContext.jsx
│   ├── lib/                 # Configuration and utilities
│   │   └── supabase.js
│   ├── pages/               # Page components
│   │   ├── CalendarView.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── MapView.jsx
│   │   ├── Register.jsx
│   │   └── TripDetails.jsx
│   ├── App.jsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables (pre-configured)
└── package.json             # Dependencies and scripts
```

## Database Schema

### Tables
1. **profiles**: User profiles linked to auth.users
2. **trips**: Trip information with destinations, dates, and budgets
3. **tasks**: Todo items associated with trips
4. **expenses**: Budget tracking for trips
5. **places**: Custom locations and markers on maps

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

The project is already set up with all dependencies installed. The Supabase database is pre-configured with environment variables in `.env`.

### Running the Application

The development server starts automatically. Simply open your browser to view the application.

### Usage

1. **Register**: Create a new account on the registration page
2. **Login**: Sign in with your credentials
3. **Create Trip**: Click "New Trip" on the dashboard to add a trip
4. **Add Tasks**: Open a trip and add tasks in the Tasks tab
5. **Track Expenses**: Add expenses and monitor your budget
6. **View Map**: See trip locations on the Map & Places tab
7. **Calendar**: View all trips and tasks in calendar view
8. **Weather**: Check weather forecasts for your destinations

## Features Breakdown

### Authentication
- Email/password registration and login
- Secure JWT-based session management
- Protected routes requiring authentication
- Automatic profile creation on signup

### Trip Management
- Create trips with destination, dates, notes, and budget
- Edit and delete existing trips
- View all trips on the dashboard
- See trip details including tasks, expenses, and map

### Task System
- Add tasks with title, description, and due date
- Mark tasks as completed or pending
- Filter tasks by status
- Edit and delete tasks
- Tasks linked to specific trips

### Budget Tracking
- Add expenses by category
- Real-time budget vs. spent calculation
- Visual progress bar
- Expense history with dates and descriptions
- Over-budget warnings

### Maps & Places
- Interactive Leaflet maps
- Automatic geocoding of destinations
- Add custom markers for hotels, restaurants, attractions
- View all trip locations on a global map
- Click-to-add place markers

### Calendar View
- Monthly calendar display
- Trips shown on their date ranges
- Tasks displayed on due dates
- Click dates to see details
- Navigate between months

### Weather Integration
- Current weather conditions
- Temperature, humidity, and wind speed
- Free API from Open-Meteo (no key required)
- Automatic location lookup

## Design Philosophy

The application follows modern SaaS design principles:

- **Split-screen layouts** for login/register pages
- **Gradient backgrounds** with blue and pink tones
- **Card-based interfaces** for content organization
- **Consistent dark theme** across all pages
- **Smooth transitions** and hover effects
- **Responsive design** for all screen sizes
- **Clear visual hierarchy** with proper spacing
- **Accessible color contrast** for readability

## API Integration

### Weather API (Open-Meteo)
- Free, no API key required
- Provides current weather conditions
- Used for trip destination forecasts

### Geocoding (OpenStreetMap Nominatim)
- Free geocoding service
- Converts addresses to coordinates
- Used for map positioning

## Security

- All database operations secured with Row Level Security (RLS)
- JWT-based authentication
- Password hashing by Supabase Auth
- Protected API routes
- Client-side route protection
- No sensitive data in client code

## Environment Variables

All required environment variables are pre-configured in `.env`:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Future Enhancements

Potential features to add:
- Trip sharing and collaboration
- Photo uploads for trips
- Itinerary planning with time slots
- Travel recommendations
- Export trip data (PDF/CSV)
- Mobile app version
- Push notifications
- Social features

## License

This project is created for educational purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the project repository.
