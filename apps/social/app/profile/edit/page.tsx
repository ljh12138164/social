'use client';

import { withAuth } from '@/components/auth-contanier/AuthContainer';
import { HomeContainer } from '@/components/home-contanier';
import { ProfileEditForm } from '@/components/profile-contanier';
import { useProfile } from '@/http/useAuth';

const ProfileEditPage = () => {
  const { data: profile, isLoading } = useProfile();

  return (
    <HomeContainer>
      <div className='relative'>
        {/* 渐变背景 */}
        <div className='absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600' />

        {/* 内容区域 */}
        <div className='relative'>
          <div className='max-w-4xl mx-auto px-4'>
            <h1 className='text-2xl font-bold text-white pt-8 pb-16'>
              编辑个人资料
            </h1>
            {isLoading ? (
              <div className='flex items-center justify-center h-32'>
                <div className='text-muted-foreground'>加载中...</div>
              </div>
            ) : (
              <ProfileEditForm defaultValues={profile} />
            )}
          </div>
        </div>
      </div>
    </HomeContainer>
  );
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(ProfileEditPage);
