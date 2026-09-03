import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  upsertNotification,
  setUnreadCount,
} from '../../store/slices/notificationSlice';
import { notificationSocket } from '../../services/api/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notification);
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!accessToken) return;
    notificationSocket.connect(accessToken);

    notificationSocket.on('new_notification', (data) => {
      if (data) dispatch(upsertNotification(data));
    });
    notificationSocket.on('notifications_updated', (data) => {
      if (data && typeof data.unread === 'number') dispatch(setUnreadCount(data.unread));
    });

    return () => {
      notificationSocket.close();
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleItemClick = (n) => {
    if (!n.read) dispatch(markNotificationRead(n.id));
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-full bg-white shadow-sm text-slate-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    n.read ? 'opacity-70' : 'bg-primary-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        n.read ? 'bg-slate-300' : 'bg-primary-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{n.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
