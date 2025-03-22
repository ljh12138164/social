'use client';

import { Component as MBTIPieChart } from '@/components/echart/Pie';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminUserStatistics } from '@/http/useAdmin';
import dayjs from 'dayjs';
import { ShieldCheck, TrendingUp, UserCheck, Users, UserX } from 'lucide-react';

const UserStatistics = () => {
  const { data, isLoading } = useAdminUserStatistics();

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='h-20 bg-muted/20' />
            <CardContent className='h-24 bg-muted/10' />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>统计数据</CardTitle>
          <CardDescription>获取数据时出错</CardDescription>
        </CardHeader>
        <CardContent>
          <p>无法加载统计数据，请稍后再试。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='总用户数'
          value={data.total_users}
          icon={<Users className='h-4 w-4' />}
          description='平台上的用户总数'
        />
        <StatCard
          title='活跃用户'
          value={data.active_users}
          icon={<UserCheck className='h-4 w-4' />}
          description='当前可登录用户数'
          colorClass='text-green-600 bg-green-100'
        />
        <StatCard
          title='禁用用户'
          value={data.inactive_users}
          icon={<UserX className='h-4 w-4' />}
          description='已被禁用的用户数量'
          colorClass='text-red-600 bg-red-100'
        />
        <StatCard
          title='管理员用户'
          value={data.staff_users}
          icon={<ShieldCheck className='h-4 w-4' />}
          description='拥有管理权限的用户'
          colorClass='text-blue-600 bg-blue-100'
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>最近加入平台的用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {data.recent_users.map((user) => (
                <div key={user.id} className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={user.get_avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium'>{user.name}</p>
                      <span className='text-xs text-muted-foreground'>
                        {dayjs(user.date_joined).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MBTI统计</CardTitle>
            <CardDescription>用户性格类型分布</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='list'>
              <TabsList className='mb-4 grid w-full grid-cols-2'>
                <TabsTrigger value='list'>列表视图</TabsTrigger>
                <TabsTrigger value='chart'>图表视图</TabsTrigger>
              </TabsList>

              <TabsContent value='list'>
                <div className='grid grid-cols-2 gap-2'>
                  {Object.entries(data.mbti_statistics || {}).length > 0 ? (
                    Object.entries(data.mbti_statistics)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <div
                          key={type}
                          className='flex items-center justify-between rounded-lg border p-2'
                        >
                          <Badge variant='outline' className='font-mono'>
                            {type}
                          </Badge>
                          <span className='font-medium'>{count} 人</span>
                        </div>
                      ))
                  ) : (
                    <div className='col-span-2 text-center text-muted-foreground'>
                      <p>暂无MBTI数据</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='chart'>
                <MBTIPieChart />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  colorClass?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  colorClass = 'text-primary bg-primary/10',
}: StatCardProps) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      <div className={`rounded-full p-1 ${colorClass}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold'>{value}</div>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </CardContent>
  </Card>
);

export default UserStatistics;
