'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminUpdateUser, User } from '@/http/useAdmin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, '名称至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  bio: z.string().optional(),
  password: z.string().optional(),
  is_admin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserEditModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserEditModal = ({ user, open, onOpenChange }: UserEditModalProps) => {
  const updateUser = useAdminUpdateUser(user.id);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      is_admin: user.is_admin,
    },
  });

  // 监听用户数据变化，重置表单
  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      is_admin: user.is_admin,
    });
  }, [user, form]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      // 如果密码为空，不更新密码
      const data = { ...values };
      if (!data.password) {
        delete data.password;
      }

      await updateUser.mutateAsync(data);
      onOpenChange(false);
      toast.success('用户信息更新成功');
    } catch (error) {
      toast.error('用户信息更新失败');
      console.error('更新用户失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>编辑用户信息</DialogTitle>
          <DialogDescription>更新用户的个人信息和权限设置</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <Label>用户名</Label>
          <Input placeholder='请输入用户名' {...form.register('name')} />

          <Label>邮箱</Label>
          <Input
            type='email'
            placeholder='请输入邮箱地址'
            {...form.register('email')}
          />

          <Label>个人简介</Label>
          <Textarea placeholder='请输入个人简介' {...form.register('bio')} />

          <div className='flex items-center gap-2'>
            <Checkbox
              defaultChecked={user.is_admin}
              onCheckedChange={(checked) =>
                form.setValue('is_admin', checked === true)
              }
            />
            <Label>管理员权限</Label>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={updateUser.isPending}>
              {updateUser.isPending ? '保存中...' : '保存更改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
