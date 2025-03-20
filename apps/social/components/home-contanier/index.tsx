import { ReactNode } from 'react';
import { NavSidebar } from './nav-sidebar';
import { RightSidebar } from './right-sidebar';

interface HomeContainerProps {
  children: ReactNode;
}

export const HomeContainer = ({ children }: HomeContainerProps) => {
  return (
    <div className='flex min-h-screen bg-background'>
      <NavSidebar />
      <div className='flex-1 ml-[275px] border-r border-border/40'>
        {children}
      </div>
      <RightSidebar />
    </div>
  );
};
