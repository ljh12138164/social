import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/http';

interface Post {
  id: number;
  body: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  repost_count: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
}

interface CreatePostData {
  body: string;
}

/**
 * ### 获取推文列表
 * @returns 推文列表数据和加载状态
 */
export const usePosts = () => {
  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await get<Post[]>('/posts/');
      return response;
    },
  });
};

/**
 * ### 创建新推文
 * @returns 创建推文的 mutation 函数和状态
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const response = await post<Post>('/posts/create/', data);
      return response;
    },
    onSuccess: () => {
      // 创建成功后，刷新推文列表
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      console.error('创建推文失败:', error.response?.data?.message || '未知错误');
    },
  });
};
