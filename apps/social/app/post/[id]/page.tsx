'use client';

import { withAuth } from '@/container/auth-contanier/AuthContainer';
import { useParams } from 'next/navigation';

const PostPage = () => {
  const { id } = useParams();
  return <div>{id}</div>;
};

// 使用 withAuth 高阶组件包装页面组件
export default withAuth(PostPage);
