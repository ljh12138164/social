from django.db.models import Q
from django.http import JsonResponse
from django.http.response import HttpResponseBadRequest

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status

from account.models import User, FriendshipRequest
from account.serializers import UserSerializer
from notification.utils import create_notification

from .forms import PostForm, AttachmentForm
from .models import Post, Like, Comment, Trend
from .serializers import PostSerializer, PostDetailSerializer, CommentSerializer, TrendSerializer


@api_view(['GET'])
def post_list(request):
    user_ids = [request.user.id]

    for user in request.user.friends.all():
        user_ids.append(user.id)

    posts = Post.objects.filter(created_by_id__in=list(user_ids))

    trend = request.GET.get('trend', '')

    if trend:
        posts = posts.filter(body__icontains='#' + trend).filter(is_private=False)

    serializer = PostSerializer(posts, many=True, context={'request': request})

    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
def post_detail(request, pk):
    user_ids = [request.user.id]

    for user in request.user.friends.all():
        user_ids.append(user.id)

    post = Post.objects.filter(Q(created_by_id__in=list(user_ids)) | Q(is_private=False)).get(pk=pk)

    return JsonResponse({
        'post': PostDetailSerializer(post, context={'request': request}).data
    })


@api_view(['GET'])
def post_list_profile(request, id):   
    user = User.objects.get(pk=id)
    posts = Post.objects.filter(created_by_id=id)

    # 判断是否为好友
    is_friend = request.user in user.friends.all()

    if not is_friend:
        posts = posts.filter(is_private=False)

    posts_serializer = PostSerializer(posts, many=True, context={'request': request})
    user_serializer = UserSerializer(user)

    can_send_friendship_request = True

    if is_friend:
        can_send_friendship_request = False
    
    check1 = FriendshipRequest.objects.filter(created_for=request.user).filter(created_by=user)
    check2 = FriendshipRequest.objects.filter(created_for=user).filter(created_by=request.user)

    if check1 or check2:
        can_send_friendship_request = False

    return JsonResponse({
        'posts': posts_serializer.data,
        'user': user_serializer.data,
        'can_send_friendship_request': can_send_friendship_request,
        'is_friend': is_friend
    }, safe=False)


@api_view(['POST'])
def post_create(request):
    form = PostForm(request.POST)
    attachment = None
    attachment_form = AttachmentForm(request.POST, request.FILES)

    if attachment_form.is_valid():
        attachment = attachment_form.save(commit=False)
        attachment.created_by = request.user
        attachment.save()

    if form.is_valid():
        post = form.save(commit=False)
        post.created_by = request.user
        post.save()

        if attachment:
            post.attachments.add(attachment)

        user = request.user
        user.posts_count = user.posts_count + 1
        user.save()

        serializer = PostSerializer(post, context={'request': request})

        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'error': 'add somehting here later!...'})
    

@api_view(['POST'])
def post_like(request, pk):
    post = Post.objects.get(pk=pk)

    if not post.likes.filter(created_by=request.user):
        like = Like.objects.create(created_by=request.user)

        post = Post.objects.get(pk=pk)
        post.likes_count = post.likes_count + 1
        post.likes.add(like)
        post.save()

        notification = create_notification(request, 'post_like', post_id=post.id)

        serializer = PostSerializer(post, context={'request': request})
        return JsonResponse(serializer.data, safe=False)
    else:
        # 如果已经点赞，则取消点赞
        like = post.likes.filter(created_by=request.user).first()
        if like:
            post.likes.remove(like)
            post.likes_count = post.likes_count - 1
            post.save()
            like.delete()

        serializer = PostSerializer(post, context={'request': request})
        return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
def post_create_comment(request, pk):
    comment = Comment.objects.create(body=request.data.get('body'), created_by=request.user)

    post = Post.objects.get(pk=pk)
    post.comments.add(comment)
    post.comments_count = post.comments_count + 1
    post.save()

    notification = create_notification(request, 'post_comment', post_id=post.id)

    serializer = CommentSerializer(comment, context={'request': request})

    return JsonResponse(serializer.data, safe=False)


@api_view(['DELETE'])
def post_delete(request, pk):
    post = Post.objects.filter(created_by=request.user).get(pk=pk)
    post.delete()

    return JsonResponse({'message': 'post deleted'})


@api_view(['POST'])
def post_report(request, pk):
    post = Post.objects.get(pk=pk)
    post.reported_by_users.add(request.user)
    post.save()

    return JsonResponse({'message': 'post reported'})


@api_view(['GET'])
def get_trends(request):
    serializer = TrendSerializer(Trend.objects.all(), many=True)

    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
def comment_like(request, pk, comment_id):
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # 检查用户是否已对评论点赞
    like_exists = comment.likes.filter(created_by=request.user).exists()

    if not like_exists:
        # 创建点赞
        like = Like.objects.create(created_by=request.user)
        comment.likes.add(like)
        comment.likes_count += 1
        comment.save()
        
        # 可选：创建通知
        create_notification(request, 'comment_like', comment_id=comment.id)
    else:
        # 取消点赞
        like = comment.likes.filter(created_by=request.user).first()
        if like:
            comment.likes.remove(like)
            comment.likes_count -= 1
            comment.save()
            like.delete()

    serializer = CommentSerializer(comment, context={'request': request})
    return Response(serializer.data)