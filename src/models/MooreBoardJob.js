// models/MooreBoardJob.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['field', 'office', 'courthouse'], required: true },
  hours: { type: Number, required: true },
  notes: String,
  crew: [String] // optional crew members involved
});

const jobSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  address: { type: String, required: true },
  jobType: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Field Complete', 'Finalizing', 'Ready to Invoice', 'Completed'],
    default: 'Not Started'
  },
  sessions: [sessionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MooreBoardJob', jobSchema);
