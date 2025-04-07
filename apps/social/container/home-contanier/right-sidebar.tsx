'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFriendSuggestions } from '@/http/useFriendship';
import { getTrend } from '@/http/usePost';
import { post } from '@/lib/http';
import { getInitials } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query');
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
    <div className=' w-[500px] pr-[10%] hidden bg-gray-100 lg:block  backdrop-blur'>
      <div className='sticky top-4 space-y-4 mt-5 h-[calc(100vh-10rem)] overflow-y-auto'>
        {/* 推荐用户 */}
        <Card className='rounded-xl  p-4 shadow-sm hover:shadow-md transition-all'>
          <CardContent className='p-0'>
            <p className='text-xl font-bold mb-4'>推荐用户</p>
            <hr className='mb-3' />
            {isLoading ? (
              <div className='py-8 flex justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            ) : !suggestedUsers || suggestedUsers.length === 0 ? (
              <div className=' text-center text-muted-foreground'>
                暂无推荐用户
              </div>
            ) : (
              <div className='space-y-4'>
                {suggestedUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className='flex items-center gap-3 group'>
                    <Link href={`/profile/${user.id}`}>
                      <Avatar className='w-10 h-10'>
                        <AvatarImage src={user.get_avatar} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className='flex-1'>
                      <Link
                        href={`/profile/${user.id}`}
                        className='font-bold group-hover:text-primary transition-colors text-sm'
                      >
                        {user.name}
                      </Link>
                      <div className='text-muted-foreground text-xs'>
                        帖子数 {user.posts_count}
                      </div>
                    </div>
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
          </CardContent>
        </Card>

        {/* 热门话题 */}
        <Card className='rounded-xl  p-4 shadow-sm hover:shadow-md transition-all'>
          <CardContent className='p-0'>
            <p className='text-xl font-bold mb-4'>话题</p>
            <hr className='mb-3' />
            {isTrendLoading ? (
              <div className='py-8 flex justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            ) : !trendPosts || trendPosts.length === 0 ? (
              <div className='py-4 text-center text-muted-foreground'>
                暂无热门话题
              </div>
            ) : (
              <div className='space-y-4'>
                {trendPosts.slice(0, 5).map((trend) => (
                  <div
                    key={trend.id}
                    className='group cursor-pointer'
                    onClick={() => {
                      if (query === trend.hashtag) {
                        router.push(`/home`);
                      } else {
                        router.push(`/home?query=${trend.hashtag}`);
                      }
                    }}
                  >
                    <div className='flex items-center'>
                      <div className='mr-3'>
                        <div className='flex items-center justify-center w-8 h-8 bg-muted text-primary font-medium rounded-lg'>
                          #
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div
                          className={`font-bold group-hover:text-primary transition-colors ${
                            query === trend.hashtag ? 'text-primary' : ''
                          }`}
                        >
                          {trend.hashtag}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          热度 {trend.occurences}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
