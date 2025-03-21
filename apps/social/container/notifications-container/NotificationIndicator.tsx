'use client';

import { useNotifications } from '@/http/useNotification';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export const NotificationIndicator = () => {
  const { data: notifications } = useNotifications();

  const unreadCount = notifications?.length || 0;

  return (
    <Link href='/notifications' className='relative'>
      <Bell className='h-6 w-6' />
      {unreadCount > 0 && (
        <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};
