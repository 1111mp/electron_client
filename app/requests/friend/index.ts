import request from '../index';

/**
 * @description: 获取所有的好友
 * @param {*}
 * @return {*}
 */
export async function queryAll() {
  return request('/friend/queryAll');
}
