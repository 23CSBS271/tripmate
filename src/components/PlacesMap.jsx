import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Plus, MapPin, Trash2, Hotel, Utensils, Landmark, AlertCircle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
}

export const PlacesMap = ({ trip }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [center, setCenter] = useState([40.7128, -74.0060]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    notes: '',
    latitude: '',
    longitude: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, placeId: null, placeName: '' });

  useEffect(() => {
    fetchPlaces();
    geocodeDestination();
  }, [trip]);

  const geocodeDestination = async () => {
    // Check cache first
    const cacheKey = `geocode_${trip.destination}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { lat, lon, timestamp } = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setCenter([parseFloat(lat), parseFloat(lon)]);
        return;
      }
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCenter([lat, lon]);

        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          lat,
          lon,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error geocoding destination:', error);
      // Fallback to default center if geocoding fails
      setCenter([40.7128, -74.0060]);
    }
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/places/trip/${trip._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch places');

      const data = await response.json();
      setPlaces(data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
      // Don't clear places on error - keep existing places visible
      // This prevents places from disappearing if there's a temporary auth/network issue
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage('Please enter a place name');
      setShowErrorModal(true);
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setErrorMessage('Please provide location coordinates. Click on the map or enter coordinates manually.');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const placeData = {
        name: formData.name.trim(),
        type: formData.type,
        notes: formData.notes.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      console.log('Submitting place data:', placeData);

      const response = await fetch(`${API_BASE_URL}/places/trip/${trip._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(placeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add place');
      }

      setFormData({
        name: '',
        type: 'custom',
        notes: '',
        latitude: '',
        longitude: '',
      });
      setShowForm(false);
      fetchPlaces();
    } catch (error) {
      console.error('Error adding place:', error);
      setErrorMessage(`Failed to add place: ${error.message}`);
      setShowErrorModal(true);
    }
  };

  const handleMapClick = (e) => {
    // Reverse geocode to get place name
    const { lat, lng } = e.latlng;
    
    // Try to get place name from coordinates using reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(response => response.json())
      .then(data => {
        const placeName = data.address?.name || data.name || data.address?.city || data.address?.town || 'Location';
        setFormData({
          ...formData,
          name: placeName,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
        setShowForm(true);
      })
      .catch(() => {
        // Fallback if reverse geocoding fails
        setFormData({
          ...formData,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
        setShowForm(true);
      });
  };

  const handleDelete = (place) => {
    setDeleteConfirm({
      show: true,
      placeId: place._id,
      placeName: place.name
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/places/${deleteConfirm.placeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete place');

      fetchPlaces();
      setDeleteConfirm({ show: false, placeId: null, placeName: '' });
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  const getPlaceIcon = (type) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4" />;
      case 'attraction':
        return <Landmark className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading map...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Places & Destinations</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Eiffel Tower"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="attraction">Attraction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates *</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Latitude"
                  step="any"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Latitude</p>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Longitude"
                  step="any"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Longitude</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Additional notes..."
              rows="2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md font-medium"
            >
              Add Place
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: '', type: 'custom', notes: '', latitude: '', longitude: '' });
              }}
              className="px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition shadow-sm font-medium"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-600 bg-blue-100 p-2 rounded">
            💡 Click on the map to auto-fill coordinates, or enter them manually above.
          </p>
        </form>
      )}

      <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} />
          <MapClickHandler onMapClick={handleMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>{trip.destination}</Popup>
          </Marker>
          {places.map((place) => (
            <Marker
              key={place._id}
              position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{place.name}</strong>
                  <br />
                  <span className="text-gray-600">{place.type}</span>
                  {place.notes && (
                    <>
                      <br />
                      {place.notes}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="space-y-2">
        {places.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-gray-900 font-medium mb-3">Saved Places</h4>
            <div className="space-y-2">
              {places.map((place) => (
                <div
                  key={place._id}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-700">{getPlaceIcon(place.type)}</div>
                    <div>
                      <div className="text-gray-900 font-medium">{place.name}</div>
                      <div className="text-xs text-gray-600">{place.type}</div>
                      {place.notes && <div className="text-xs text-gray-600 mt-1">{place.notes}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(place)}
                    className="p-2 text-gray-600 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, placeId: null, placeName: '' })}
        onConfirm={confirmDelete}
        title="Delete Place"
        message={`Are you sure you want to delete "${deleteConfirm.placeName}"? This action cannot be undone.`}
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
