import React from 'react';

interface NotificationIndicatorProps {
  hasUnread: boolean;
  unreadCount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  hasUnread,
  unreadCount,
  size = 'md',
  className = ''
}) => {
  if (!hasUnread) return null;

  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-xs',
    lg: 'w-4 h-4 text-sm'
  };

  const countSizeClasses = {
    sm: 'min-w-[12px] h-3 text-[8px] px-1',
    md: 'min-w-[16px] h-4 text-[10px] px-1',
    lg: 'min-w-[18px] h-5 text-xs px-1.5'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Red dot indicator */}
      <div 
        className={`absolute -top-1 -right-1 bg-red-500 rounded-full ${sizeClasses[size]} ${
          unreadCount > 0 ? 'hidden' : 'block'
        }`}
      />
      
      {/* Count badge */}
      {unreadCount > 0 && (
        <div 
          className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center font-bold ${countSizeClasses[size]}`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};
