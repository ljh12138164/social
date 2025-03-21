import { useProfile } from '@/http/useAuth';
import {
  ChatMessage,
  useChatHistory,
  useRealTimeChat,
  useSendMessage,
} from '@/http/useChat';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageInput } from './MessageInput';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ActiveConversation } from './ChatContainer';
import { User } from 'lucide-react';

interface ChatBoxProps {
  conversation: ActiveConversation;
  userId?: string;
  socket: Socket | null;
  isConnected: boolean;
}

export const ChatBox = ({
  conversation,
  userId,
  socket,
  isConnected,
}: ChatBoxProps) => {
  const { data: profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);

  // 获取聊天历史
  const { data: chatHistory, isLoading: isLoadingHistory } = useChatHistory(
    conversation.id
  );

  // 使用实时聊天
  const { sendMessage: sendSocketMessage, sendTypingStatus } = useRealTimeChat(
    userId,
    conversation.userId,
    socket,
    conversation.id
  );

  // 发送消息到服务器
  const { mutate: sendMessageToServer, isPending: isSending } = useSendMessage(
    conversation.id
  );

  // 监听对方正在输入状态
  useEffect(() => {
    if (!socket || !userId) return;

    socket.on('awarenessUpdate', (data: { userId: string; status: string }) => {
      if (data.userId === conversation.userId) {
        setTypingStatus(data.status);
      }
    });

    return () => {
      socket.off('awarenessUpdate');
    };
  }, [socket, userId, conversation.userId]);

  // 处理发送消息
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    // 先通过API发送消息
    sendMessageToServer(content, {
      onSuccess: () => {
        // 请求成功后发送socket消息
        sendSocketMessage(content, conversation.id);
      },
    });
  };

  // 处理输入状态
  const handleTypingStatus = (status: 'typing' | 'idle') => {
    sendTypingStatus(status);
  };

  // 格式化消息时间
  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'HH:mm', { locale: zhCN });
  };

  return (
    <div className='flex flex-col h-full'>
      {/* 聊天对象信息 */}
      <div className='p-3 border-b sticky top-0 bg-white z-10'>
        <div className='flex items-center'>
          <Avatar className='h-8 w-8 mr-2'>
            <AvatarImage
              src={
                conversation.avatar
                  ? conversation.avatar.startsWith('http')
                    ? conversation.avatar
                    : `${process.env.NEXT_PUBLIC_API_URL}${conversation.avatar}`
                  : ''
              }
            />
            <AvatarFallback>
              {conversation.userName.charAt(0) || <User className='h-4 w-4' />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className='font-medium'>{conversation.userName}</h3>
            {typingStatus === 'typing' && (
              <p className='text-xs text-gray-500'>正在输入...</p>
            )}
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {isLoadingHistory ? (
          <div className='flex justify-center'>
            <p className='text-gray-500'>加载消息中...</p>
          </div>
        ) : chatHistory?.length === 0 ? (
          <div className='h-full flex items-center justify-center text-gray-400'>
            开始和 {conversation.userName} 聊天吧
          </div>
        ) : (
          chatHistory?.map((msg, index) => {
            // 消息来源判断 - 检查是否为当前用户发送的消息
            const isMine =
              msg.sendId === userId ||
              (msg.created_by && msg.created_by.id === userId);

            // 根据消息来源选择头像和名称
            const showAvatar = isMine
              ? profile?.avatar
              : msg.sent_to?.avatar || conversation.avatar;
            //
            const showName = isMine
              ? profile?.name
              : msg.created_by?.name || conversation.userName;
            // 处理头像URL，确保使用完整路径
            const avatarUrl = showAvatar
              ? showAvatar.startsWith('http')
                ? showAvatar
                : `${process.env.NEXT_PUBLIC_API_URL}${showAvatar}`
              : '';

            // 检查是否需要显示日期分隔
            const showDate =
              index === 0 ||
              (chatHistory?.[index - 1]?.created_at &&
                new Date(
                  chatHistory?.[index - 1].created_at as string
                ).getDate() !== new Date(msg.created_at as string).getDate());

            // 获取消息内容
            const messageContent = msg.message || msg.body || '';

            return (
              <div key={msg.id || index}>
                {showDate && msg.created_at && (
                  <div className='text-center my-4'>
                    <span className='bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded'>
                      {format(new Date(msg.created_at), 'yyyy年MM月dd日', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[70%] ${
                      isMine ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className='h-8 w-8 mx-2 mt-1 flex-shrink-0'>
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>
                        {showName?.charAt(0) || <User className='h-4 w-4' />}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className='flex items-center mb-1'>
                        {!isMine && (
                          <span className='text-sm font-medium mr-2'>
                            {showName}
                          </span>
                        )}
                        <span className='text-xs text-gray-500'>
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          isMine
                            ? 'bg-blue-500 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {messageContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入框 */}
      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTypingStatus}
        disabled={!isConnected || isSending}
      />
    </div>
  );
};
