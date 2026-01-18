import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Edit, Trash2, ChevronRight } from 'lucide-react';
import { getDefaultTripPhoto } from '../lib/photoService';

export const TripCard = ({ trip, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // If today is after the end date, the trip is completed
    if (today > end) return 'Completed';

    // If today is between start and end, trip is in progress
    if (today >= start && today <= end) return 'In progress';

    // If today is before start date, calculate days until
    const diff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const isCompleted = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(trip.endDate);
    end.setHours(0, 0, 0, 0);
    
    return today > end || trip.status === 'completed';
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(trip);
    setDeleting(false);
  };

  const backgroundImage = trip.photoUrl || getDefaultTripPhoto();

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-elegant-lg transition-shadow border border-primary-200 card-shadow">
      <div
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{trip.destination}</h3>
            <div className={`inline-block px-3 py-1 backdrop-blur-sm text-white text-xs rounded-full font-medium ${
              isCompleted() ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              {getDaysUntil(trip.startDate, trip.endDate)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
        </div>

        {trip.notes && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.notes}</p>
        )}

        {trip.budget > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
            <div className="text-xs text-gray-600 mb-1">Budget</div>
            <div className="text-lg font-semibold text-gray-900">${trip.budget}</div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/trip/${trip._id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition shadow-elegant bg-blue-600 hover:bg-blue-700"
          >
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(trip)}
            className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-red-100 hover:text-red-700 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
