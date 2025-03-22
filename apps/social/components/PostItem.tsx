'use client';

import { UserAvatar } from '@/container/profile-contanier/UserAvatar';
import { Post, useDeletePost, useLikePost } from '@/http/usePost';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Render from './Rich/Render';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';

export const PostItem = ({
  post,
  canDelete = false,
}: {
  post: Post;
  canDelete?: boolean;
}) => {
  const { mutate: likePost } = useLikePost(post.id);
  const router = useRouter();
  const { mutate: deletePost } = useDeletePost(post.id);
  return (
    <>
      <div
        onClick={() => {
          router.push(`/post/${post.id}`);
        }}
        className='p-4 hover:bg-accent/30 cursor-pointer transition-all duration-200'
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
              <span className='font-bold hover:underline cursor-pointer hover:text-primary transition-colors'>
                {post.created_by.name}
              </span>
              <span className='text-muted-foreground hover:underline cursor-pointer text-sm'>
                @{post.created_by.email}
              </span>
              <span className='text-muted-foreground'>·</span>
              <span className='text-muted-foreground hover:underline cursor-pointer ml-auto text-sm'>
                {format(new Date(post.created_at), 'PP', {
                  locale: zhCN,
                })}
              </span>
            </div>
            <div className='text-[15px] leading-relaxed'>
              <Render data={post.body} />
            </div>
            {post.attachments && post.attachments.length > 0 && (
              <div
                className={cn('mt-3 gap-3 grid grid-cols-2 sm:grid-cols-4')}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <PhotoProvider>
                  {post.attachments.map((attachment) => {
                    return (
                      <div
                        key={attachment.id}
                        className='relative rounded-lg overflow-hidden bg-black/5 border-2 p-2 border-border/40 flex items-center justify-center hover:border-primary/30 transition-colors'
                        style={{ height: 'auto', minHeight: '120px' }}
                      >
                        <PhotoView src={attachment.get_image}>
                          <Image
                            width={100}
                            height={100}
                            src={attachment.get_image}
                            alt='图片'
                            className='hover:scale-105 transition-transform'
                          />
                        </PhotoView>
                      </div>
                    );
                  })}
                </PhotoProvider>
              </div>
            )}
            <div className='flex items-center pt-2'>
              <section className='ml-auto flex gap-3'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='flex items-center gap-1 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200 rounded-full hover:scale-105 active:scale-95'
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
                    'flex items-center gap-1 hover:text-pink-500 hover:bg-pink-500/10 transition-all duration-200 rounded-full hover:scale-105 active:scale-95',
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
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className='flex items-center gap-1 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded-full hover:scale-105 active:scale-95'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除这条帖子吗？此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button
                            variant='outline'
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            取消
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost();
                          }}
                          className='bg-red-500 hover:bg-red-700 transition-all duration-200'
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
      <Separator className='h-[1px] bg-border/40' />
    </>
  );
};
