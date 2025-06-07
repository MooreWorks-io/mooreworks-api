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

// POST new calendar job
router.post('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const newJob = new CalendarJob({
      ...req.body,
      createdBy: req.session.userId
    });

    await newJob.save();
    res.status(201).json({ message: 'Job created successfully' });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Calendar Job
router.put('/:id', async (req, res) => {
  try {
    const updated = await CalendarJob.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send('Job not found');
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;