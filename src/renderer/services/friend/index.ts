import { request, makeParams } from '../index';

const fetcher = request('friends');

export function addFriend({
  userId,
  remark,
  ext,
}: {
  userId: number;
  remark?: string;
  ext?: string;
}) {
  const data = makeParams(['userId', 'remark', 'ext'], {
    userId,
    remark,
    ext,
  });

  return fetcher('', { method: 'POST', data });
}

export function getFriends() {
  return fetcher<{ count: number; friends: DB.UserWithFriendSetting[] }>('', {
    method: 'GET',
  });
}
