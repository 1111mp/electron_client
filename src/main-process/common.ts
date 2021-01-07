import { WebContents } from 'electron';

export function send(
  webContents: WebContents,
  args: { channel: string; data: any },
  fn?: () => void | boolean
) {
  const { channel, data } = args;

  if (!webContents || webContents.isDestroyed() || webContents.isCrashed())
    return;

  if (fn && fn() === false) return;

  webContents.send(channel, {
    status: 200,
    data,
  });
}

/** linear */
export function linear(
  currentTime: number,
  startValue: number,
  changeValue: number,
  duration: number,
  increase: boolean = true
) {
  return increase
    ? (changeValue * currentTime) / duration + startValue
    : startValue - (changeValue * currentTime) / duration;
}

/** ease-in */
export function easeInQuad(
  currentTime: number,
  startValue: number,
  changeValue: number,
  duration: number,
  increase: boolean = true
) {
  currentTime /= duration;
  return increase
    ? changeValue * currentTime * currentTime + startValue
    : startValue - changeValue * currentTime * currentTime;
}

/** ease-out */
export function easeOutQuad(
  currentTime: number,
  startValue: number,
  changeValue: number,
  duration: number,
  increase: boolean = true
): number {
  currentTime /= duration;
  return increase
    ? -changeValue * currentTime * (currentTime - 2) + startValue
    : startValue - -changeValue * currentTime * (currentTime - 2);
}
