import React from 'react';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';
import { IoNotifications, IoNotificationsOff, IoNotificationsOutline } from 'react-icons/io5';

interface PushNotificationToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotificationContext();

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <IoNotificationsOutline className="animate-pulse" />;
    }
    
    if (permission === 'denied') {
      return <IoNotificationsOff className="text-red-500" />;
    }
    
    if (isSubscribed) {
      return <IoNotifications className="text-green-500" />;
    }
    
    return <IoNotificationsOutline className="text-gray-400" />;
  };

  const getLabel = () => {
    if (!isSupported) {
      return 'Not Supported';
    }
    
    if (permission === 'denied') {
      return 'Blocked';
    }
    
    if (isLoading) {
      return 'Loading...';
    }
    
    if (isSubscribed) {
      return 'Enabled';
    }
    
    return 'Enable';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-base px-3 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <IoNotificationsOutline size={getIconSize()} />
        {showLabel && <span className="text-sm">Loading...</span>}
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <IoNotificationsOff size={getIconSize()} />
          {showLabel && <span className="text-sm">Push notifications not supported</span>}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Requires HTTPS or localhost, and a modern browser
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className={`
          flex items-center gap-2 rounded-lg transition-colors
          ${getSizeClasses()}
          ${permission === 'denied' 
            ? 'bg-red-100 text-red-600 cursor-not-allowed' 
            : isSubscribed 
              ? 'bg-green-100 hover:bg-green-200 text-green-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={
          permission === 'denied' 
            ? 'Push notifications are blocked. Please enable them in your browser settings.'
            : isSubscribed 
              ? 'Disable push notifications'
              : 'Enable push notifications'
        }
      >
        {getIcon()}
        {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
      </button>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      
      {permission === 'denied' && (
        <p className="text-xs text-red-500 mt-1">
          Please enable notifications in your browser settings
        </p>
      )}
    </div>
  );
};

export default PushNotificationToggle;
