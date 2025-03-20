'use client';
import { ReactNode } from 'react';
import { NavSidebar } from './nav-sidebar';
import { RightSidebar } from './right-sidebar';
import { usePathname } from 'next/navigation';
interface HomeContainerProps {
  children: ReactNode;
}

export const HomeContainer = ({ children }: HomeContainerProps) => {
  const pathname = usePathname();
  const isAuth = pathname.startsWith('/auth');
  if (isAuth) return children;
  return (
    <div className='flex min-h-screen bg-background'>
      {!isAuth && <NavSidebar />}
      <div className='flex-1 ml-[275px] border-r border-border/40'>
        {children}
      </div>
      <RightSidebar />
    </div>
  );
};
