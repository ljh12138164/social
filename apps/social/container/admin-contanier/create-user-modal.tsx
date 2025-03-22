'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminCreateUser } from '@/http/useAdmin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// 表单验证规则
const formSchema = z.object({
  name: z.string().min(2, '名称至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  bio: z.string().optional(),
  is_admin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof formSchema>;

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  const createUser = useAdminCreateUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      bio: '',
      is_admin: false,
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      await createUser.mutateAsync(values);
      form.reset(); // 重置表单
      onOpenChange(false);
      toast.success('用户创建成功');
    } catch (error) {
      toast.error('用户创建失败');
      console.error('创建用户失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>创建新用户</DialogTitle>
          <DialogDescription>添加一个新用户到系统中</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
