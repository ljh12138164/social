'use client';

import Image from 'next/image';
import { AVATAR_URL } from '@/lib';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-32 h-32',
};

export const UserAvatar = ({
  src,
  alt,
  size = 'md',
  className,
}: UserAvatarProps) => {
  const avatarUrl = src || AVATAR_URL;

  return (
    <div
      className={cn(
        'rounded-full border-4 border-background bg-muted relative overflow-hidden',
        sizeMap[size],
        className
      )}
    >
      <Image
        src={avatarUrl}
        alt={alt}
        fill
        className='object-cover'
        sizes='(max-width: 128px) 100vw, 128px'
      />
    </div>
  );
};
