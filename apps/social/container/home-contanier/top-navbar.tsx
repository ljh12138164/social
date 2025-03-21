'use client';
import { cn } from '@/lib/utils';
import { Bell, Brain, Home, Mail, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationIndicator } from '../notifications-container/NotificationIndicator';

const navItems = [
  {
    label: '首页',
    icon: Home,
    href: '/home',
    active: ['/home', '/post'],
  },
  {
    label: '好友',
    icon: User,
    href: '/friends',
    active: ['/friends'],
  },
  {
    label: '探索',
    icon: Search,
    href: '/explore',
    active: ['/explore'],
  },
  {
    label: '通知',
    icon: Bell,
    href: '/notifications',
    active: ['/notifications'],
    component: NotificationIndicator,
  },

  {
    label: 'MBTI测试',
    icon: Brain,
    href: '/mbti',
    active: ['/mbti'],
  },
  {
    label: '个人资料',
    icon: User,
    href: '/profile',
    active: ['/profile'],
  },
];

export const TopNavbar = () => {
  const pathname = usePathname();

  return (
    <div className='fixed top-0 left-0 right-0 h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10'>
      {/* 导航菜单 */}
      <div className='h-full max-w-xl mx-auto flex justify-between'>
        {navItems.map((item) => {
          const isActive = item.active.some((active) =>
            pathname.startsWith(active)
          );
          const Icon = item.icon;
          const CustomComponent = item.component;

          return (
            <Link key={item.href} href={item.href} className='flex-1 relative'>
              <div
                className={cn(
                  'flex flex-col items-center justify-center h-14 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-primary'
                )}
              >
                {CustomComponent ? (
                  <CustomComponent />
                ) : (
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isActive ? 'text-primary' : 'group-hover:text-primary'
                    )}
                  />
                )}
                <span className='text-xs font-medium mt-1'>{item.label}</span>
              </div>
              {isActive && (
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-primary mx-auto w-12' />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
