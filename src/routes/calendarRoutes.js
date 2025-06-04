const express = require('express');
const router = express.Router();
const CalendarJob = require('../models/CalendarJob');

// GET calendar jobs
router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const jobs = await CalendarJob.find({ createdBy: req.session.userId });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching calendar jobs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;