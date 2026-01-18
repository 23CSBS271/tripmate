import { useState, useEffect, useRef } from 'react';
import { Hotel, Utensils, Star, MapPin, Loader } from 'lucide-react';

export const Recommendations = ({ destination }) => {
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchRecommendations();

    return () => {
      isMounted.current = false;
    };
  }, [destination]);

  const fetchRecommendations = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      
      if (!geoResponse.ok) throw new Error('Failed to geocode destination');
      
      const geoData = await geoResponse.json();

      if (!geoData || !geoData[0]) {
        throw new Error('Destination not found');
      }

      if (!isMounted.current) return;

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const radius = 5000;

      const hotelsQuery = `
        [out:json][timeout:30];
        (
          node["tourism"="hotel"](around:${radius},${lat},${lon});
          way["tourism"="hotel"](around:${radius},${lat},${lon});
        );
        out geom;
      `;

      const restaurantsQuery = `
        [out:json][timeout:30];
        (
          node["amenity"="restaurant"](around:${radius},${lat},${lon});
          way["amenity"="restaurant"](around:${radius},${lat},${lon});
        );
        out geom;
      `;

      // Fetch with error handling for each request
      let hotelsData = null;
      let restaurantsData = null;

      try {
        const hotelsResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: hotelsQuery,
          signal: AbortSignal.timeout(35000)
        });

        if (!hotelsResponse.ok) {
          console.warn('Hotels API error:', hotelsResponse.status);
        } else {
          hotelsData = await hotelsResponse.json();
        }
      } catch (err) {
        console.warn('Hotels fetch error:', err);
      }

      try {
        const restaurantsResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: restaurantsQuery,
          signal: AbortSignal.timeout(35000)
        });

        if (!restaurantsResponse.ok) {
          console.warn('Restaurants API error:', restaurantsResponse.status);
        } else {
          restaurantsData = await restaurantsResponse.json();
        }
      } catch (err) {
        console.warn('Restaurants fetch error:', err);
      }

      if (!isMounted.current) return;

      // Function to check if text is primarily in English
      const isEnglish = (text) => {
        if (!text) return false;
        // Check if text contains primarily ASCII characters and common English words
        const englishChars = (text.match(/[a-zA-Z0-9\s\-&.,()]/g) || []).length;
        const totalChars = text.length;
        return englishChars / totalChars > 0.7; // At least 70% English-like characters
      };

      const processedHotels = (hotelsData?.elements || [])
        .filter((el) => el.tags && el.tags.name && isEnglish(el.tags.name))
        .slice(0, 10)
        .map((el) => ({
          id: el.id,
          name: el.tags.name,
          type: 'Hotel',
          rating: el.tags.stars || 'N/A',
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }));

      const processedRestaurants = (restaurantsData?.elements || [])
        .filter((el) => el.tags && el.tags.name && isEnglish(el.tags.name))
        .slice(0, 10)
        .map((el) => ({
          id: el.id,
          name: el.tags.name,
          type: el.tags.cuisine || 'Restaurant',
          rating: 'N/A',
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }));

      if (isMounted.current) {
        setHotels(processedHotels);
        setRestaurants(processedRestaurants);
        
        if (processedHotels.length === 0 && processedRestaurants.length === 0) {
          setError('No recommendations found for this destination. Try checking online travel sites.');
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      if (isMounted.current) {
        setError(`Unable to load recommendations: ${err.message}`);
        // Keep existing data if available
        if (hotels.length === 0 && restaurants.length === 0) {
          setHotels([]);
          setRestaurants([]);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const currentData = activeTab === 'hotels' ? hotels : restaurants;
  const Icon = activeTab === 'hotels' ? Hotel : Utensils;

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-md">
      <div className="border-b border-blue-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'hotels'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Hotel className="w-4 h-4" />
              <span>Hotels</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'restaurants'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Utensils className="w-4 h-4" />
              <span>Restaurants</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-12">
            <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700">No {activeTab} found in this area</p>
            <p className="text-gray-600 text-sm mt-2">Try checking online travel sites for options</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentData.map((item) => (
              <div
                key={item.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white border border-blue-200 text-gray-700 px-2 py-1 rounded">
                        {item.type}
                      </span>
                      {item.rating !== 'N/A' && (
                        <div className="flex items-center gap-1 text-yellow-600 text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
