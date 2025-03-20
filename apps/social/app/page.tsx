'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { withAuth } from '@/components/auth-contanier/AuthContainer';
import { HomeContainer } from '@/components/home-contanier';

const HomePage = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/') {
      router.replace('/home');
    }
  }, [router, pathname]);

  return <HomeContainer>{children}</HomeContainer>;
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(HomePage);
