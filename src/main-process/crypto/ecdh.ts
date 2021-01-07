import crypto from 'crypto';

/**
 * 客户端：
 *  用户注册时，生成privateKey
 *  之后的验证：
 *    const self = crypto.createECDH('secp521r1')
 *    self.setPrivateKey(privateKey, 'hex');
 *    然后通过self.computeSecret(otherPubKey).toString('hex') 获取到最终的密钥
 *  所以，实现发消息的端到端加密的第一步 需要如下条件：
 *    A客户端 需要有自己的 privateKey 和 B客户端的 publicKey，反之B客户端也一样
 *    privateKey 只能存在客户端 不同客户端应该有不同的privateKey吗？ 不应该 这样新设备就不能对消息进行解密了 所以在新设备登录时 需要本人同意并放权
 *    然后新客户端从原来客户端 拿到privateKey 这一步会经过服务器 但不是服务器不能保存用户privateKey 要不然端到端加密 不成立
 *    传递privateKey的这一步 需要保证安全 对这一过程加密
 *      ECDH + RSA  RSA有必要吗？
 */

export function getSelfKey(): Buffer {
  /** 这个key 不应该每次都生成，应该是用户注册帐号是生成，只存在客户端，所以切换客户端，会重新生成 */
  const selfKey = crypto.createECDH('secp521r1');

  return selfKey.generateKeys();
}
