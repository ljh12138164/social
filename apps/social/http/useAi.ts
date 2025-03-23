import { CozeAPI } from '@coze/api';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// 创建API客户端
const apiClient = new CozeAPI({
  token: process.env.NEXT_PUBLIC_COZE_API_KEY as string,
  baseURL: process.env.NEXT_PUBLIC_COZE_API_URL as string,
  allowPersonalAccessTokenInBrowser: true,
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
  const handleStreamResponse = async (stream: any) => {
    let fullResponse = '';
    try {
      for await (const chunk of stream) {
        if (chunk && chunk.event) {
          // 处理消息事件，提取AI返回的内容
          if (chunk.event === 'Message' && chunk.data) {
            try {
              const data =
                typeof chunk.data === 'string'
                  ? JSON.parse(chunk.data)
                  : chunk.data;
              // 图片中显示data.content是字符串形式的JSON对象
              if (data.content) {
                try {
                  const contentData = JSON.parse(data.content);
                  // 图片中显示结构为{"output":"..."}
                  if (contentData.output) {
                    // 处理输出内容，包括可能的换行符
                    fullResponse += contentData.output;
                    setStreamResponse(fullResponse);
                  }
                } catch (e) {}
              }
            } catch {}
          }
          // 处理Done事件，提取debug_url
          else if (chunk.event === 'Done') {
            try {
              const dataObj =
                typeof chunk.data === 'string'
                  ? JSON.parse(chunk.data)
                  : chunk.data;
              if (dataObj && dataObj.debug_url) {
              }
            } catch {}
          }
        }
      }

      return fullResponse;
    } catch (error) {
      const err = error as Error;
      toast.error('处理AI响应流失败: ' + (err.message || '未知错误'));
      throw err;
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ params }: { params: AiRequestParams }) => {
      const response = apiClient.workflows.runs.stream({
        workflow_id: '7484823801077219369',
        parameters: params,
      });

      return handleStreamResponse(response);
    },
    // onSuccess: (data) => {
    //   // 返回流式消息
    //   console.log('流式消息:', data);
    // },
    onError: (error: Error) => {
      toast.error('AI聊天请求失败: ' + (error.message || '未知错误'));
    },
  });

  return {
    ...mutation,
    streamResponse,
    setStreamResponse,
  };
};
