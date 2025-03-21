'use client';

import { UserAvatar } from '@/container/profile-contanier/UserAvatar';
import { Post } from '@/http/usePost';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart, Loader2, MessageSquare, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export const PostItem = ({ post }: { post: Post }) => {
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
          {post.attachments && post.attachments.length > 0 && (
            <div className='mt-2 grid grid-cols-2 gap-2'>
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
          <div className='flex items-center justify-between pt-2'>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-1 hover:text-blue-500 hover:bg-blue-500/10 transition-colors rounded-full'
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.id}`);
              }}
            >
              <MessageSquare className='h-4 w-4' />
              <span>{post.comments_count || ''}</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'flex items-center gap-1 hover:text-pink-500 hover:bg-pink-500/10 transition-colors rounded-full',
                post.is_liked && 'text-pink-500'
              )}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart
                className={cn('h-4 w-4', post.is_liked && 'fill-current')}
              />
              <span className={cn(post.is_liked && 'text-pink-500')}>
                {post.likes_count || ''}
              </span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-1 hover:text-blue-500 hover:bg-blue-500/10 transition-colors rounded-full'
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
