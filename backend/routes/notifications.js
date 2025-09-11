import express from 'express';
import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let filter = { recipient: req.user.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name')
      .populate('relatedJob', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json({ msg: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ msg: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json({ msg: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get public announcements for user
router.get('/announcements', auth, async (req, res) => {
  try {
    const user = req.user;
    let filter = {
      isPublished: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    };

    // Filter based on target audience
    if (user.role === 'student') {
      filter.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' },
            { 
              targetAudience: 'specific_branch',
              targetBranches: user.studentProfile?.branch
            },
            {
              targetAudience: 'specific_year',
              targetYears: user.studentProfile?.year
            }
          ]
        }
      ];
    } else if (user.role === 'recruiter') {
      filter.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'recruiters' }
          ]
        }
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(10);

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;