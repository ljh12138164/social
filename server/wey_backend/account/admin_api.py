from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

from .models import User, FriendshipRequest, MibtTestResult
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """获取所有用户列表，仅限管理员访问"""
    search = request.GET.get('search', '')
    is_active = request.GET.get('is_active', None)
    is_staff = request.GET.get('is_staff', None)
    
    users = User.objects.all().order_by('-date_joined')
    
    if search:
        users = users.filter(email__icontains=search) | users.filter(name__icontains=search)
    
    if is_active is not None:
        is_active = is_active.lower() == 'true'
        users = users.filter(is_active=is_active)
        
    if is_staff is not None:
        is_staff = is_staff.lower() == 'true'
        users = users.filter(is_staff=is_staff)
    
    serializer = UserSerializer(users, many=True)
    
    return JsonResponse({
        'users': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    """获取特定用户详情，仅限管理员访问"""
    user = get_object_or_404(User, id=user_id)
    serializer = UserSerializer(user)
    
    # 获取用户好友请求
    friendship_requests_received = FriendshipRequest.objects.filter(created_for=user)
    friendship_requests_sent = FriendshipRequest.objects.filter(created_by=user)
    
    # 获取MBTI测试结果
    try:
        mibt_result = MibtTestResult.objects.get(user=user)
        mibt_data = {
            'personality_type': mibt_result.personality_type,
            'personality_category': mibt_result.personality_category,
            'created_at': mibt_result.created_at
        }
    except MibtTestResult.DoesNotExist:
        mibt_data = None
    
    return JsonResponse({
        'user': serializer.data,
        'friendship_requests': {
            'received': friendship_requests_received.count(),
            'sent': friendship_requests_sent.count()
        },
        'mibt_result': mibt_data
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_user(request):
    """创建新用户，仅限管理员访问"""
    data = request.data
    
    # 检查邮箱是否已存在
    if User.objects.filter(email=data.get('email')).exists():
        return JsonResponse({
            'success': False,
            'message': '该邮箱已被注册'
        }, status=400)
    
    # 创建新用户
    user = User.objects.create(
        email=data.get('email'),
        name=data.get('name', ''),
        password=make_password(data.get('password')),
        is_active=data.get('is_active', True),
        is_staff=data.get('is_staff', False),
        is_superuser=data.get('is_superuser', False)
    )
    
    serializer = UserSerializer(user)
    
    return JsonResponse({
        'success': True,
        'user': serializer.data
    }, status=201)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_user(request, user_id):
    """更新用户信息，仅限管理员访问"""
    user = get_object_or_404(User, id=user_id)
    data = request.data
    
    # 更新用户信息
    if 'email' in data and data['email'] != user.email:
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({
                'success': False,
                'message': '该邮箱已被注册'
            }, status=400)
        user.email = data['email']
    
    if 'name' in data:
        user.name = data['name']
        
    if 'bio' in data:
        user.bio = data['bio']
        
    if 'is_active' in data:
        user.is_active = data['is_active']
        
    if 'is_staff' in data:
        user.is_staff = data['is_staff']
        
    if 'is_superuser' in data:
        user.is_superuser = data['is_superuser']
    
    # 如果提供了新密码，则更新密码
    if 'password' in data and data['password']:
        user.password = make_password(data['password'])
    
    user.save()
    
    serializer = UserSerializer(user)
    
    return JsonResponse({
        'success': True,
        'user': serializer.data
    })


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_user(request, user_id):
    """删除用户，仅限管理员访问"""
    user = get_object_or_404(User, id=user_id)
    
    # 删除用户(保存邮箱，防止将来重新注册)
    user.is_active = False
    user.email = f"deleted_{user.email}"
    user.save()
    
    # 如果需要物理删除用户，请使用以下代码
    # user.delete()
    
    return JsonResponse({
        'success': True,
        'message': '用户已成功删除'
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_statistics(request):
    """获取用户统计信息，仅限管理员访问"""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = User.objects.filter(is_active=False).count()
    staff_users = User.objects.filter(is_staff=True).count()
    superusers = User.objects.filter(is_superuser=True).count()
    
    # 获取最近注册的用户
    recent_users = User.objects.order_by('-date_joined')[:5]
    recent_users_serializer = UserSerializer(recent_users, many=True)
    
    # 获取各MBTI类型的用户数量统计
    mbti_stats = {}
    for result in MibtTestResult.objects.all():
        if result.personality_type in mbti_stats:
            mbti_stats[result.personality_type] += 1
        else:
            mbti_stats[result.personality_type] = 1
    
    return JsonResponse({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'staff_users': staff_users,
        'superusers': superusers,
        'recent_users': recent_users_serializer.data,
        'mbti_statistics': mbti_stats
    }) 