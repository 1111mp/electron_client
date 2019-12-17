import { WebContents } from 'electron';

export function send(webContents: WebContents, args: { channel: string, data: any }, fn?: () => void | boolean) {
  const { channel, data } = args;

  if (!webContents || webContents.isDestroyed() || webContents.isCrashed()) return;

  if (fn && fn() === false) return;

  webContents.send(channel, {
    status: 200,
    data
  });
}
