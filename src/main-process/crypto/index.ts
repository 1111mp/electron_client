import crypto from 'crypto';
import { getSelfKey } from './ecdh';

export function encryptedContent(message: IAnyObject) {
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    getSelfKey(),
    crypto.randomBytes(256)
  );

  let content = cipher.update(message.content, 'utf8', 'hex');
  content += cipher.final('hex');

  return {
    ...message,
    content,
    key: getSelfKey(),
  };
}

export function decryptedContent(message: IAnyObject, otherKey: string) {
  // const decipher = crypto.createDecipheriv('aes-256-gcm');
}
