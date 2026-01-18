const express = require('express');
const Photo = require('../models/Photo');
const auth = require('../middleware/auth');

const router = express.Router();

// Get photos for a trip
router.get('/trip/:tripId', auth, async (req, res) => {
  try {
    const photos = await Photo.find({ tripId: req.params.tripId }).sort({ uploadedAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create photo
router.post('/', auth, async (req, res) => {
  try {
    const photo = new Photo(req.body);
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update photo
router.put('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete photo
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
