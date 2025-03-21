'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { withAuth } from '@/container/auth-contanier/AuthContainer';
import { useProfile } from '@/http/useAuth';
import { useSaveMBTI } from '@/http/useMibt';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import MBTITest, { MBTIResult } from '../../container/mibt-contanier/MBTITest';

const MBTIPage = () => {
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState<MBTIResult | null>(null);
  const [showTest, setShowTest] = useState(false);
  const { data: user, isLoading } = useProfile();
  const { mutate: saveMBTI, isPending: isSaving } = useSaveMBTI();
  const queryClient = useQueryClient();
  // 从接口数据中获取MBTI测试结果
  useEffect(() => {
    if (user && user.mbti_result) {
      // 如果接口中有用户的MBTI结果
      setResult(user.mbti_result);
      setTestCompleted(true);
    } else {
      // 如果接口没有结果，检查本地存储
      const savedResults = localStorage.getItem('mbti_results');
      if (savedResults) {
        setResult(JSON.parse(savedResults));
        setTestCompleted(true);
      }
    }
  }, [user]);

  const handleTestComplete = (testResult: MBTIResult) => {
    setResult(testResult);
    setTestCompleted(true);

    // 保存测试结果到服务器
    saveMBTI(testResult, {
      onSuccess: () => {
        toast.success('测试结果保存成功');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      },
    });
  };

  const startNewTest = () => {
    // 清除旧结果
    localStorage.removeItem('mbti_answers');
    localStorage.removeItem('mbti_current_question');
    localStorage.removeItem('mbti_results');
    setResult(null);
    setTestCompleted(false);
    setShowTest(true);
  };
  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold mb-4'>MBTI人格测试</h1>
          <p className='text-gray-500'>
            MBTI测试是Myers-Briggs类型指标的缩写，可以帮助了解您的性格特点和行为偏好。
            完成93道题目，获取您的MBTI人格类型分析。
          </p>
        </div>

        {testCompleted && result ? (
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>您的MBTI测试结果</CardTitle>
              <CardDescription>
                您的人格类型是：{result.personality_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='mb-2'>内向 (I) vs 外向 (E)</p>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>内向: {result.introversion_score}</span>
                    <span>外向: {result.extroversion_score}</span>
                  </div>
                </div>
                <div>
                  <p className='mb-2'>直觉 (N) vs 感知 (S)</p>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>直觉: {result.intuition_score}</span>
                    <span>感知: {result.sensing_score}</span>
                  </div>
                </div>
                <div>
                  <p className='mb-2'>思考 (T) vs 情感 (F)</p>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>思考: {result.thinking_score}</span>
                    <span>情感: {result.feeling_score}</span>
                  </div>
                </div>
                <div>
                  <p className='mb-2'>判断 (J) vs 感知 (P)</p>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>判断: {result.judging_score}</span>
                    <span>感知: {result.perceiving_score}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
              <Button onClick={startNewTest} className='w-full'>
                重新测试
              </Button>
              {!user?.mbti_result && (
                <Button
                  onClick={() =>
                    saveMBTI(result, {
                      onSuccess: () => toast.success('测试结果保存成功'),
                    })
                  }
                  disabled={isSaving}
                  variant='outline'
                  className='w-full'
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      保存中...
                    </>
                  ) : (
                    '保存结果'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : showTest ? (
          <MBTITest onComplete={handleTestComplete} />
        ) : (
          <Card className='text-center'>
            <CardHeader>
              <CardTitle>开始MBTI测试</CardTitle>
              <CardDescription>
                测试包含93个问题，大约需要15-20分钟完成
              </CardDescription>
            </CardHeader>
            <CardFooter className='flex justify-center'>
              <Button onClick={startNewTest} size='lg'>
                开始测试
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(MBTIPage);
