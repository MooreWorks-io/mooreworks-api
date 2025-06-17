// routes/mooreboard.js
const express = require('express');
const router = express.Router();
const MooreBoardJob = require('../models/MooreBoardJob');

// Middleware to ensure user is logged in
function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Create new MooreBoard job
router.post('/jobs', ensureAuth, async (req, res) => {
  try {
    const job = new MooreBoardJob({
      ...req.body,
      createdBy: req.session.userId,
    });
    await job.save();
    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all jobs for the logged-in user
router.get('/jobs', ensureAuth, async (req, res) => {
  try {
    const jobs = await MooreBoardJob.find({ createdBy: req.session.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
