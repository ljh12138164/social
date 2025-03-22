import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/http';

export interface User {
  id: string;
  email: string;
  name: string;
  get_avatar: string;
  bio: string;
  is_active: boolean;
  friends_count: number;
  posts_count: number;
  date_joined: string;
  created_at: string;
  is_admin: boolean;
}

export interface UserDetail extends User {
  friendship_requests: {
    received: number;
    sent: number;
  };
  mibt_result: {
    personality_type: string;
    personality_category: string;
    created_at: string;
  } | null;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  staff_users: number;
  superusers: number;
  recent_users: User[];
  mbti_statistics: Record<string, number>;
}

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  bio?: string;
  password?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

/**
 * ### 获取所有用户列表
 * @param search 搜索关键词
 * @param isActive 是否仅显示活跃用户
 * @param isStaff 是否仅显示管理员用户
 * @returns 用户列表查询结果
 */
export const useAdminUsersList = (
  search?: string,
  isActive?: boolean,
  isStaff?: boolean
) => {
  let url = '/admin/users/';
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (isActive !== undefined) params.append('is_active', String(isActive));
  if (isStaff !== undefined) params.append('is_staff', String(isStaff));

  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;

  return useQuery<{ users: User[] }>({
    queryKey: ['admin', 'users', search, isActive, isStaff],
    queryFn: async () => {
      const response = await get<{ users: User[] }>(url);
      return response;
    },
  });
};

/**
 * ### 获取用户统计信息
 * @returns 用户统计信息查询结果
 */
export const useAdminUserStatistics = () => {
  return useQuery<UserStatistics>({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: async () => {
      const response = await get<UserStatistics>('/admin/users/stats/');
      return response;
    },
  });
};

/**
 * ### 获取用户详情
 * @param userId 用户ID
 * @returns 用户详情查询结果
 */
export const useAdminUserDetail = (userId: string) => {
  return useQuery<{
    user: User;
    friendship_requests: { received: number; sent: number };
    mibt_result: any;
  }>({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const response = await get<{
        user: User;
        friendship_requests: { received: number; sent: number };
        mibt_result: any;
      }>(`/admin/users/${userId}/`);
      return response;
    },
    enabled: !!userId,
  });
};

/**
 * ### 创建新用户
 * @returns 创建用户的mutation函数和状态
 */
export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await post<{ success: boolean; user: User }>(
        '/admin/users/create/',
        data
      );
      return response;
    },
    onSuccess: () => {
      // 创建成功后，刷新用户列表和统计数据
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] });
    },
    onError: (error: any) => {
      console.error(
        '创建用户失败:',
        error.response?.data?.message || '未知错误'
      );
    },
  });
};

/**
 * ### 更新用户信息
 * @param userId 用户ID
 * @returns 更新用户的mutation函数和状态
 */
export const useAdminUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await put<{ success: boolean; user: User }>(
        `/admin/users/${userId}/update/`,
        data
      );
      return response;
    },
    onSuccess: () => {
      // 更新成功后，刷新用户详情、用户列表和统计数据
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] });
    },
    onError: (error: any) => {
      console.error(
        '更新用户失败:',
        error.response?.data?.message || '未知错误'
      );
    },
  });
};

/**
 * ### 删除用户
 * @param userId 用户ID
 * @returns 删除用户的mutation函数和状态
 */
export const useAdminDeleteUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await del<{ success: boolean; message: string }>(
        `/admin/users/${userId}/delete/`
      );
      return response;
    },
    onSuccess: () => {
      // 删除成功后，刷新用户列表和统计数据
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] });
    },
    onError: (error: any) => {
      console.error(
        '删除用户失败:',
        error.response?.data?.message || '未知错误'
      );
    },
  });
};
