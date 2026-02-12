'use client';

import { useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  image?: string | null;
  isAuthenticated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNotificationDot?: boolean;
}

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-16 w-16',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-2xl',
};

export default function UserAvatar({
  firstName,
  lastName,
  image,
  isAuthenticated = false,
  size = 'md',
  showNotificationDot = false,
}: UserAvatarProps) {
  const pathId = useId();
  const [imgError, setImgError] = useState(false);
  const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
  const showImage = image && !imgError;

  return (
    <div className="flex items-center">
      {isAuthenticated ? (
        <div className="relative flex items-center">
          {showImage ? (
            <img
              src={image}
              alt={`${firstName} ${lastName}`}
              className={`${sizeClasses[size]} shrink-0 rounded-full object-cover`}
              onError={() => setImgError(true)}
            />
          ) : initials ? (
            <div
              className={`flex bg-white/20 text-white ${sizeClasses[size]} shrink-0 items-center justify-center rounded-full ${textSizeClasses[size]} font-semibold`}
            >
              {initials}
            </div>
          ) : (
            <div
              className={`flex bg-white/20 text-white ${sizeClasses[size]} shrink-0 items-center justify-center rounded-full`}
            >
              <User className={iconSizeClasses[size]} />
            </div>
          )}
          {showNotificationDot && (
            <span className="ring-secondary absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2" />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => signIn('ministryplatform')}
          className={`bg-primary hover:bg-primary relative flex ${sizeClasses[size]} shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80`}
        >
          <svg
            className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite]"
            viewBox="0 0 36 36"
          >
            <defs>
              <path id={pathId} d="M 18,18 m -11,0 a 11,11 0 1,1 22,0 a 11,11 0 1,1 -22,0" />
            </defs>
            <text fill="var(--secondary)" fontSize="5.8" fontWeight="600" letterSpacing="0.15em">
              <textPath href={`#${pathId}`} startOffset="0%">
                LOG IN
              </textPath>
            </text>
            <text fill="var(--secondary)" fontSize="5.8" fontWeight="600" letterSpacing="0.15em">
              <textPath href={`#${pathId}`} startOffset="50%">
                LOG IN
              </textPath>
            </text>
          </svg>
          <User className={`text-secondary/30 ${iconSizeClasses[size]}`} />
        </button>
      )}
    </div>
  );
}
