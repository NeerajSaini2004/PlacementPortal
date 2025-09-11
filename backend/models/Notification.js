import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  type: { 
    type: String, 
    enum: [
      'application_received',
      'application_status_update', 
      'interview_scheduled',
      'job_posted',
      'profile_approved',
      'profile_rejected',
      'announcement',
      'reminder',
      'system'
    ], 
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Related entities
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Priority
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Actions
  actionRequired: { type: Boolean, default: false },
  actionUrl: String,
  actionText: String,
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date
}, { timestamps: true });

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);