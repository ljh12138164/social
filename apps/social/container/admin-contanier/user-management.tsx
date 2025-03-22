'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminDeleteUser, useAdminUsersList, User } from '@/http/useAdmin';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import { Edit, MoreHorizontal, Search, Trash } from 'lucide-react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import UserEditModal from './user-edit-modal';
// 安全格式化日期的辅助函数
const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'null') {
    return '从未登录';
  }

  try {
    const date = new Date(dateString);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    return dayjs(date).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期错误';
  }
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useAdminUsersList(searchTerm);
  const deleteUser = useAdminDeleteUser(selectedUser?.id || '');

  const debouncedSearch = debounce(
    (value: string) => {
      setSearchTerm(value);
    },
    500,
    { maxWait: 500 }
  );
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleEdit = (user: User) => {
    flushSync(() => {
      setSelectedUser(user);
      setEditModalOpen(true);
    });
  };

  const handleDelete = (user: User) => {
    flushSync(() => {
      setSelectedUser(user);
      setDeleteDialogOpen(true);
    });
  };

  // 关闭编辑模态框时重置选中的用户
  const handleEditModalChange = (open: boolean) => {
    setEditModalOpen(open);
    if (!open) {
      // 当模态框关闭时，重置选中的用户
      setTimeout(() => {
        setSelectedUser(null);
      }, 100);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      // 删除成功后刷新用户列表
      refetch();
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  };
  return (
    <div>
      <div className='mb-4 flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='搜索用户...'
            className='pl-8'
            onChange={handleSearch}
          />
        </div>
        <Button variant='outline' onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>角色</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  加载中...
                </TableCell>
              </TableRow>
            ) : data?.users && data.users.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.get_avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium'>{user.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-sm'>
                    {dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge className='bg-purple-100 text-purple-600'>
                        超级管理员
                      </Badge>
                    ) : (
                      <Badge className='bg-gray-100 text-gray-600'>
                        普通用户
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className='mr-2 h-4 w-4' />
                          <span>编辑</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(user)}
                          className='text-red-600 focus:text-red-600'
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          <span>删除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  没有找到用户
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 编辑用户模态框 */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          open={editModalOpen}
          onOpenChange={handleEditModalChange}
        />
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              你确定要删除用户 "{selectedUser?.name}" ({selectedUser?.email})
              吗？此操作不可逆。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:justify-end'>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? '正在删除...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
