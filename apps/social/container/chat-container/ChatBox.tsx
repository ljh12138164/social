import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAiChat } from '@/http/useAi';
import { useProfile } from '@/http/useAuth';
import {
  ChatMessage,
  useChatHistory,
  useRealTimeChat,
  useSendMessage,
} from '@/http/useChat';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { ActiveConversation } from './ChatContainer';
import { MessageInput } from './MessageInput';
import Markdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [showDogCard, setShowDogCard] = useState(false);

  const {
    mutate: aiChat,
    isPending: isAiChatLoading,
    streamResponse,
    setStreamResponse,
  } = useAiChat();

  console.log(streamResponse);
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
  useEffect(() => {
    if (isLoadingHistory) {
      return;
    }
    setTimeout(() => {
      if (chatHistory?.length === 0) {
        return;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [chatHistory]);

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
      <div className='p-4 border-b sticky top-0 bg-white z-10 shadow-sm'>
        <div className='flex items-center'>
          <Avatar className='h-10 w-10 mr-3 ring-2 ring-offset-2 ring-opacity-10 ring-gray-200'>
            <AvatarImage
              src={
                conversation.avatar
                  ? conversation.avatar.startsWith('http')
                    ? conversation.avatar
                    : `${process.env.NEXT_PUBLIC_API_URL}${conversation.avatar}`
                  : ''
              }
            />
            <AvatarFallback className='bg-gradient-to-br from-purple-400 to-pink-500 text-white'>
              {conversation.userName.charAt(0) || <User className='h-4 w-4' />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className='font-medium text-lg'>{conversation.userName}</h3>
            {typingStatus === 'typing' && (
              <p className='text-xs text-gray-500 flex items-center'>
                <span className='mr-1'>正在输入</span>
                <span className='flex'>
                  <span className='animate-bounce mx-0.5 delay-0'>.</span>
                  <span className='animate-bounce mx-0.5 delay-100'>.</span>
                  <span className='animate-bounce mx-0.5 delay-200'>.</span>
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 '>
        {isLoadingHistory ? (
          <div className='flex justify-center py-10'>
            <div className='flex flex-col items-center'>
              <div className='w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin'></div>
              <p className='text-gray-500 mt-2 text-sm'>加载消息中...</p>
            </div>
          </div>
        ) : chatHistory?.length === 0 ? (
          <div className='h-full flex items-center justify-center text-gray-400 flex-col'>
            <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-gray-400'
              >
                <path d='M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z' />
                <path d='M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1' />
              </svg>
            </div>
            开始和 {conversation.userName} 聊天吧
            <p className='text-xs mt-2'>发送你的第一条消息</p>
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
                    <span className='bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium'>
                      {format(new Date(msg.created_at), 'yyyy年MM月dd日', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${
                    isMine ? 'justify-end' : 'justify-start'
                  } group`}
                >
                  <div
                    className={`flex max-w-[75%] ${
                      isMine ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar
                      className={`h-8 w-8 mx-2 mt-1 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isMine ? 'ml-3' : 'mr-3'
                      }`}
                    >
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback
                        className={
                          isMine
                            ? 'bg-gradient-to-br from-green-400 to-indigo-500 text-white'
                            : 'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                        }
                      >
                        {showName?.charAt(0) || <User className='h-4 w-4' />}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className='flex items-center mb-1'>
                        {!isMine && (
                          <span className='text-sm font-medium mr-2 text-gray-700'>
                            {showName}
                          </span>
                        )}
                        <span className='text-xs text-gray-400'>
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg shadow-sm ${
                          isMine
                            ? 'bg-green-700 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none'
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

        <div className='relative'>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <motion.div
                className='cursor-pointer'
                onClick={() => setShowDogCard(!showDogCard)}
                animate={showDogCard ? { scale: 1.2 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <TooltipTrigger asChild>
                  <Image
                    src='/chat.webp'
                    alt='小狗聊天图片'
                    width={100}
                    height={100}
                    className='ml-[-20px]'
                  />
                </TooltipTrigger>
              </motion.div>
              <TooltipContent
                side='right'
                sideOffset={-10}
                align='center'
                className='z-50'
              >
                线条小狗帮我聊天
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AnimatePresence>
            {showDogCard && (
              <>
                <motion.div
                  animate={{ width: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className='absolute bottom-10 left-16 z-30 overflow-hidden'
                >
                  <Card className='p-4 shadow-lg border-green-200 w-full'>
                    <CardContent className='p-2'>
                      {isAiChatLoading ? (
                        <div className='flex justify-center py-10 w-f'>
                          <div className='flex flex-col items-center'>
                            <div className='w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin'></div>
                            <p className='text-gray-500 mt-2 text-sm'>
                              加载消息中...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {streamResponse ? (
                            <>
                              <p className='font-bold text-xl'>
                                情感分析及建议:
                              </p>
                              <ScrollArea className='grid grid-cols-[1fr_70px] gap-2 h-[150px]'>
                                <Markdown>{streamResponse}</Markdown>
                                <Button
                                  className='self-end'
                                  variant='outline'
                                  onClick={() => {
                                    setShowDogCard(false);
                                    setStreamResponse('');
                                  }}
                                >
                                  我知道了
                                </Button>
                              </ScrollArea>
                            </>
                          ) : (
                            <>
                              <div className='flex items-center space-x-4'>
                                <Image
                                  src='/chat.webp'
                                  alt='小狗助手'
                                  width={50}
                                  height={50}
                                  className='rounded-full'
                                />
                                <div>
                                  <h3 className='font-medium'>线条小狗</h3>
                                  <p className='text-sm text-gray-500'>
                                    你好呀！我是AI聊天小助手
                                  </p>
                                </div>
                              </div>
                              <div className='mt-3 text-sm'>
                                <p>
                                  陌陌，我是AI聊天小助手，你知道大担担不知道怎么继续聊下去吗？让我来帮帮你吧。
                                </p>
                                <p className='text-xs text-gray-400 mt-1'>
                                  (注意:
                                  我会查看你们之前的聊天记录，介意就别了~)
                                </p>
                                <div className='flex justify-between mt-2'>
                                  <Button
                                    variant='outline'
                                    onClick={() => setShowDogCard(false)}
                                  >
                                    不需要了
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const data =
                                        queryClient.getQueryData<ChatMessage[]>(
                                          ['chatHistory', conversation.id]
                                        ) ?? [];

                                      const input = data
                                        .slice(0, 10)
                                        .map((item) => ({
                                          user_id: item.sendId,
                                          lines: item.message,
                                        }));

                                      aiChat({
                                        params: {
                                          input,
                                          requester: userId ?? '',
                                        },
                                      });
                                    }}
                                  >
                                    帮帮我们
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
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
