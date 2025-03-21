'use client';

import Emoji from '@/components/ChatEmoji';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { withAuth } from '@/container/auth-contanier/AuthContainer';
import { UserAvatar } from '@/container/profile-contanier/UserAvatar';
import { useProfile } from '@/http/useAuth';
import { Post, useCreatePost, useLikePost, usePosts } from '@/http/usePost';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Heart,
  Image,
  Loader2,
  MessageSquare,
  Share2,
  Smile,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 新建 PostItem 组件
const PostItem = ({ post }: { post: Post }) => {
  const { mutate: likePost, isPending: isLiking } = useLikePost(post.id);
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/post/${post.id}`);
      }}
      className='p-4 hover:bg-accent/40 cursor-pointer transition-colors'
    >
      <div className='flex gap-4'>
        <div className='w-10 h-10 rounded-full bg-muted shadow-sm overflow-hidden group'>
          {post.created_by.get_avatar && (
            <UserAvatar
              src={post.created_by.get_avatar}
              alt={post.created_by.name}
              className='w-full h-full object-cover transition-transform group-hover:scale-110'
            />
          )}
        </div>
        <div className='flex-1 space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='font-bold hover:underline cursor-pointer'>
              {post.created_by.name}
            </span>
            <span className='text-muted-foreground hover:underline cursor-pointer'>
              @{post.created_by.email}
            </span>
            <span className='text-muted-foreground'>·</span>
            <span className='text-muted-foreground hover:underline cursor-pointer ml-auto'>
              {format(new Date(post.created_at), 'PP', {
                locale: zhCN,
              })}
            </span>
          </div>
          <p className='text-[15px] leading-normal'>{post.body}</p>
          <div className='flex items-center justify-between max-w-md text-muted-foreground'>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-2 hover:text-blue-500 hover:bg-blue-500/10 transition-colors rounded-full -ml-2 group'
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.id}`);
              }}
            >
              <MessageSquare className='h-4 w-4 transition-transform group-hover:scale-110' />
              <span className='group-hover:text-blue-500'>
                {post.comments_count}
              </span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'flex items-center gap-2 hover:text-pink-500 hover:bg-pink-500/10 transition-colors rounded-full group',
                post.is_liked && 'text-pink-500'
              )}
              onClick={(e) => {
                e.stopPropagation();
                likePost();
              }}
              disabled={isLiking}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-transform group-hover:scale-110',
                  isLiking && 'animate-pulse',
                  post.is_liked && 'fill-current'
                )}
              />
              <span
                className={cn(
                  'group-hover:text-pink-500',
                  post.is_liked && 'text-pink-500'
                )}
              >
                {post.likes_count}
              </span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-2 hover:text-blue-500 hover:bg-blue-500/10 transition-colors rounded-full group'
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className='h-4 w-4 transition-transform group-hover:scale-110' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'recommend' | 'following'>(
    'recommend'
  );
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const { data: profile } = useProfile();
  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    createPost.mutate(
      { body: newPost },
      {
        onSuccess: () => {
          setNewPost('');
        },
      }
    );
  };

  return (
    <>
      {/* 顶部导航 */}
      <div className='sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 z-10'>
        <div className='flex items-center justify-between p-4'>
          <h1 className='text-xl font-bold'>首页</h1>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'font-medium transition-colors relative',
                activeTab === 'recommend'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('recommend')}
            >
              为你推荐
              {activeTab === 'recommend' && (
                <div className='absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'font-medium transition-colors relative',
                activeTab === 'following'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('following')}
            >
              关注
              {activeTab === 'following' && (
                <div className='absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 发推框 */}
      <div className='p-4 border-b border-border/40'>
        <div className='flex gap-4'>
          <UserAvatar
            src={profile?.avatar}
            alt={profile?.name || '用户'}
            size='md'
          />
          <div className='flex-1'>
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder='有什么新鲜事想分享给大家？'
              className='w-full p-2 text-xl resize-none focus:outline-none bg-transparent placeholder:text-muted-foreground/70'
              rows={3}
            />
            <div className='flex items-center justify-between mt-4 pt-4 border-t border-border/40'>
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-primary hover:bg-primary/10 transition-colors rounded-full'
                >
                  <Image className='h-5 w-5' />
                </Button>
                <Emoji
                  onClick={(e) => {
                    setNewPost(newPost + e.native);
                  }}
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-primary hover:bg-primary/10 transition-colors rounded-full'
                  >
                    <Smile className='h-5 w-5' />
                  </Button>
                </Emoji>
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={createPost.isPending || !newPost.trim()}
                className={cn(
                  'shadow-sm hover:shadow-md transition-all px-6 rounded-full',
                  !newPost.trim() && 'opacity-50 cursor-not-allowed',
                  newPost.trim() && 'hover:scale-105 active:scale-95'
                )}
              >
                {createPost.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  '发推'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 推文列表 */}
      <div className='divide-y divide-border/40'>
        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          posts?.map((post) => <PostItem key={post.id} post={post} />)
        )}
      </div>
    </>
  );
};

export default withAuth(HomePage);
