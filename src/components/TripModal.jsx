import { useState, useEffect } from 'react';
import { X, Upload, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDestinationPhoto } from '../lib/photoService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TripModal = ({ trip, onClose }) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingTrips, setExistingTrips] = useState([]);
  const [dateConflict, setDateConflict] = useState(null);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (trip) {
      setDestination(trip.destination);
      setStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(trip.endDate).toISOString().split('T')[0]);
      setNotes(trip.notes || '');
      setBudget(trip.budget || '');
      setPhotoUrl(trip.photoUrl || '');
      setDateConflict(null); // No conflict checking for editing existing trips
    } else {
      // Reset to default values for new trip
      const today = new Date().toISOString().split('T')[0];
      setDestination('');
      setStartDate(today);
      setEndDate(today);
      setNotes('');
      setBudget('');
      setPhotoUrl('');
      setDateConflict(null);
      fetchExistingTrips();
    }
  }, [trip]);

  const fetchExistingTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const trips = await response.json();
        setExistingTrips(trips);
        setTripsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching existing trips:', error);
    }
  };

  const checkDateConflict = (newStartDate, newEndDate) => {
    const start = new Date(newStartDate);
    const end = new Date(newEndDate);

    console.log('Checking conflict for dates:', newStartDate, 'to', newEndDate);
    console.log('Existing trips:', existingTrips.length);

    for (const existingTrip of existingTrips) {
      const existingStart = new Date(existingTrip.startDate);
      const existingEnd = new Date(existingTrip.endDate);

      console.log('Comparing with existing trip:', existingTrip.destination, existingTrip.startDate, 'to', existingTrip.endDate);

      // Check if dates overlap
      if (start <= existingEnd && end >= existingStart) {
        console.log('Conflict detected!');
        return {
          conflict: true,
          conflictingTrip: existingTrip
        };
      }
    }

    console.log('No conflict');
    return { conflict: false };
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Always check for conflicts when creating a new trip
    if (!trip && existingTrips.length > 0) {
      const conflict = checkDateConflict(newStartDate, endDate);
      setDateConflict(conflict.conflict ? conflict.conflictingTrip : null);
    } else if (!trip) {
      setDateConflict(null);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Always check for conflicts when creating a new trip
    if (!trip && existingTrips.length > 0) {
      const conflict = checkDateConflict(startDate, newEndDate);
      setDateConflict(conflict.conflict ? conflict.conflictingTrip : null);
    } else if (!trip) {
      setDateConflict(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check for date conflicts before submitting
    if (!trip && dateConflict) {
      setError('Cannot create trip due to date conflict. Please choose different dates.');
      return;
    }

    setLoading(true);

    try {
      // Use custom photo if provided, otherwise use auto-generated one
      const finalPhotoUrl = photoUrl.trim() || getDestinationPhoto(destination);

      const tripData = {
        destination,
        startDate,
        endDate,
        notes,
        budget: budget ? parseFloat(budget) : null,
        photoUrl: finalPhotoUrl,
        status: 'upcoming',
      };

      const token = localStorage.getItem('token');

      if (trip) {
        const response = await fetch(`${API_BASE_URL}/trips/${trip._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(tripData)
        });

        if (!response.ok) throw new Error('Failed to update trip');
      } else {
        const response = await fetch(`${API_BASE_URL}/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(tripData)
        });

        if (!response.ok) throw new Error('Failed to create trip');
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-blue-200">
        <div className="flex items-center justify-between p-6 border-b border-blue-200">
          <h2 className="text-xl font-bold text-gray-900">
            {trip ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {dateConflict && !trip && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
              <div className="font-medium mb-1">⚠️ Date Conflict Detected</div>
              <div>
                You already have a trip to <strong>{dateConflict.destination}</strong> from{' '}
                {new Date(dateConflict.startDate).toLocaleDateString()} to{' '}
                {new Date(dateConflict.endDate).toLocaleDateString()}.
              </div>
              <div className="mt-1 text-xs">
                Please choose different dates to avoid overlapping trips.
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paris, France"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateConflict && !trip ? 'border-yellow-300' : 'border-blue-200'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateConflict && !trip ? 'border-yellow-300' : 'border-blue-200'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (optional)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
              min="0"
            />
          </div>

          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Image className="w-4 h-4" />
              Trip Photo (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste photo URL or upload below..."
                className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="image/*"
                id="tripPhotoUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setPhotoUrl(event.target?.result || '');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('tripPhotoUpload')?.click()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            {photoUrl && (
              <div className="mt-2">
                <img
                  src={photoUrl}
                  alt="Trip preview"
                  className="w-full h-32 object-cover rounded-lg border border-blue-200"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add any additional details..."
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!trip && dateConflict)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
