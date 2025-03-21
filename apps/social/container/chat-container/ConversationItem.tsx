import { Conversation } from '@/http/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  // 格式化最后消息时间
  const formattedTime = conversation.lastMessageTime
    ? formatDistanceToNow(new Date(conversation.lastMessageTime), {
        addSuffix: true,
        locale: zhCN,
      })
    : '';

  // 处理头像URL，确保使用完整路径
  const avatarUrl = conversation.avatar
    ? conversation.avatar.startsWith('http')
      ? conversation.avatar
      : `${process.env.NEXT_PUBLIC_API_URL}${conversation.avatar}`
    : '';

  return (
    <div
      className={cn(
        'flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150',
        isActive && 'bg-green-50 hover:bg-green-50 border-l-4 border-green-700'
      )}
      onClick={onClick}
    >
      <Avatar className='h-12 w-12 mr-3 ring-2 ring-offset-2 ring-opacity-10 ring-gray-200'>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className='bg-green-700 text-white'>
          {conversation.userName?.charAt(0) || '用户'}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-center mb-1'>
          <span
            className={cn('font-medium truncate', isActive && 'text-green-700')}
          >
            {conversation.userName}
          </span>
          {formattedTime && (
            <span className='text-xs text-gray-500 ml-1 whitespace-nowrap'>
              {formattedTime}
            </span>
          )}
        </div>

        <div className='flex items-center'>
          <p className='text-sm text-gray-500 truncate mr-2 max-w-[180px]'>
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount ? (
            <span className='bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5'>
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
