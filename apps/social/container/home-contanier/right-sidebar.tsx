'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFriendSuggestions } from '@/http/useFriendship';
import { getTrend } from '@/http/usePost';
import { post } from '@/lib/http';
import { getInitials } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

// 需要显示右侧栏的页面
const SHOWN_SIDEBAR_PATHS = [
  'profile',
  'messages',
  'friends',
  'notifications',
  'mbti',
  'post',
];

export const RightSidebar = () => {
  const pathname = usePathname();
  const isShown = SHOWN_SIDEBAR_PATHS.includes(pathname.split('/')[1]);

  // 好友推荐
  const { data: suggestedUsers, isLoading } = useFriendSuggestions();
  const { data: trendPosts, isLoading: isTrendLoading } = getTrend();

  const queryClient = useQueryClient();

  // 发送好友请求的mutation
  const sendFriendRequest = useMutation({
    mutationFn: async (userId: string) => {
      const response = await post(`/friends/${userId}/request/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendSuggestions'] });
      toast.success('好友请求已发送');
    },
    onError: (error: any) => {
      toast.error('发送好友请求失败: ' + (error.message || '未知错误'));
    },
  });

  if (isShown) return null;

  return (
    <div className='w-[350px] p-4 hidden lg:block bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      {/* 搜索框 */}
      <div className='sticky top-4 space-y-4'>
        {/* 推荐用户 */}
        <div className='rounded-xl bg-muted/60 p-4 shadow-sm hover:shadow-md transition-all'>
          <h2 className='text-xl font-bold mb-4'>推荐用户</h2>

          {isLoading ? (
            <div className='py-8 flex justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : !suggestedUsers || suggestedUsers.length === 0 ? (
            <div className='py-4 text-center text-muted-foreground'>
              暂无推荐用户
            </div>
          ) : (
            <div className='space-y-4'>
              {suggestedUsers.slice(0, 3).map((user) => (
                <div key={user.id} className='flex items-center gap-3 group'>
                  <Link href={`/profile/${user.id}`}>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={user.get_avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className='flex-1'>
                    <Link
                      href={`/profile/${user.id}`}
                      className='font-bold group-hover:text-primary transition-colors'
                    >
                      {user.name}
                    </Link>
                    <div className='text-sm text-muted-foreground'>
                      {user.posts_count} 帖子
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='shadow-sm hover:shadow transition-all hover:bg-primary hover:text-primary-foreground'
                    onClick={() => sendFriendRequest.mutate(user.id)}
                    disabled={sendFriendRequest.isPending}
                  >
                    {sendFriendRequest.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <>
                        <UserPlus className='h-4 w-4 mr-1' />
                        添加
                      </>
                    )}
                  </Button>
                </div>
              ))}
              {suggestedUsers.length > 3 && (
                <Link
                  href='/friends'
                  className='block text-center text-sm text-primary hover:underline mt-2'
                >
                  查看更多推荐用户
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
