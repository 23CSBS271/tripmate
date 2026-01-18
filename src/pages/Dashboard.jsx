import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { TripCard } from '../components/TripCard';
import { TripModal } from '../components/TripModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Loader, AlertCircle, Search, X, MapPin } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, tripId: null, tripName: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch trips');

      const data = await response.json();
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setShowModal(true);
  };

  const handleDelete = (trip) => {
    setDeleteConfirm({
      show: true,
      tripId: trip._id,
      tripName: trip.destination
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips/${deleteConfirm.tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete trip');

      setTrips(trips.filter((t) => t._id !== deleteConfirm.tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      setErrorMessage('Failed to delete trip');
      setShowErrorModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTrip(null);
    fetchTrips();
  };

  return (
    <div className="min-h-screen rich-gradient">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Plan and manage your upcoming adventures</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trips by destination, notes, or budget..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-md border border-blue-100">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">
                Start planning your next adventure by creating your first trip
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md"
              >
                Create Your First Trip
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filtered results info */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-600">
                Found {trips.filter(trip => 
                  trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (trip.budget && trip.budget.toString().includes(searchQuery))
                ).length} of {trips.length} trips
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips
                .filter(trip => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    trip.destination.toLowerCase().includes(query) ||
                    (trip.notes && trip.notes.toLowerCase().includes(query)) ||
                    (trip.budget && trip.budget.toString().includes(query))
                  );
                })
                .sort((a, b) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  // Helper function to calculate days until trip
                  const getDaysUntilTrip = (trip) => {
                    const startDate = new Date(trip.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(trip.endDate);
                    endDate.setHours(0, 0, 0, 0);

                    if (trip.status === 'completed') {
                      return Infinity; // Completed trips go to the end
                    } else if (today >= startDate && today <= endDate) {
                      // Ongoing trip - return days until end
                      return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    } else if (today < startDate) {
                      // Upcoming trip - return days until start
                      return Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                    }
                    return Infinity; // Past trips without completion status
                  };

                  const daysA = getDaysUntilTrip(a);
                  const daysB = getDaysUntilTrip(b);

                  // Sort by days (ascending), completed trips (Infinity) go to end
                  return daysA - daysB;
                })
                .map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </div>

            {searchQuery && trips.filter(trip => 
              trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (trip.budget && trip.budget.toString().includes(searchQuery))
            ).length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No trips found matching "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <TripModal
          trip={editingTrip}
          onClose={handleModalClose}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, tripId: null, tripName: '' })}
        onConfirm={confirmDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete "${deleteConfirm.tripName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
