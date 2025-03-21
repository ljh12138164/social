'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { NavSidebar } from './nav-sidebar';
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
    <div className='flex min-h-screen bg-background'>
      {!isAuth && <NavSidebar />}
      <ScrollArea className='flex-1 h-[100dvh] ml-[275px] border-r border-border/40'>
        {children}
      </ScrollArea>
      <RightSidebar />
    </div>
  );
};
