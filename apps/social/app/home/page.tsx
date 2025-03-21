'use client';

import Emoji from '@/components/ChatEmoji';
import { PostItem } from '@/components/PostItem';
import Tiptap, { TiptapRef } from '@/components/Rich/Tiptap';
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
import { withAuth } from '@/container/auth-contanier/AuthContainer';
import { UserAvatar } from '@/container/profile-contanier/UserAvatar';
import { useProfile } from '@/http/useAuth';
import { useCreatePost } from '@/http/usePost';
import { useSearchPostsPaginated } from '@/http/useSearch';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Image, Loader2, Smile } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  const [newPost, setNewPost] = useState('');
  const editorRef = useRef<TiptapRef | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // const { data: posts, isLoading } = useSearch('');
  const createPost = useCreatePost();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const {
    data: posts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchPostsPaginated('');

  // 设置 IntersectionObserver 监听底部元素
  useEffect(() => {
    const loadMoreCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(loadMoreCallback, {
        root: null, // 使用视口作为根
        rootMargin: '0px',
        threshold: 0.1, // 当 10% 的目标元素可见时触发回调
      });

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    createPost.mutate(
      { body: newPost },
      {
        onSuccess: (data) => {
          setNewPost('');
          queryClient.invalidateQueries({
            queryKey: ['search_posts_paginated', ''],
          });
          if (editorRef.current && editorRef.current.editor) {
            editorRef.current.editor.commands.clearContent();
          }
        },
      }
    );
  };

  // 处理编辑器内容更新
  const handleEditorUpdate = (content: string) => {
    setNewPost(content);
  };

  return (
    <>
      {/* 顶部导航 */}
      <div className='sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 z-10'>
        <div className='flex items-center justify-between p-4'>
          <h1 className='text-xl font-bold'>首页</h1>
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
            <Tiptap ref={editorRef} onContentUpdate={handleEditorUpdate} />
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
                    // 将表情插入到编辑器
                    if (editorRef.current && editorRef.current.editor) {
                      editorRef.current.editor.commands.insertContent(e.native);
                    }
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

      {/* 帖子列表 */}
      <div className='divide-y divide-border/40'>
        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          posts?.pages.map((page) =>
            page.results.map((post) => <PostItem key={post.id} post={post} />)
          )
        )}

        {/* 加载更多指示器 */}
        <div ref={loadMoreRef} className='w-full py-4'>
          {isFetchingNextPage && (
            <div className='flex justify-center items-center py-4'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          )}
        </div>
        <div className='flex justify-center items-center py-4'>
          {hasNextPage ? '加载更多' : '没有更多了'}
        </div>
      </div>
    </>
  );
};

export default withAuth(HomePage);
