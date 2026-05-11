import React from 'react';

interface AvatarProps {
  src?: string;
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const Avatar: React.FC<AvatarProps> = ({ src, username, size = 'md', online, className = '' }) => {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-brand-500/20 flex items-center justify-center`}>
        {src ? (
          <img src={src} alt={username} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-brand-400">{username[0].toUpperCase()}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${online ? 'bg-green-400' : 'bg-gray-600'}`} />
      )}
    </div>
  );
};

export default Avatar;
