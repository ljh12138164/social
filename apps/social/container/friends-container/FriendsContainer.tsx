import { useFriends, useFriendSuggestions } from '@/http/useFriendship';
import { FriendRequestsDialog, FriendsList } from '.';

export const FriendsContainer = () => {
  // 获取好友列表和好友请求
  const {
    data: friendsData,
    isLoading: isLoadingFriends,
    error: friendsError,
  } = useFriends();

  // 获取好友推荐
  const {
    data: suggestionsData,
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
  } = useFriendSuggestions();

  if (friendsError || suggestionsError) {
    return (
      <div className='p-4 bg-red-50 text-red-600 rounded-lg'>
        加载数据失败，请稍后再试
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* 页面顶部的操作区域 */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-semibold'>好友列表</h2>

        {/* 好友申请按钮（弹窗） */}
        <FriendRequestsDialog
          requests={friendsData?.requests || []}
          isLoading={isLoadingFriends}
        />
      </div>

      {/* 好友列表 */}
      <FriendsList
        friends={friendsData?.friends || []}
        isLoading={isLoadingFriends}
      />

      {/* 好友推荐 */}
      {/* <FriendSuggestions
        suggestions={suggestionsData || []}
        isLoading={isLoadingSuggestions}
      /> */}
    </div>
  );
};
