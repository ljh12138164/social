import { Button } from '@/components/ui/button';
import { Home, Search, Bell, Mail, User, MoreHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: '首页',
    icon: Home,
    href: '/home',
  },
  {
    label: '探索',
    icon: Search,
    href: '/explore',
  },
  {
    label: '通知',
    icon: Bell,
    href: '/notifications',
  },
  {
    label: '消息',
    icon: Mail,
    href: '/messages',
  },
  {
    label: '个人资料',
    icon: User,
    href: '/profile',
  },
];

export const NavSidebar = () => {
  const pathname = usePathname();

  return (
    <div className='fixed w-[275px] h-screen border-r border-border/40 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex flex-col h-full'>
        {/* Logo */}
        <Link
          href='/home'
          className='p-4 rounded-full w-fit hover:bg-accent/80 transition-colors'
        >
          <svg
            viewBox='0 0 24 24'
            className='h-8 w-8 text-primary hover:text-primary/90 transition-colors'
          >
            <g fill='currentColor'>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'></path>
            </g>
          </svg>
        </Link>

        {/* 导航菜单 */}
        <nav className='flex-1 space-y-1'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant='ghost'
                  className={cn(
                    'w-full justify-start gap-4 text-lg font-medium transition-colors group relative',
                    isActive ? 'text-primary font-bold' : 'hover:bg-accent/80'
                  )}
                >
                  <div className='relative'>
                    <Icon
                      className={cn(
                        'h-6 w-6 transition-colors',
                        isActive ? 'text-primary' : 'group-hover:text-primary'
                      )}
                    />
                    {/* 激活状态的背景效果 */}
                    {isActive && (
                      <div className='absolute inset-0 bg-primary/10 rounded-full scale-150 animate-pulse' />
                    )}
                  </div>
                  <span>{item.label}</span>
                  {/* 激活指示器 */}
                  {isActive && (
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full' />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* 发推按钮 */}
        <Button className='w-full rounded-full h-12 text-lg font-bold mt-4 shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95'>
          发推
        </Button>

        {/* 用户信息 */}
        <div className='flex items-center gap-3 p-4 hover:bg-accent/80 rounded-full cursor-pointer mt-auto mb-4 transition-colors group relative'>
          <div className='w-10 h-10 rounded-full bg-muted shadow-sm group-hover:ring-2 group-hover:ring-primary transition-all'></div>
          <div className='flex-1'>
            <div className='font-bold group-hover:text-primary transition-colors'>
              用户名
            </div>
            <div className='text-sm text-muted-foreground'>@username</div>
          </div>
          <MoreHorizontal className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />

          {/* 悬浮提示 */}
          <div className='absolute bottom-full left-0 mb-2 w-full p-4 bg-popover rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible'>
            <div className='text-sm font-medium'>切换账号或退出登录</div>
          </div>
        </div>
      </div>
    </div>
  );
};
