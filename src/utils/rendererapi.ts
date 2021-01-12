import initRendererProcess from 'app/renderer-process';
import listener from 'constants/listener.json';

export interface OpenArgs {
  url: string;
  width?: number;
  height?: number;
  id?: string;
  modal?: boolean;
}

export function openWeb({ url, width, height, id, modal = false }: OpenArgs) {
  if (typeof window === 'undefined') return;

  initRendererProcess().send(listener.CUSTOM_WIN_SHOW, {
    url,
    width,
    height,
    id,
    modal,
  });
}
