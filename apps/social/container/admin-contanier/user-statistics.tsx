'use client';

// import { Component as MBTIPieChart } from '@/components/echart/Pie';
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
import { useAdminUserStatistics, useAdminPostStatistics } from '@/http/useAdmin';
import dayjs from 'dayjs';
import { ShieldCheck, TrendingUp, UserCheck, Users, UserX, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserStatistics = () => {
  const { data: userData, isLoading: userLoading } = useAdminUserStatistics();
  const { data: postData, isLoading: postLoading } = useAdminPostStatistics();

  if (userLoading || postLoading) {
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

  if (!userData || !postData) {
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
          value={userData.total_users}
          icon={<Users className='h-4 w-4' />}
          description='平台上的用户总数'
        />
        <StatCard
          title='正常用户'
          value={userData.active_users}
          icon={<UserCheck className='h-4 w-4' />}
          description='当前可登录用户数'
          colorClass='text-green-600 bg-green-100'
        />
        <StatCard
          title='禁用用户'
          value={userData.inactive_users}
          icon={<UserX className='h-4 w-4' />}
          description='已被禁用的用户数量'
          colorClass='text-red-600 bg-red-100'
        />
        <StatCard
          title='总帖子数'
          value={postData.total_posts}
          icon={<MessageSquare className='h-4 w-4' />}
          description='平台上的帖子总数'
          colorClass='text-blue-600 bg-blue-100'
        />
      </div>

      <div className='grid gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>用户数据分析</CardTitle>
            <CardDescription>用户增长和注册情况统计</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">新增趋势</TabsTrigger>
                <TabsTrigger value="list">最近注册</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <div className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart 
                      data={[...userData.daily_new_users].reverse()} 
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis 
                        dataKey='date' 
                        tickFormatter={(value) => dayjs(value).format('MM-DD')}
                        reversed={true}
                      />
                      <YAxis 
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        labelFormatter={(value) => dayjs(value).format('YYYY-MM-DD')}
                        formatter={(value) => [`${value} 人`, '新增用户']}
                      />
                      <Line 
                        type='monotone' 
                        dataKey='count' 
                        stroke='#22c55e'
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#22c55e' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="space-y-4">
                <div className='h-[400px] overflow-y-auto pr-2'>
                  <div className='space-y-4'>
                    {userData.recent_users.map((user) => (
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            热门话题
          </CardTitle>
          <CardDescription>最近最受欢迎的前10个话题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4 cursor-pointer'>
            {postData.trends && postData.trends.length > 0 ? (
              postData.trends.map((trend, index) => (
                <div
                  key={trend.hashtag}
                  className='flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium'>#{trend.hashtag}</p>
                      <p className='text-sm text-muted-foreground'>
                        热度 {trend.occurences} 
                      </p>
                    </div>
                  </div>
                  <TrendingUp className='h-5 w-5 text-primary' />
                </div>
              ))
            ) : (
              <div className='text-center text-muted-foreground py-4'>
                暂无热门话题数据
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
