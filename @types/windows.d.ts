import { WindowName, WindowUrl } from 'App/types';

declare global {
  namespace Windows {
    type Base = {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
      title?: string;
      frame?: boolean;
      center?: boolean;
      resizable?: boolean;
      search?: SearchType;
      modal?: boolean;
    };

    type Entity =
      | {
          name: WindowName.Setting;
          url: WindowUrl.Setting;
        }
      | { name: WindowName.Info; url: WindowUrl.Info };

    type Args = Entity & Base;

    type SearchType = { [key: string]: string };
  }
}
