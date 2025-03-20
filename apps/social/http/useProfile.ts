import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/http';

export interface Profile {
  id: number;
  name: string;
  email: string;
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
