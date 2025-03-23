'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { redirect, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { RightSidebar } from './right-sidebar';
import { TopNavbar } from './top-navbar';
interface HomeContainerProps {
  children: ReactNode;
}

export const HomeContainer = ({ children }: HomeContainerProps) => {
  const pathname = usePathname();

  if (pathname === '/') redirect('/home');

  const isAuth = pathname.startsWith('/auth') || pathname.startsWith('/admin');
  if (isAuth) return children;
  return (
    <>
      {!isAuth && <TopNavbar />}
      <div className='flex flex-col min-h-screen bg-background px-30'>
        <div className='flex flex-1 pt-14 gap-2'>
          <ScrollArea className='flex-1 h-[calc(100vh-3.5rem)] px-2'>
            {children}
          </ScrollArea>
          <RightSidebar />
        </div>
      </div>
    </>
  );
};
