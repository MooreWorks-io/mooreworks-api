// ============================
// CALENDARROUTES.JS - Cleaned + Fixed
// ============================

const express = require('express');
const router = express.Router();
const CalendarJob = require('../models/CalendarJob');

// GET all calendar jobs for the logged-in user
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

// POST a new job
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

// PUT update existing job by ID
router.put('/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const updatedJob = await CalendarJob.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.session.userId },
      req.body,
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job by ID
router.delete('/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const deleted = await CalendarJob.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.userId
    });

    if (!deleted) return res.status(404).json({ message: 'Job not found' });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).send('Server error');
  }
});

// POST: Update invoiceStatus for grouped jobs
router.post('/update-invoice-status', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, address, invoiceStatus } = req.body;

  try {
    const result = await CalendarJob.updateMany(
      { jobType: name, address, createdBy: req.session.userId },
      { $set: { invoiceStatus } }
    );

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Error updating invoice status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;