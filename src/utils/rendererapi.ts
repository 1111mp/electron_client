import initRendererProcess, { RendererProcess } from 'app/renderer-process';
import listener from 'constants/listener.json';

export interface OpenArgs {
  url: string;
  width?: number;
  height?: number;
  id?: string;
  modal?: boolean;
}

const rendererInstance: RendererProcess = initRendererProcess();

export function openWeb({ url, width, height, id, modal = false }: OpenArgs) {
  if (typeof window === 'undefined') return;

  rendererInstance.send(listener.CUSTOM_WIN_SHOW, {
    url,
    width,
    height,
    id,
    modal,
  });
}

/** 渲染线程往主线程中发送channel */
export function send(channel: string, args?: any): void {
  return rendererInstance.send(channel, args);
}

/** 向主线程发送消息 异步获取结果 */
export function invoke(channel: string, args?: any): Promise<any> {
  return rendererInstance.invoke(channel, args);
}

export function minimize(): void {
  rendererInstance.minimize();
}

export function closeWin(): void {
  rendererInstance.close();
}
