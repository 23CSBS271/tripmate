import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { TaskList } from '../components/TaskList';
import { ExpenseTracker } from '../components/ExpenseTracker';
import { PlacesMap } from '../components/PlacesMap';
import { WeatherWidget } from '../components/WeatherWidget';
import { Recommendations } from '../components/Recommendations';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { getDefaultTripPhoto } from '../lib/photoService';
import { ArrowLeft, MapPin, Calendar, Edit } from 'lucide-react';

export const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          navigate('/dashboard');
          return;
        }
        throw new Error('Failed to fetch trip');
      }

      const data = await response.json();
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen page-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const backgroundImage = trip.photoUrl || getDefaultTripPhoto();

  return (
    <div className="min-h-screen page-background">
      <Navbar />

      <div
        className="h-80 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-gray-900"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">{trip.destination}</h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              {trip.budget > 0 && (
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm">Budget: <span className="font-semibold">${trip.budget}</span></span>
                </div>
              )}
            </div>
            {trip.notes && (
              <p className="mt-4 text-white/80 max-w-3xl">{trip.notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <WeatherWidget destination={trip.destination} />
          </div>
          <div>
            <ExpenseTracker tripId={trip._id} budget={trip.budget} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 overflow-hidden mb-6 shadow-md">
          <div className="border-b border-blue-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'tasks'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
                }`}
              >
                Tasks & To-Do
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'map'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
                }`}
              >
                Map & Places
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && <TaskList tripId={trip._id} />}
            {activeTab === 'map' && <PlacesMap trip={trip} />}
          </div>
        </div>

        <Recommendations destination={trip.destination} />
      </div>
    </div>
  );
};
