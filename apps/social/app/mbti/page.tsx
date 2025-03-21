'use client';

import { useState } from 'react';
import { withAuth } from '@/container/auth-contanier/AuthContainer';
import MBTITest, { MBTIResult } from '../../container/mibt-contanier/MBTITest';

const MBTIPage = () => {
  const [, setTestCompleted] = useState(false);
  const [, setResult] = useState<MBTIResult | null>(null);

  const handleTestComplete = (testResult: MBTIResult) => {
    setResult(testResult);
    setTestCompleted(true);
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold mb-4'>MBTI人格测试</h1>
          <p className='text-gray-500'>
            MBTI测试是Myers-Briggs类型指标的缩写，可以帮助了解您的性格特点和行为偏好。
            完成以下93道题目，获取您的MBTI人格类型分析。
          </p>
        </div>

        <MBTITest onComplete={handleTestComplete} />
      </div>
    </div>
  );
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(MBTIPage);
