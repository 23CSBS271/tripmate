import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Search, Navigation, X, Hotel, UtensilsCrossed, MapPinned, Loader2, Landmark, ArrowRight, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, zoom, selectedTrip }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (selectedTrip) {
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const pos = layer.getLatLng();
            if (pos.lat === selectedTrip.lat && pos.lng === selectedTrip.lon) {
              layer.openPopup();
            }
          }
        });
      }, 1600);
    }
  }, [selectedTrip, map]);

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

export const MapView = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]); // Default center
  const [mapZoom, setMapZoom] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState({ hotels: [], restaurants: [], attractions: [] });
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [userLocationName, setUserLocationName] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [customDestinationMarker, setCustomDestinationMarker] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeSearchDistance, setRouteSearchDistance] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { user } = useAuth();
  const markerRefs = useRef({});
  const suggestionsTimeoutRef = useRef(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        await fetchTrips();
      } catch (err) {
        console.error('Failed to load trips:', err);
        setLoading(false);
      }
    };
    
    loadTrips();
    // Auto-initialize geolocation on page load with forced refresh
    requestUserLocation(true);
  }, [user]);

  const reverseGeocodeLocation = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to reverse geocode');
      
      const data = await response.json();
      
      if (data && data.address) {
        // Try to get the most specific location name, preferring smaller administrative units
        const locationName =
          data.address.town ||
          data.address.village ||
          data.address.city ||
          data.address.county ||
          data.address.state ||
          'Current Location';
        setUserLocationName(locationName);
        console.log('Location detected:', locationName);
      }
    } catch (error) {
      console.error('Error reverse geocoding location:', error);
      setUserLocationName('Current Location');
    }
  };

  const requestUserLocation = (forceRefresh = false) => {
    if ('geolocation' in navigator) {
      setGettingLocation(true);
      setUserLocationName('Detecting location...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('✓ Geolocation success - Accuracy:', accuracy, 'meters');
          console.log('✓ Current position:', latitude, longitude);
          console.log('Geolocation position object:', position);
          setLocationAccuracy(accuracy);
          setUserLocation({ lat: latitude, lon: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setGettingLocation(false);

          // Reverse geocode to get location name
          reverseGeocodeLocation(latitude, longitude);
        },
        (error) => {
          console.warn('✗ Geolocation error:', error.code, error.message);
          
          // Provide user-friendly error messages
          let errorMsg = 'Unable to detect location';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied. Please enable it in browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          
          console.warn(errorMsg);
          setUserLocationName(errorMsg);
          
          // Fallback to default location - this allows the map to still work
          setMapCenter([20, 0]); // Centered roughly on world map
          setMapZoom(4);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: forceRefresh ? 0 : 300000 // Force refresh if requested
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setErrorMessage('Geolocation is not supported by your browser.');
      setShowErrorModal(true);
      setUserLocationName('Geolocation not supported');
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Filter to only show non-completed and in-progress trips
      const activeTrips = trips.filter(trip => {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const today = new Date();
        
        // Normalize all dates to start of day for comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Show if trip has not ended (today <= endDate) AND status is not 'completed'
        const hasNotEnded = today <= endDate;
        const isNotCompleted = trip.status !== 'completed';
        const isActive = hasNotEnded && isNotCompleted;
        
        console.log(`Trip ${trip.destination}: start=${trip.startDate}, end=${trip.endDate}, status=${trip.status}, hasNotEnded=${hasNotEnded}, isNotCompleted=${isNotCompleted}, isActive=${isActive}`);
        
        return isActive;
      });
      console.log('Filtered active trips:', activeTrips.map(t => t.destination));
      setFilteredTrips(activeTrips);
    } else {
      const activeTrips = trips.filter(trip => {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const today = new Date();
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const hasNotEnded = today <= endDate;
        const isNotCompleted = trip.status !== 'completed';
        const isActive = hasNotEnded && isNotCompleted;
        
        const matchesSearch = trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return isActive && matchesSearch;
      });
      setFilteredTrips(activeTrips);
    }
  }, [searchQuery, trips]);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch trips');

      const data = await response.json();
      console.log(`Fetched ${(data || []).length} trips from API`);

      // Add trips immediately without waiting for geocoding
      const initialTrips = (data || []).map(trip => ({
        ...trip,
        id: trip._id,
        lat: null,
        lon: null,
        places: [],
      }));
      
      setTrips(initialTrips);
      setLoading(false);
      
      // Optional: Geocode in background silently (non-blocking) - removed for now to ensure instant load
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const geocodeDestination = async (destination) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          destination
        )}&limit=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data && data[0] ? { 
          lat: parseFloat(data[0].lat), 
          lon: parseFloat(data[0].lon) 
        } : null;
      }
      return null;
    } catch (err) {
      console.warn(`Geocoding error for ${destination}:`, err.message);
      return null;
    }
  };

  const fetchDestinationSuggestions = async (input) => {
    if (!input.trim() || input.trim().length < 2) {
      setDestinationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=10`
      );
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const suggestions = data.map((item) => ({
          name: item.name || item.display_name,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type || 'location'
        }));
        setDestinationSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setDestinationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setDestinationSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleDestinationInputChange = (value) => {
    setCustomDestination(value);
    
    // Clear previous timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    // Debounce API calls - wait 300ms after user stops typing
    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchDestinationSuggestions(value);
    }, 300);
  };

  const selectDestinationSuggestion = (suggestion) => {
    setCustomDestination(suggestion.name);
    setShowSuggestions(false);
    setCustomDestinationMarker({
      lat: suggestion.lat,
      lon: suggestion.lon,
      name: suggestion.name,
      display_name: suggestion.display_name
    });
    setMapCenter([suggestion.lat, suggestion.lon]);
    setMapZoom(12);

    // Create route from user location to destination
    if (userLocation) {
      setRouteCoordinates([
        [userLocation.lat, userLocation.lon],
        [suggestion.lat, suggestion.lon]
      ]);
      
      // Calculate distance
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        suggestion.lat,
        suggestion.lon
      );
      setRouteSearchDistance(distance);
    } else {
      setErrorMessage('Please enable location services to see the route and distance');
      setShowErrorModal(true);
      setRouteCoordinates([]);
      setRouteSearchDistance(null);
    }
  };

  const searchCustomDestination = async (destination) => {
    if (!destination.trim()) {
      setErrorMessage('Please enter a destination name');

      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        const destLat = parseFloat(lat);
        const destLon = parseFloat(lon);
        
        setCustomDestinationMarker({
          lat: destLat,
          lon: destLon,
          name: destination,
          display_name: display_name
        });
        setMapCenter([destLat, destLon]);
        setMapZoom(12);
        setCustomDestination('');

        // Create route from user location to destination
        if (userLocation) {
          setRouteCoordinates([
            [userLocation.lat, userLocation.lon],
            [destLat, destLon]
          ]);
          
          // Calculate distance
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            destLat,
            destLon
          );
          setRouteSearchDistance(distance);
        } else {
          setErrorMessage('Please enable location services to see the route and distance');
          setShowErrorModal(true);
          setRouteCoordinates([]);
          setRouteSearchDistance(null);
        }
      } else {
        setErrorMessage('Destination not found. Please try another name.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error searching destination:', error);
      setErrorMessage('Error searching destination. Please try again.');
      setShowErrorModal(true);
    }
  };

  const fetchNearbyPlaces = async (lat, lon, destination) => {
    setLoadingNearby(true);
    setShowNearbyModal(true);

    try {
      const radius = 10000;
      const overpassTimeout = 45; // seconds for each Overpass query (increased from 30)

      // Simplified hotels query to avoid 504 errors
      const hotelsQuery = `
        [out:json][timeout:${overpassTimeout}];
        (
          node["tourism"="hotel"](around:${radius},${lat},${lon});
          way["tourism"="hotel"](around:${radius},${lat},${lon});
          node["tourism"="guest_house"](around:${radius},${lat},${lon});
          way["tourism"="guest_house"](around:${radius},${lat},${lon});
          node["tourism"="hostel"](around:${radius},${lat},${lon});
          way["tourism"="hostel"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      const restaurantsQuery = `
        [out:json][timeout:${overpassTimeout}];
        (
          node["amenity"="restaurant"](around:${radius},${lat},${lon});
          way["amenity"="restaurant"](around:${radius},${lat},${lon});
          node["amenity"="cafe"](around:${radius},${lat},${lon});
          way["amenity"="cafe"](around:${radius},${lat},${lon});
          node["amenity"="fast_food"](around:${radius},${lat},${lon});
          way["amenity"="fast_food"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      // Simplified attractions query to avoid 504 errors
      const attractionsQuery = `
        [out:json][timeout:${overpassTimeout}];
        (
          node["tourism"="attraction"](around:${radius},${lat},${lon});
          way["tourism"="attraction"](around:${radius},${lat},${lon});
          node["tourism"="museum"](around:${radius},${lat},${lon});
          way["tourism"="museum"](around:${radius},${lat},${lon});
          node["tourism"="viewpoint"](around:${radius},${lat},${lon});
          way["tourism"="viewpoint"](around:${radius},${lat},${lon});
          node["leisure"="park"](around:${radius},${lat},${lon});
          way["leisure"="park"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      console.log('Fetching nearby places for location:', lat, lon);

      // Fetch with improved retry logic for 504 errors
      const fetchWithTimeout = (query, type, retries = 3) => {
        return new Promise((resolve) => {
          const attemptFetch = (retryCount) => {
            const timeoutId = setTimeout(() => {
              console.warn(`${type} query timed out (attempt ${4 - retryCount})`);
              if (retryCount > 0) {
                const delayMs = 3000 * (4 - retryCount); // 3s, 6s, 9s delay
                console.log(`Retrying ${type} in ${delayMs}ms...`);
                setTimeout(() => attemptFetch(retryCount - 1), delayMs);
              } else {
                resolve({ ok: false, data: { elements: [] } });
              }
            }, 60000); // 60 second timeout per request (increased from 40s)

            fetch('https://overpass-api.de/api/interpreter', {
              method: 'POST',
              body: query,
            })
              .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                  console.error(`${type} response not ok:`, response.status);
                  // Retry on 504, 503, 502, 429 (server errors and rate limit)
                  if (retryCount > 0 && (response.status === 504 || response.status === 503 || response.status === 502 || response.status === 429)) {
                    const delayMs = response.status === 429 ? 4000 : 3000 * (4 - retryCount);
                    console.log(`${type} server error ${response.status}, retrying in ${delayMs}ms...`);
                    setTimeout(() => attemptFetch(retryCount - 1), delayMs);
                  } else {
                    resolve({ ok: false, data: { elements: [] } });
                  }
                } else {
                  response.json()
                    .then(data => {
                      console.log(`${type} fetched successfully:`, data.elements?.length || 0, 'results');
                      resolve({ ok: true, data });
                    })
                    .catch(err => {
                      console.error(`${type} JSON parse error:`, err);
                      resolve({ ok: false, data: { elements: [] } });
                    });
                }
              })
              .catch(err => {
                clearTimeout(timeoutId);
                console.error(`${type} fetch error:`, err);
                if (retryCount > 0) {
                  const delayMs = 3000 * (4 - retryCount);
                  console.log(`Retrying ${type} in ${delayMs}ms...`);
                  setTimeout(() => attemptFetch(retryCount - 1), delayMs);
                } else {
                  resolve({ ok: false, data: { elements: [] } });
                }
              });
          };
          
          attemptFetch(retries);
        });
      };

      // Fetch all three with staggered delays to avoid rate limiting
      console.log('Starting nearby places fetch for:', lat, lon);
      const hotelsResult = await fetchWithTimeout(hotelsQuery, 'Hotels');
      await new Promise(r => setTimeout(r, 1000)); // 1 second delay between requests
      
      const restaurantsResult = await fetchWithTimeout(restaurantsQuery, 'Restaurants');
      await new Promise(r => setTimeout(r, 1000)); // 1 second delay between requests
      
      const attractionsResult = await fetchWithTimeout(attractionsQuery, 'Attractions');

      const hotelsData = hotelsResult.ok ? hotelsResult.data : { elements: [] };
      const restaurantsData = restaurantsResult.ok ? restaurantsResult.data : { elements: [] };
      const attractionsData = attractionsResult.ok ? attractionsResult.data : { elements: [] };

      const hotels = (hotelsData.elements || [])
        .filter(place => place.tags && place.tags.name)
        .map(place => ({
          name: place.tags.name || 'Unnamed Hotel',
          type: place.tags.tourism || 'hotel',
          lat: place.lat || place.center?.lat,
          lon: place.lon || place.center?.lon,
        }))
        .filter(place => place.lat && place.lon);

      const restaurants = (restaurantsData.elements || [])
        .filter(place => place.tags && place.tags.name)
        .map(place => ({
          name: place.tags.name || 'Unnamed Restaurant',
          type: place.tags.cuisine || place.tags.amenity || 'restaurant',
          lat: place.lat || place.center?.lat,
          lon: place.lon || place.center?.lon,
        }))
        .filter(place => place.lat && place.lon);

      const attractions = (attractionsData.elements || [])
        .filter(place => place.tags && (place.tags.name || place.tags.historic))
        .map(place => ({
          name: place.tags.name || place.tags.historic || 'Unnamed Attraction',
          type: place.tags.tourism || place.tags.historic || place.tags.leisure || place.tags.amenity || 'attraction',
          lat: place.lat || place.center?.lat,
          lon: place.lon || place.center?.lon,
        }))
        .filter(place => place.lat && place.lon);

      console.log('Nearby places found:', { 
        hotels: hotels.length, 
        restaurants: restaurants.length, 
        attractions: attractions.length 
      });

      setNearbyPlaces({
        hotels: hotels.slice(0, 20),
        restaurants: restaurants.slice(0, 20),
        attractions: attractions.slice(0, 20),
        destination,
      });
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setNearbyPlaces({
        hotels: [],
        restaurants: [],
        attractions: [],
        destination,
      });
      setErrorMessage('Could not fetch nearby places. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleTripClick = async (trip) => {
    // If trip doesn't have coordinates, geocode it now
    if (!trip.lat || !trip.lon) {
      try {
        const coords = await geocodeDestination(trip.destination);
        if (!coords) {
          setErrorMessage('Could not locate this destination. Please try again.');
          setShowErrorModal(true);
          return;
        }
        
        // Update trip with coordinates in state
        const updatedTrip = { ...trip, lat: coords.lat, lon: coords.lon };
        
        // Update trips state so marker appears on map
        setTrips(prevTrips => 
          prevTrips.map(t => t.id === trip.id ? updatedTrip : t)
        );
        
        trip = updatedTrip;
      } catch (err) {
        setErrorMessage('Error locating destination. Please try again.');
        setShowErrorModal(true);
        return;
      }
    }

    setSelectedTrip(trip);
    setMapCenter([trip.lat, trip.lon]);
    setMapZoom(12);

    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        trip.lat,
        trip.lon
      );
      setRouteDistance(distance);
    }
  };

  const handleMarkerClick = async (trip) => {
    await handleTripClick(trip);
    // Fetch nearby places after trip is located
    if (trip.lat && trip.lon) {
      fetchNearbyPlaces(trip.lat, trip.lon, trip.destination);
    }
  };

  const handleGetCurrentLocation = () => {
    requestUserLocation(true);
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) {
      setErrorMessage('Please enter a location');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`
      );
      const data = await response.json();

      if (data && data[0]) {
        const { lat, lon } = data[0];
        setUserLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(15);
        setShowLocationModal(false);
        setManualLocation('');

        if (selectedTrip) {
          const distance = calculateDistance(parseFloat(lat), parseFloat(lon), selectedTrip.lat, selectedTrip.lon);
          setRouteDistance(distance);
        }
      } else {
        setErrorMessage('Location not found. Please try a different search term.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error geocoding manual location:', error);
      setErrorMessage('Error finding location. Please try again.');
      setShowErrorModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    // Handle ISO 8601 format (e.g., "2026-01-16")
    const dateObj = new Date(dateString + 'T00:00:00');
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
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

  const routeDisplayCoordinates = userLocation && selectedTrip
    ? [[userLocation.lat, userLocation.lon], [selectedTrip.lat, selectedTrip.lon]]
    : [];

  return (
    <div className="min-h-screen page-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interactive Map View
          </h1>
          <p className="text-gray-600">Explore destinations with nearby hotels, restaurants, and tourist attractions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-blue-200 shadow-md mb-4 p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search destination and create route..."
                    value={customDestination}
                    onChange={(e) => handleDestinationInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchCustomDestination(customDestination)}
                    onFocus={() => customDestination.trim().length >= 2 && setShowSuggestions(true)}
                    className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  
                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && destinationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-xl shadow-lg z-[1001] max-h-64 overflow-y-auto custom-scrollbar">
                      {loadingSuggestions && (
                        <div className="p-3 text-center text-gray-600 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Loading suggestions...
                        </div>
                      )}
                      {destinationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => selectDestinationSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">{suggestion.name}</div>
                              <div className="text-xs text-gray-600 truncate">{suggestion.display_name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {customDestination && (
                    <button
                      onClick={() => {
                        setCustomDestination('');
                        setRouteCoordinates([]);
                        setRouteSearchDistance(null);
                        setCustomDestinationMarker(null);
                        setDestinationSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => searchCustomDestination(customDestination)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-blue-200 shadow-md relative">
              <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                {userLocation && (
                  <div className="bg-white rounded-xl px-4 py-2 shadow-md border border-blue-200">
                    <div className="text-xs text-gray-600">Your Location:</div>
                    <div className="text-sm font-semibold text-blue-600">{userLocationName || 'Detecting...'}</div>
                  </div>
                )}
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="bg-white hover:bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-medium transition-all shadow-md border border-blue-200 flex items-center gap-2"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Navigation className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="text-sm">My Location</span>
                </button>
              </div>

              <div style={{ height: '650px' }}>
                {mapCenter && (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-2xl z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                  <MapController center={mapCenter} zoom={mapZoom} selectedTrip={selectedTrip} />

                  {userLocation && (
                    <>
                      <Circle
                        center={[userLocation.lat, userLocation.lon]}
                        radius={500}
                        pathOptions={{
                          color: '#10b981',
                          fillColor: '#10b981',
                          fillOpacity: 0.1,
                          weight: 2,
                        }}
                      />
                      <Marker
                        position={[userLocation.lat, userLocation.lon]}
                        icon={greenIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong className="block mb-1">Your Location</strong>
                            <span className="text-gray-600">{userLocationName || 'Current position'}</span>
                            {locationAccuracy && (
                              <div className="text-xs text-gray-500 mt-1">
                                Accuracy: ±{Math.round(locationAccuracy)}m
                              </div>
                            )}
                            <button
                              onClick={() => requestUserLocation(true)}
                              className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded w-full transition-colors"
                            >
                              Refresh Location
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {filteredTrips.map((trip) => {
                    // Skip rendering marker if no coordinates
                    if (!trip.lat || !trip.lon) {
                      return null;
                    }
                    
                    const isSelected = selectedTrip?.id === trip.id;
                    const icon = isSelected ? goldIcon : blueIcon;

                    return (
                      <Marker
                        key={trip.id}
                        position={[trip.lat, trip.lon]}
                        icon={icon}
                        ref={(ref) => {
                          if (ref) {
                            markerRefs.current[trip.id] = ref;
                          }
                        }}
                        eventHandlers={{
                          click: () => handleMarkerClick(trip),
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[200px]">
                            <strong className="block mb-2 text-base">{trip.destination}</strong>
                            {trip.notes && (
                              <p className="text-gray-700 text-xs mb-2 border-t pt-2">
                                {trip.notes.substring(0, 100)}
                                {trip.notes.length > 100 && '...'}
                              </p>
                            )}
                            {trip.budget > 0 && (
                              <div className="text-blue-600 font-semibold mb-2">
                                Budget: ${trip.budget}
                              </div>
                            )}
                            <button
                              onClick={() => fetchNearbyPlaces(trip.lat, trip.lon, trip.destination)}
                              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <MapPinned className="w-3 h-3" />
                              View Nearby Places
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {customDestinationMarker && (
                    <Marker
                      position={[customDestinationMarker.lat, customDestinationMarker.lon]}
                      icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                      })}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong className="block mb-1">{customDestinationMarker.name}</strong>
                          <span className="text-gray-600 text-xs">{customDestinationMarker.display_name}</span>
                          <button
                            onClick={() => setCustomDestinationMarker(null)}
                            className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {routeCoordinates.length === 2 && (
                    <Polyline
                      positions={routeCoordinates}
                      color="#ef4444"
                      weight={4}
                      opacity={0.8}
                      dashArray="5, 5"
                    />
                  )}

                  {routeDisplayCoordinates.length === 2 && (
                    <Polyline
                      positions={routeDisplayCoordinates}
                      color="#3b82f6"
                      weight={4}
                      opacity={0.7}
                      dashArray="10, 10"
                    />
                  )}
                  </MapContainer>
                )}
              </div>
            </div>

            {userLocation && selectedTrip && routeDistance && (
              <div className="mt-4 bg-white border border-blue-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">Route Distance</div>
                    <div className="text-blue-600 text-sm">
                      Your Location → {selectedTrip.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {routeDistance.toFixed(1)} km
                    </div>
                    <div className="text-xs text-gray-600">
                      {(routeDistance * 0.621371).toFixed(1)} miles
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userLocation && routeSearchDistance && customDestinationMarker && (
              <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-600 p-2 rounded-lg">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">Search Route Distance</div>
                    <div className="text-red-700 text-sm">
                      Your Location → {customDestinationMarker.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {routeSearchDistance.toFixed(1)} km
                    </div>
                    <div className="text-xs text-gray-600">
                      {(routeSearchDistance * 0.621371).toFixed(1)} miles
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-md">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Your Trips</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Destinations ({filteredTrips.length})
                </h3>
              </div>

              {filteredTrips.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    {searchQuery ? 'No destinations found' : 'No trips to display'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTrips.map((trip) => {
                    const isSelected = selectedTrip?.id === trip.id;

                    return (
                      <div
                        key={trip.id}
                        className={`group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'bg-blue-100 text-blue-900 border-2 border-blue-500 shadow-md'
                            : 'bg-blue-50 hover:bg-blue-100 text-gray-900 border border-blue-200'
                        }`}
                      >
                        <div
                          onClick={() => handleTripClick(trip)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{trip.destination}</h4>
                              {trip.notes && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {trip.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {trip.places && trip.places.length > 0 && (
                          <div className="mt-3 ml-8 space-y-2">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              Places to visit ({trip.places.length}):
                            </div>
                            {trip.places.map((place) => (
                              <div
                                key={place._id}
                                className="flex items-center gap-2 text-xs text-gray-600 bg-white/50 rounded-lg p-2 border border-blue-100"
                              >
                                <Landmark className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{place.name}</div>
                                  <div className="text-gray-500 capitalize">{place.type}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedTrip && (
              <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-md animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Selected Trip
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Destination</div>
                    <div className="text-gray-900 font-semibold text-lg">{selectedTrip.destination}</div>
                  </div>
                  {selectedTrip.budget > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Budget</div>
                      <div className="text-green-600 font-semibold text-lg">
                        ${selectedTrip.budget}
                      </div>
                    </div>
                  )}
                  {selectedTrip.notes && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Notes</div>
                      <div className="text-gray-900 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {selectedTrip.notes}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => fetchNearbyPlaces(selectedTrip.lat, selectedTrip.lon, selectedTrip.destination)}
                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <MapPinned className="w-4 h-4" />
                    View Nearby Places
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNearbyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={() => setShowNearbyModal(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-blue-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-blue-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPinned className="w-6 h-6 text-blue-600" />
                  Nearby Places
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {nearbyPlaces.destination}
                </p>
              </div>
              <button
                onClick={() => setShowNearbyModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)] custom-scrollbar">
              {loadingNearby ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-700">Finding nearby places...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-purple-600" />
                      Hotels ({nearbyPlaces.hotels?.length || 0})
                    </h3>
                    {nearbyPlaces.hotels?.length > 0 ? (
                      <div className="space-y-3">
                        {nearbyPlaces.hotels.map((hotel, index) => (
                          <div key={`hotel-${index}`} className="bg-white border border-blue-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all">
                            <h5 className="font-semibold text-gray-900 mb-1">{hotel.name}</h5>
                            <p className="text-xs text-gray-700 capitalize">{hotel.type}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-xl">
                        <Hotel className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No hotels found nearby</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                      Restaurants ({nearbyPlaces.restaurants?.length || 0})
                    </h3>
                    {nearbyPlaces.restaurants?.length > 0 ? (
                      <div className="space-y-3">
                        {nearbyPlaces.restaurants.map((restaurant, index) => (
                          <div key={`restaurant-${index}`} className="bg-white border border-blue-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all">
                            <h5 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h5>
                            <p className="text-xs text-gray-700 capitalize">{restaurant.type}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-xl">
                        <UtensilsCrossed className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No restaurants found nearby</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blue-600" />
                      Tourist Attractions ({nearbyPlaces.attractions?.length || 0})
                    </h3>
                    {nearbyPlaces.attractions?.length > 0 ? (
                      <div className="space-y-3">
                        {nearbyPlaces.attractions.map((attraction, index) => (
                          <div key={index} className="bg-white border border-blue-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all">
                            <h4 className="font-semibold text-gray-900 mb-1">{attraction.name}</h4>
                            <p className="text-sm text-gray-700 capitalize">{attraction.type}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-xl">
                        <Landmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No attractions found nearby</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={() => setShowLocationModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Set Your Location
                </h2>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your current location
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g., Chamrajnagar, Karnataka"
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleManualLocation}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    Set Location
                  </button>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="px-6 py-3 border border-blue-200 text-gray-700 rounded-xl hover:bg-blue-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background-color: white;
        }
      `}</style>

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
