'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProfile } from '@/http/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AVATAR_URL } from '@/lib';
export { ProfileEditForm } from './ProfileEditForm';

export const ProfileContainer = () => {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  if (isLoading) return <>加载中...</>;
  if (!profile) {
    router.push('/not-found');
    return <></>;
  }

  const avatarUrl = profile.avatar || AVATAR_URL;

  return (
    <div className='min-h-screen'>
      {/* 封面图 */}
      <div className='h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative'>
        <div className='absolute -bottom-16 left-4 sm:left-8'>
          <div className='w-32 h-32 rounded-full border-4 border-background bg-muted relative overflow-hidden'>
            {/* 头像 */}
            <Image
              src={avatarUrl}
              alt={profile.name}
              fill
              className='object-cover'
              sizes='(max-width: 128px) 100vw, 128px'
            />
          </div>
        </div>
      </div>
      {/* 个人信息 */}
      <div className='px-4 sm:px-8 mt-20'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h1 className='text-2xl font-bold'>{profile.name}</h1>
            <p className='text-muted-foreground'>{profile.email}</p>
          </div>
          <Button variant='outline' className='rounded-full'>
            <Link href='/profile/edit'>编辑个人资料</Link>
          </Button>
        </div>
        {/* 个人简介 */}
        <p className='text-foreground/90 mb-4'>
          {profile.bio || '这位用户很懒，还没有填写个人简介'}
        </p>
      </div>
    </div>
  );
};
