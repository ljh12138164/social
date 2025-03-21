import { useMutation, useQuery } from '@tanstack/react-query';
import { post } from '@/lib/http';
import { Post } from './usePost';

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  friends_count: number;
  posts_count: number;
  get_avatar: string;
  bio: string;
}

export interface SearchResults {
  users: SearchUser[];
  posts: Post[];
}

/**
 * ### 搜索用户和推文
 * @returns 搜索功能的 mutation 函数和状态
 */
export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await post<SearchResults>('/search/', { query });
      return response;
    },
  });
};
