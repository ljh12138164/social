import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ChatEmoji from '@/components/ChatEmoji';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping: (status: 'typing' | 'idle') => void;
  disabled?: boolean;
}

export const MessageInput = ({
  onSend,
  onTyping,
  disabled,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 处理消息发送
  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');

    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 发送空闲状态
    onTyping('idle');
    setIsTyping(false);
  };

  // 处理按键事件 (Enter 发送, Shift+Enter 换行)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 自动调整文本区高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 处理输入内容变化
  const handleInputChange = (value: string) => {
    setMessage(value);

    // 自动调整高度
    adjustTextareaHeight();

    // 处理输入状态
    if (value.trim() && !isTyping) {
      onTyping('typing');
      setIsTyping(true);
    }

    // 清除现有超时
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 如果输入框为空或用户停止输入，3秒后设置为空闲
    typingTimeoutRef.current = setTimeout(() => {
      if (!value.trim() || isTyping) {
        onTyping('idle');
        setIsTyping(false);
      }
    }, 3000);
  };

  // 处理表情选择
  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // 清理超时
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className='p-3 border-t'>
      <div className='flex items-end gap-2'>
        <div className='relative flex-1'>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='输入消息...'
            disabled={disabled}
            className='min-h-[60px] max-h-[150px] pr-10 resize-none'
          />
          <div className='absolute right-2 bottom-2'>
            <ChatEmoji onClick={handleEmojiSelect}>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='h-8 w-8'
              >
                <Smile className='h-5 w-5 text-gray-500' />
              </Button>
            </ChatEmoji>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className='h-10'
          aria-label='发送消息'
        >
          <Send className='h-4 w-4 mr-2' />
          发送
        </Button>
      </div>
    </div>
  );
};
