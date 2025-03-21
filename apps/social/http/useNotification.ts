import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/http';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  body: string;
  type_of_notification:
    | 'new_friendrequest'
    | 'accepted_friendrequest'
    | 'rejected_friendrequest'
    | 'post_like'
    | 'post_comment';
  post_id?: string;
  created_for_id: string;
  created_at: string;
}

/**
 * ### 获取未读通知列表
 * @returns 未读通知列表及查询状态
 */
export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await get<Notification[]>('/notifications/');
      return response;
    },
    // 30秒自动刷新一次
    refetchInterval: 30 * 1000,
  });
};

/**
 * ### 将通知标记为已读
 * @param notificationId 通知ID
 * @returns 标记通知为已读的mutation函数和状态
 */
export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await post(`/notifications/read/${notificationId}/`);
      return response;
    },
    onSuccess: () => {
      // 刷新通知列表
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('标记通知失败: ' + (error.message || '未知错误'));
    },
  });
};

/**
 * ### 通知类型映射
 * 将通知类型转换为用户友好的文本
 */
export const NOTIFICATION_TYPES = {
  new_friendrequest: '新的好友请求',
  accepted_friendrequest: '好友请求已接受',
  rejected_friendrequest: '好友请求被拒绝',
  post_like: '推文被点赞',
  post_comment: '推文有新评论',
};
