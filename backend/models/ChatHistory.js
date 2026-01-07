import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  sessionId: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ChatHistory', chatHistorySchema);