const mongoose = require('mongoose');

const CalendarJobSchema = new mongoose.Schema({
  jobType: String,
  date: String, // ISO format e.g. "2025-06-04"
  crew: String,
  address: String,
  fieldHours: Number,
  officeHours: Number,
  jobBrief: String,
  invoiceStatus: String,
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}
});

module.exports = mongoose.model('CalendarJob', CalendarJobSchema);