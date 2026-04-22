import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckSquare } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-secondary hover:text-primary transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black leading-none text-background bg-primary rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-background border border-primary/10 z-20 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-surface">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[9px] text-accent hover:text-primary flex items-center gap-1 font-bold uppercase tracking-widest transition-colors"
                >
                  <CheckSquare className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-primary/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-secondary text-[10px] uppercase tracking-widest font-bold">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) markReadMutation.mutate(notif.id);
                      setIsOpen(false);
                      if (notif.requestId) {
                        const path = user?.role === 'STUDENT' ? '/student-dashboard' : '/coordinator-dashboard';
                        navigate(`${path}?requestId=${notif.requestId}`);
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-surface transition-colors ${!notif.isRead ? 'bg-accent/5 border-l-2 border-accent' : ''}`}
                  >
                    <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-primary font-medium' : 'text-secondary font-normal'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-secondary/60 mt-1.5 block uppercase tracking-wide font-mono">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
