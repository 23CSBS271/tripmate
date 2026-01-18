const express = require('express');
const Story = require('../models/Story');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all stories for user (own stories)
router.get('/my', auth, async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get published stories (public)
router.get('/published', async (req, res) => {
  try {
    const stories = await Story.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single published story (public)
router.get('/public/:id', async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, status: 'published' });
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single story (requires auth - for editing/viewing own stories)
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user owns this story or if it's published
    if (story.status !== 'published' && story.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create story
router.post('/', auth, async (req, res) => {
  try {
    const story = new Story({
      ...req.body,
      userId: req.user.userId
    });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update story
router.put('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
