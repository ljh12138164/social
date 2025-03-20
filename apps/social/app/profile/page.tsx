'use client';

import { withAuth } from '@/components/auth-contanier/AuthContainer';
import { HomeContainer } from '@/components/home-contanier';
import { ProfileContainer } from '@/components/profile-contanier';

const ProfilePage = () => {
  return (
    <HomeContainer>
      <ProfileContainer />
    </HomeContainer>
  );
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(ProfilePage);
