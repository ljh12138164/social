'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { TopNavbar } from './top-navbar';
import { RightSidebar } from './right-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
interface HomeContainerProps {
  children: ReactNode;
}

export const HomeContainer = ({ children }: HomeContainerProps) => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') router.push('/home');
  const isAuth = pathname.startsWith('/auth');
  if (isAuth) return children;
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      {!isAuth && <TopNavbar />}
      <div className='flex flex-1 pt-14'>
        <ScrollArea className='flex-1 h-[calc(100vh-3.5rem)]'>
          <div className=' mx-auto pt-2'>{children}</div>
        </ScrollArea>
        <RightSidebar />
      </div>
    </div>
  );
};
