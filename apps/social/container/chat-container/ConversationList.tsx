import { Skeleton } from '@/components/ui/skeleton';
import { Conversation } from '@/http/useChat';
import { useFriends } from '@/http/useFriendship';
import { useRouter } from 'next/navigation';
import { FriendRequestsDialog } from '../friends-container';
import { ActiveConversation } from './ChatContainer';
import { ConversationItem } from './ConversationItem';
interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId?: string;
  onSelect: (conversation: ActiveConversation) => void;
}

export const ConversationList = ({
  conversations,
  isLoading,
  activeId,
  onSelect,
}: ConversationListProps) => {
  const router = useRouter();
  const { data: friendsData, isLoading: isLoadingFriends } = useFriends();
  if (isLoading) {
    return (
      <div className='space-y-2 p-3'>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className='flex items-center space-x-3 p-2'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-full' />
              </div>
            </div>
          ))}
      </div>
    );
  }
  return (
    <div className='flex flex-col h-full'>
      {/* 头部 */}
      <div className='p-3 border-b sticky top-0 bg-white z-10 flex justify-between items-center'>
        <span className='font-medium text-lg'>我的会话</span>
        {/* 好友申请按钮（弹窗） */}
        <FriendRequestsDialog
          requests={friendsData?.requests || []}
          isLoading={isLoadingFriends}
        />
      </div>

      {/* 会话列表 */}
      {conversations.length === 0 ? (
        <div className='h-full flex flex-col items-center justify-center p-4 text-gray-400'>
          <p className='mb-2'>暂无会话</p>
        </div>
      ) : (
        <div className='divide-y overflow-auto flex-1'>
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeId === conversation.id}
              onClick={() => {
                onSelect({
                  id: conversation.id,
                  userId: conversation.userId || '',
                  userName: conversation.userName || '',
                  avatar: conversation.avatar
                    ? conversation.avatar.startsWith('http')
                      ? conversation.avatar
                      : `${process.env.NEXT_PUBLIC_API_URL}${conversation.avatar}`
                    : undefined,
                });
                router.push(`/friends?active=${conversation.id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
