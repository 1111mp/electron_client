import request, { makeParams } from '../index';

const module = '/friend';

/**
 * @description: 获取所有的好友
 * @param {*}
 * @return {*}
 */
export function queryAll() {
  return request(`${module}/queryAll`, {
    method: 'POST',
  });
}

/**
 * @description: 好友操作接口
 * @param {required} 1 | 2 | 3 | 4 type 好友操作类型	1：添加好友	2：删除好友 3：同意 4：拒绝
 * @param {number} friendId 好友的userId
 * @param {string} remark 备注信息（加好友时）
 * @param {jsonstring} ext 扩展字段（加好友时）
 * @param {string} msgId 通知的msgId（同意拒绝时）
 * @return {*}
 */
export function handle({
  type,
  friendId,
  remark,
  ext,
  msgId,
}: {
  type: 1 | 2 | 3 | 4;
  friendId?: number;
  remark?: string;
  ext?: string;
  msgId?: string;
}) {
  const data = makeParams(['type', 'friendId', 'remark', 'ext', 'msgId'], {
    type,
    friendId,
    remark,
    ext,
    msgId,
  });

  return request(`${module}/handle`, {
    method: 'POST',
    data,
  });
}
