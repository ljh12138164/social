'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/http/useAuth';
import { Post } from '@/http/usePost';
import { get, post } from '@/lib/http';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Mail, UserCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { useSendFriendRequest, useUserProfile } from '@/http/useProfile';

// 推文项组件
const PostItem = ({ post }: { post: Post }) => {
  return (
    <Link href={`/post/${post.id}`}>
      <div className='p-4 hover:bg-muted/30 transition-colors border-b border-border/40'>
        <div className='flex gap-3'>
          <UserAvatar
            src={post.created_by.get_avatar}
            alt={post.created_by.name}
            size='md'
          />
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <span className='font-bold'>{post.created_by.name}</span>
              <span className='text-muted-foreground'>·</span>
              <span className='text-muted-foreground'>
                {post.created_at_formatted}
              </span>
            </div>
            <p className='mt-2 text-[15px] whitespace-pre-wrap'>{post.body}</p>
            {post.attachments && post.attachments.length > 0 && (
              <div className='mt-3 grid grid-cols-2 gap-2'>
                {post.attachments.map((attachment) => (
                  <img
                    key={attachment.id}
                    src={attachment.file}
                    alt=''
                    className='w-full h-full object-cover rounded-xl'
                  />
                ))}
              </div>
            )}
            <div className='flex items-center gap-6 mt-3'>
              <div className='text-muted-foreground text-sm flex items-center gap-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
                </svg>
                <span>{post.comments_count}</span>
              </div>
              <div className='text-muted-foreground text-sm flex items-center gap-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-heart'
                >
                  <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'></path>
                </svg>
                <span>{post.likes_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const UserProfileContainer = () => {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const { data: currentUser } = useProfile();
  const [activeTab, setActiveTab] = useState('posts');
  const { data, isLoading } = useUserProfile(userId);
  const sendFriendRequest = useSendFriendRequest(userId);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!data) {
    // router.push('/not-found');
    return null;
  }

  const { user, posts, can_send_friendship_request, is_friend } = data;

  // 如果是查看自己的资料，重定向到个人资料页
  if (currentUser && currentUser.id.toString() === userId) {
    router.push('/profile');
    return null;
  }
  return (
    <div className='min-h-screen'>
      {/* 封面图 */}
      <div className='h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative'>
        <div className='absolute -bottom-16 left-4 sm:left-8'>
          <UserAvatar src={user.get_avatar} alt={user.name} size='lg' />
        </div>
      </div>

      {/* 个人信息 */}
      <div className='px-4 sm:px-8 mt-20'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h1 className='text-2xl font-bold'>{user.name}</h1>
            <p className='text-muted-foreground'>{user.email}</p>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' className='rounded-full'>
              <Mail className='h-4 w-4 mr-2' />
              发消息
            </Button>

            {can_send_friendship_request ? (
              <Button
                size='sm'
                className='rounded-full'
                onClick={() => sendFriendRequest.mutate()}
                disabled={sendFriendRequest.isPending}
              >
                {sendFriendRequest.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <UserPlus className='h-4 w-4 mr-2' />
                )}
                添加好友
              </Button>
            ) : (
              <Button
                size='sm'
                variant='secondary'
                className='rounded-full'
                disabled
              >
                <UserCheck className='h-4 w-4 mr-2' />
                {is_friend ? '已是好友' : '请求已发送'}
              </Button>
            )}
          </div>
        </div>

        {/* 个人简介 */}
        <p className='text-foreground/90 mb-4'>
          {user.bio || '这位用户很懒，还没有填写个人简介'}
        </p>

        {/* 统计信息 */}
        <div className='flex gap-4 text-sm text-muted-foreground mb-6'>
          <div>
            <span className='font-bold text-foreground'>
              {user.posts_count}
            </span>{' '}
            推文
          </div>
          <div>
            <span className='font-bold text-foreground'>
              {user.friends_count}
            </span>{' '}
            好友
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className='px-4 sm:px-8'>
        <Tabs
          defaultValue='posts'
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className='w-full justify-start border-b rounded-none h-auto p-0'>
            <TabsTrigger
              value='posts'
              className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4'
            >
              推文
            </TabsTrigger>
            <TabsTrigger
              value='likes'
              className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4'
            >
              点赞
            </TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='mt-0'>
            {posts.length === 0 ? (
              <div className='py-10 text-center text-muted-foreground'>
                还没有发布任何推文
              </div>
            ) : (
              <div className='divide-y divide-border/40'>
                {posts.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='likes' className='mt-0'>
            <div className='py-10 text-center text-muted-foreground'>
              暂无点赞内容
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
