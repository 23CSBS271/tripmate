const express = require('express');
const mongoose = require('mongoose');
const Place = require('../models/Place');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all places for a trip
router.get('/trip/:tripId', auth, async (req, res) => {
  try {
    // First check if the trip belongs to the user
    const Trip = require('../models/Trip');
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const places = await Place.find({ tripId: new mongoose.Types.ObjectId(req.params.tripId) });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new place
router.post('/trip/:tripId', auth, async (req, res) => {
  try {
    // First check if the trip belongs to the user
    const Trip = require('../models/Trip');
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const place = new Place({
      ...req.body,
      tripId: req.params.tripId
    });
    const savedPlace = await place.save();
    res.status(201).json(savedPlace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a place
router.put('/:id', auth, async (req, res) => {
  try {
    // First check if the place exists and belongs to a trip owned by the user
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });

    const Trip = require('../models/Trip');
    const trip = await Trip.findOne({ _id: place.tripId, userId: req.user.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPlace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a place
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if the place exists and belongs to a trip owned by the user
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });

    const Trip = require('../models/Trip');
    const trip = await Trip.findOne({ _id: place.tripId, userId: req.user.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: 'Place deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Places Proxy - Nearby Search
router.get('/google/nearby', async (req, res) => {
  const { lat, lon, type, radius } = req.query;
  // Try both variable names - with and without VITE_ prefix
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

  console.log('Google Nearby request:', { lat, lon, type, radius });
  console.log('Available env keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('API') || k.includes('VITE')).slice(0, 10));
  console.log('API_KEY found:', !!API_KEY);

  if (!API_KEY) {
    console.error('API key not found in environment');
    return res.status(500).json({ error: 'API key not configured in backend' });
  }

  if (!lat || !lon || !type) {
    console.error('Missing parameters:', { lat, lon, type });
    return res.status(400).json({ error: 'Missing required parameters: lat, lon, type' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius || 10000}&type=${type}&key=${API_KEY}`;
    console.log('Calling Google Places API for', type);
    
    const response = await fetch(url);
    const data = await response.json();

    console.log('Google API response status:', data.status);

    if (data.status !== 'OK') {
      console.warn('Google API error:', data.status, data.error_message);
      return res.status(400).json({ status: data.status, message: data.error_message });
    }

    const results = data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      type: type,
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      rating: place.rating || 'N/A',
      address: place.vicinity || 'Address not available',
    }));

    console.log(`Found ${results.length} nearby ${type}`);
    res.json(results);
  } catch (error) {
    console.error('Error fetching nearby places:', error.message);
    res.status(500).json({ error: 'Failed to fetch nearby places', details: error.message });
  }
});

// Google Places Proxy - Text Search
router.get('/google/search', async (req, res) => {
  const { query, lat, lon } = req.query;
  // Try both variable names - with and without VITE_ prefix
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    console.error('API key not configured');
    return res.status(500).json({ error: 'API key not configured in backend' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const params = new URLSearchParams({
      query: query,
      key: API_KEY,
    });

    if (lat && lon) {
      params.append('location', `${lat},${lon}`);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ status: data.status, message: data.error_message });
    }

    const results = data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      rating: place.rating || 'N/A',
      address: place.formatted_address || 'Address not available',
    }));

    res.json(results);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

module.exports = router;
