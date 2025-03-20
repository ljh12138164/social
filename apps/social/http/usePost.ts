import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/http';

{
  // "id": "5ea6f196-fb8d-45c4-a610-d4939aa963ea",
  // "body": "\ud83d\ude0d\ud83d\ude06\ud83e\udee0\ud83d\ude04\ud83d\ude04\ud83d\ude06\ud83d\ude05\ud83d\ude00\ud83e\udd74\ud83d\ude35\ud83d\udc45",
  // "is_private": false,
  // "likes_count": 0,
  // "comments_count": 0,
  // "created_by": {
  //     "id": "3bbcc507-06f6-4a81-8bb0-07bc17449aea",
  //     "name": "John Doe11",
  //     "email": "3479261099@qq.com",
  //     "friends_count": 0,
  //     "posts_count": 1,
  //     "get_avatar": "http://127.0.0.1:8000/media/avatars/-9lddQjyv-5frkK2aT3cSu0-u1.jpg",
  //     "bio": "111"
  // },
  // "created_at_formatted": "0\u00a0minutes",
  // "attachments": []
}
interface Post {
  id: string;
  body: string;
  is_private: boolean;
  likes_count: number;
  comments_count: number;
  created_by: {
    id: string;
    name: string;
    email: string;
    friends_count: number;
    posts_count: number;
    get_avatar: string;
    bio: string;
  };
  created_at_formatted: string;
  created_at: string;
  attachments: {
    id: string;
    file: string;
  }[];
}

interface CreatePostData {
  body: string;
  attachment?: File;
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
      const formData = new FormData();
      formData.append('body', data.body);

      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      const response = await post<Post>('/posts/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: () => {
      // 创建成功后，刷新推文列表
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      console.error(
        '创建推文失败:',
        error.response?.data?.message || '未知错误'
      );
    },
  });
};
