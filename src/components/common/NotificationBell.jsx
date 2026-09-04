import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Calendar, ShieldCheck, Flame, CreditCard, Film, Trophy } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDataStore();
  const { currentUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const dropdownRef = useRef(null);

  // Filter notifications relevant to currentUser or club broadcast
  const userNotifications = notifications.filter(n => 
    !n.userId || n.userId === currentUser?.id || (n.clubId && currentUser?.clubsJoined?.includes(n.clubId))
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setIsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    if (isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      markAllNotificationsRead(currentUser?.id);
    } finally {
      setTimeout(() => setIsMarkingRead(false), 300);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
        title="In-App Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm z-10">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:max-w-none sm:w-96 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 z-50 text-xs font-semibold space-y-2">
          
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black border border-rose-500/20">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isMarkingRead}
                onClick={handleMarkAllRead}
                className="text-[10px] text-sport-500 hover:underline font-extrabold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                <span>{isMarkingRead ? 'Updating...' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
            {userNotifications.length > 0 ? (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer flex items-start space-x-3 ${
                    !notif.read ? 'bg-sport-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sport-500 flex-shrink-0 mt-0.5">
                    {notif.title.includes('💳') || notif.title.includes('Payment') ? (
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                    ) : notif.title.includes('🎥') || notif.title.includes('Video') ? (
                      <Film className="w-4 h-4 text-sky-500" />
                    ) : notif.title.includes('🏆') || notif.title.includes('Score') ? (
                      <Trophy className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Flame className="w-4 h-4 text-sport-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-sport-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 block pt-0.5">
                      {notif.date}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">No notifications yet.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationBell;
