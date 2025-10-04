import React from 'react';
import Image from 'next/image';

interface VIPBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  isVip?: boolean;
  vipEndDate?: string;
}

const VIPBadge: React.FC<VIPBadgeProps> = ({ 
  size = 'md', 
  className = '',
  isVip = false,
  vipEndDate
}) => {
  // Check if VIP is still active
  const isVipActive = isVip && vipEndDate && new Date(vipEndDate) > new Date();
  
  // Don't render if not VIP or VIP has expired
  if (!isVipActive) {
    return null;
  }
  const sizeClasses = {
    sm: 'w-4 h-4',      // Comments (x2)
    md: 'w-6 h-6',      // Posts (x2) 
    lg: 'w-8 h-8',      // Follow cards (x2)
    xl: 'w-12 h-12',    // Side menu (x3)
    xxl: 'w-20 h-20'    // Profile (x5)
  };

  const iconSizes = {
    sm: { width: 17, height: 17 },    // Comments
    md: { width: 26, height: 26 },    // Posts
    lg: { width: 32, height: 32 },    // Follow cards
    xl: { width: 48, height: 48 },    // Side menu
    xxl: { width: 80, height: 80 }    // Profile
  };

  return (
    <div className={`absolute -top-1 -right-1 ${sizeClasses[size]}  rounded-full flex items-center justify-center shadow-lg ${className}`}>
      <Image
        src="/lion-badge.png"
        alt="VIP Badge"
        width={iconSizes[size].width}
        height={iconSizes[size].height}
        className="object-contain"
      />
    </div>
  );
};

export default VIPBadge;
