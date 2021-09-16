import { NativeThemeListener, MinimalIPC } from './NativeThemeListener';

export class Context {
  public readonly nativeThemeListener;

  constructor(ipc: MinimalIPC) {
    this.nativeThemeListener = new NativeThemeListener(ipc, window);
  }
}
