const express = require('express');
const router = express.Router();
const TimesheetEntry = require('../models/TimesheetEntry');

// Middleware to require login
function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET all entries for the logged-in user
router.get('/', ensureAuth, async (req, res) => {
  try {
    const entries = await TimesheetEntry.find({ userId: req.session.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST a new entry
router.post('/', ensureAuth, async (req, res) => {
  try {
    const newEntry = new TimesheetEntry({
      userId: req.session.userId,
      date: req.body.date,
      job: req.body.job,
      fieldHours: req.body.fieldHours,
      officeHours: req.body.officeHours,
      notes: req.body.notes
    });
    await newEntry.save();
    res.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

module.exports = router;