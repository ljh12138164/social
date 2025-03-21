import { useProfile } from '@/http/useAuth';
import { useConversations, useSocketConnection } from '@/http/useChat';
import { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { ChatBox } from './ChatBox';

export interface ActiveConversation {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
}

interface ChatContainerProps {
  initialActiveConversation?: ActiveConversation | null;
}

export const ChatContainer = ({
  initialActiveConversation,
}: ChatContainerProps) => {
  const { data: profile } = useProfile();
  const userId = profile?.id.toString();

  // 连接 Socket
  const { socket, isConnected } = useSocketConnection(userId);

  // 获取会话列表
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversations();

  // 选中的会话
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation | null>(initialActiveConversation || null);

  // 当 initialActiveConversation 变化时更新选中的会话
  useEffect(() => {
    if (initialActiveConversation) {
      setActiveConversation(initialActiveConversation);
    }
  }, [initialActiveConversation]);

  if (conversationsError) {
    return (
      <div className='p-4 bg-red-50 text-red-600 rounded-lg'>
        加载数据失败，请稍后再试
      </div>
    );
  }

  return (
    <div className='flex h-[calc(100vh-120px)]'>
      {/* 左侧会话列表 */}
      <div className='w-[300px] border-r'>
        <ConversationList
          conversations={conversations || []}
          isLoading={isLoadingConversations}
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
        />
      </div>

      {/* 右侧聊天区域 */}
      <div className='flex-1 flex flex-col'>
        {activeConversation ? (
          <ChatBox
            conversation={activeConversation}
            userId={userId}
            socket={socket}
            isConnected={isConnected}
          />
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            选择一个会话开始聊天
          </div>
        )}
      </div>
    </div>
  );
};
