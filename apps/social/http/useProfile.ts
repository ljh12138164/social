'use client';

import { get, post } from '@/lib/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Post } from './usePost';
import toast from 'react-hot-toast';
import { MBTIResult } from '@/container/mibt-contanier/MBTITest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  friends_count: number;
  posts_count: number;
  get_avatar: string;
  bio?: string;
  mbti_result: MBTIResult | null;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  mbti_result: MBTIResult | null;
  avatar?: string;
  bio?: string;
}

interface UpdateProfileData {
  name: string;
  bio?: string;
  avatar?: File;
}

/**
 * ### 获取用户个人资料
 */
export const useProfile = () => {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await get<Profile>('/api/account/me/');
      return response;
    },
  });
};

/**
 * ### 更新用户个人资料
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // 如果有文件，需要使用 FormData
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.bio) formData.append('bio', data.bio);
      if (data.avatar) formData.append('avatar', data.avatar);

      const response = await post<{ message: string; user: Profile }>(
        '/editprofile/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    },
    onSuccess: (data) => {
      // 更新成功后，刷新个人资料数据
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return data;
    },
    onError: (error: any) => {
      // 处理错误情况
      const message = error.response?.data?.message || '更新个人资料失败';
      throw new Error(message);
    },
  });
};

/**
 * ### 获取用户资料
 */
export const useUserProfile = (userId: string | undefined) => {
  return useQuery<{
    user: UserProfile;
    posts: Post[];
    can_send_friendship_request: boolean;
    is_friend: boolean;
  }>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const response = await get<{
        user: UserProfile;
        posts: Post[];
        can_send_friendship_request: boolean;
        is_friend: boolean;
      }>(`/posts/profile/${userId}/`);
      return response;
    },
    enabled: !!userId,
  });
};

/**
 * ### 获取用户点赞的帖子
 */
export const useUserLikes = (userId: string | undefined) => {
  return useQuery<Post[]>({
    queryKey: ['userLikes', userId],
    queryFn: async () => {
      const response = await get<Post[]>(`/posts/profile/${userId}/likes/`);
      return response;
    },
    enabled: !!userId,
  });
};

/**
 * ### 发送好友请求
 */
export const useSendFriendRequest = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await post(`/friends/${userId}/request/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      toast.success('发送好友请求成功');
    },
  });
};
