const mongoose = require('mongoose');

const TimesheetEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  job: { type: String, required: true },
  fieldHours: { type: Number, default: 0 },
  officeHours: { type: Number, default: 0 },
  notes: { type: String },
  paid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TimesheetEntry', TimesheetEntrySchema);