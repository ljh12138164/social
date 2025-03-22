'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, PlusCircle, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import CreateUserModal from './create-user-modal';
import UserManagement from './user-management';
import UserStatistics from './user-statistics';

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>管理员控制台</h1>
      </div>

      <Tabs defaultValue='users' value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='users' className='flex items-center gap-2'>
            <Users size={16} />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger value='stats' className='flex items-center gap-2'>
            <Activity size={16} />
            <span>数据统计</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Shield size={16} />
            <span>系统设置</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
          <div className='mb-4 flex justify-between'>
            <h2 className='text-2xl font-semibold'>用户管理</h2>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className='flex items-center gap-2'
            >
              <PlusCircle size={16} />
              <span>创建用户</span>
            </Button>
          </div>
          <UserManagement />
          <CreateUserModal
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
          />
        </TabsContent>

        <TabsContent value='stats'>
          <h2 className='mb-4 text-2xl font-semibold'>数据统计</h2>
          <UserStatistics />
        </TabsContent>

        <TabsContent value='settings'>
          <h2 className='mb-4 text-2xl font-semibold'>系统设置</h2>
          <Card>
            <CardHeader>
              <CardTitle>系统信息</CardTitle>
            </CardHeader>
            <CardContent>
              <p>此区域待开发...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContainer;
