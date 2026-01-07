import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      // If API fails, show sample notifications
      setNotifications([
        {
          _id: '1',
          title: 'New Company Visit',
          message: 'TCS is visiting campus on Dec 15, 2024. Apply now!',
          type: 'company',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2', 
          title: 'Application Update',
          message: 'Your application for Software Developer role has been shortlisted.',
          type: 'application',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          title: 'Profile Reminder',
          message: 'Complete your profile to get better job recommendations.',
          type: 'system',
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-lg">🔔</span>
            </div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold transition-colors duration-200">×</button>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      notification.type === 'company' ? 'bg-blue-100' :
                      notification.type === 'application' ? 'bg-green-100' :
                      'bg-purple-100'
                    }">
                      {notification.type === 'company' ? '🏢' :
                       notification.type === 'application' ? '✅' :
                       '⚙️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center">
                        <span className="mr-1">🕰️</span>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;