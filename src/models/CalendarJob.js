// ============================
// CALENDARJOB.JS - Updated Schema
// ============================

const mongoose = require('mongoose');

const CalendarJobSchema = new mongoose.Schema({
  jobType: String,
  date: String, // ISO format e.g. "2025-06-04"
  crew: String,
  address: String,
  fieldHours: Number,
  officeHours: Number,
  jobBrief: String,
  invoiceStatus: {
    type: String,
    enum: ['unpaid', 'paid', ''],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('CalendarJob', CalendarJobSchema);