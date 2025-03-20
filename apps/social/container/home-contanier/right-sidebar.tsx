'use client';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
// 需要显示右侧栏的页面
const SHOWN_SIDEBAR_PATHS = [
  '/profile',
  '/profile/edit',
  '/messages',
  '/friends',
];
export const RightSidebar = () => {
  const pathname = usePathname();
  const isShown = SHOWN_SIDEBAR_PATHS.includes(pathname);
  if (isShown) return null;
  return (
    <div className='w-[350px] p-4 hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 xl:block'>
      {/* 搜索框 */}
      <div className='sticky top-4 space-y-4'>
        <div className='relative group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
          <input
            type='text'
            placeholder='搜索'
            className='w-full pl-10 pr-4 py-3 rounded-full bg-muted/60 hover:bg-muted/80 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all'
          />
        </div>

        {/* 推荐关注 */}
        <div className='rounded-xl  bg-muted/60 p-4 shadow-sm hover:shadow-md transition-all'>
          <h2 className='text-xl font-bold mb-4'>推荐关注</h2>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='flex items-center gap-3 group'>
                <div className='w-10 h-10 rounded-full bg-muted shadow-sm'></div>
                <div className='flex-1'>
                  <div className='font-bold group-hover:text-primary transition-colors'>
                    推荐用户 {i}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    @recommended{i}
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='shadow-sm hover:shadow transition-all hover:bg-primary hover:text-primary-foreground'
                >
                  关注
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
