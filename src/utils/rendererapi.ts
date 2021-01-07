import RendererProcess from 'app/renderer-process';
import listener from 'constants/listener.json';

export interface OpenArgs {
  url: string;
  width?: number;
  height?: number;
  id?: string;
}

export function openWeb({ url, width, height, id }: OpenArgs) {
  if (typeof window === 'undefined') return;

  RendererProcess.getInstance().send(listener.CUSTOM_WIN_SHOW, {
    url,
    width,
    height,
    id,
  });
}
