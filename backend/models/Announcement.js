import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // Author (Admin/TPO)
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'recruiters', 'specific_branch', 'specific_year'],
    default: 'all'
  },
  
  // Specific targeting
  targetBranches: [{ type: String, enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'] }],
  targetYears: [{ type: String, enum: ['1st', '2nd', '3rd', '4th', 'Graduate'] }],
  
  // Content details
  type: { 
    type: String, 
    enum: ['general', 'placement_drive', 'deadline_reminder', 'result', 'event', 'policy'], 
    default: 'general' 
  },
  
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  
  // Status
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Engagement
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Settings
  isPinned: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  sendNotification: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
announcementSchema.index({ isPublished: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ type: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Announcement', announcementSchema);