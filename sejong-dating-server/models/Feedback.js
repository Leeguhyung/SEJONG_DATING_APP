const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
