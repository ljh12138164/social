'use client';

import { UserAvatar } from '@/container/profile-contanier/UserAvatar';
import { Post, useLikePost } from '@/http/usePost';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Render from './Rich/Render';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import Image from 'next/image';

export const PostItem = ({ post }: { post: Post }) => {
  const { mutate: likePost } = useLikePost(post.id);
  const router = useRouter();

  return (
    <>
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
            <div className='text-[15px] leading-normal'>
              <Render data={post.body} />
            </div>
            {post.attachments && post.attachments.length > 0 && (
              <div
                className={cn('mt-2 gap-2 grid grid-cols-4')}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <PhotoProvider>
                  {post.attachments.map((attachment) => {
                    return (
                      <div
                        key={attachment.id}
                        className='relative rounded-xl overflow-hidden bg-black/5 border-2 p-2 border-border/40 flex items-center justify-center'
                        style={{ height: 'auto', minHeight: '120px' }}
                      >
                        <PhotoView src={attachment.get_image}>
                          <Image
                            width={100}
                            height={100}
                            src={attachment.get_image}
                            alt='图片'
                          />
                        </PhotoView>
                      </div>
                    );
                  })}
                </PhotoProvider>
              </div>
            )}
            <div className='flex items-center  pt-2'>
              <section className='ml-auto flex gap-2'>
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
                    likePost();
                  }}
                >
                  <Heart
                    className={cn('h-4 w-4', post.is_liked && 'fill-current')}
                  />
                  <span className={cn(post.is_liked && 'text-pink-500')}>
                    {post.likes_count || ''}
                  </span>
                </Button>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Separator className='h-[2px] bg-border/40' />
    </>
  );
};
