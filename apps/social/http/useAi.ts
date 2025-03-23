import { CozeAPI } from '@coze/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// 创建API客户端
const apiClient = new CozeAPI({
  token: 'pat_6bEv5mYTx9EeJoRWiP4tXq2PG0W6up16OLQBd3SliJwoThVEULL5K4N9viihizDD',
  baseURL: 'https://api.coze.cn',
});

// 消息类型定义
export interface Message {
  user_id: string;
  lines: string;
}

// AI请求参数类型
export interface AiRequestParams {
  input: Message[];
  requester: string;
  [key: string]: unknown;
}

// 流式响应处理回调类型
export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * ### 使用AI流式聊天功能
 * @returns AI流式聊天的mutation函数和状态以及流式响应处理函数
 */
export const useAiChat = () => {
  //   const queryClient = useQueryClient();
  const [streamResponse, setStreamResponse] = useState<string>('');

  // 流式响应处理函数
  const handleStreamResponse = async (
    stream: any,
    callbacks?: StreamCallbacks
  ) => {
    let fullResponse = '';

    try {
      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          setStreamResponse(fullResponse);
          callbacks?.onChunk?.(chunk);
        }
      }

      callbacks?.onComplete?.(fullResponse);
      return fullResponse;
    } catch (error) {
      const err = error as Error;
      callbacks?.onError?.(err);
      toast.error('处理AI响应流失败: ' + (err.message || '未知错误'));
      throw err;
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ params }: { params: AiRequestParams }) => {
      const response = await apiClient.workflows.runs.stream({
        workflow_id: '7484823801077219369',
        parameters: params,
      });

      return response;
    },
    onSuccess: (data) => {
      // 返回流式消息
      return handleStreamResponse(data);
    },
    onError: (error: Error) => {
      toast.error('AI聊天请求失败: ' + (error.message || '未知错误'));
    },
  });

  return {
    ...mutation,
    streamResponse,
  };
};
