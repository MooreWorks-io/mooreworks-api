const mongoose = require('mongoose');

const CalendarJobSchema = new mongoose.Schema({
  jobTitle: String,
  projectAddress: String,
  clientName: String,
  jobType: String,
  scheduledDate: Date,
  fieldCrewHours: Number,
  officeHours: Number,
  assignedCrew: [String],
  jobBrief: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('CalendarJob', CalendarJobSchema);