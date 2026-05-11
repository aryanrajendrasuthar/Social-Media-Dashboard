import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationsAPI } from '../services/api';
import { Notification } from '../types';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/Common/Avatar';
import toast from 'react-hot-toast';

const typeLabel = {
  like: '❤️ liked your post',
  comment: '💬 commented on your post',
  follow: '👤 started following you',
  share: '↗️ shared your post',
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount, clearUnread } = useSocket();

  useEffect(() => {
    notificationsAPI.getAll()
      .then(({ data }) => setNotifications(data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      clearUnread();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-brand-400 text-sm hover:text-brand-300 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-white font-semibold text-xl mb-2">All caught up!</h3>
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif._id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200
                ${notif.read
                  ? 'bg-dark-700 border-dark-500'
                  : 'bg-brand-500/5 border-brand-500/20'
                }`}
            >
              <Link to={`/profile/${notif.fromUserId?.username}`}>
                <Avatar
                  src={notif.fromUserId?.avatarUrl}
                  username={notif.fromUserId?.username || '?'}
                  size="md"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm">
                  <Link
                    to={`/profile/${notif.fromUserId?.username}`}
                    className="font-semibold text-white hover:text-brand-400 transition-colors"
                  >
                    @{notif.fromUserId?.username}
                  </Link>
                  {' '}{typeLabel[notif.type]}
                </p>
                {notif.postId && (notif.type === 'like' || notif.type === 'comment') && (
                  <p className="text-gray-600 text-xs mt-1 truncate">
                    "{(notif.postId as any).content?.slice(0, 60)}..."
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
