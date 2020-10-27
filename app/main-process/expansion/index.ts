import { BrowserWindow, IpcMainEvent, screen } from 'electron';
import listener from '../../constants/listener.json';
import Expansion from './expansion';
import { EXPANSION } from '../../config';

export default function (mainWindow: BrowserWindow | null) {
  return {
    [listener.INTERFACE_EXPANSION]() {
      return (event: IpcMainEvent) => {
        if (!mainWindow) return;
        console.log(mainWindow!.getBounds());
        console.log(mainWindow!.getContentBounds());

        const { x, y, width, height } = mainWindow!.getBounds();
        const {
          y: contentY,
          width: contentWidth,
          height: contentHeight,
        } = mainWindow!.getContentBounds();
        const display = screen.getPrimaryDisplay().workAreaSize;

        const leftWidth = display.width - (x + width) > EXPANSION.width + 20;

        leftWidth && mainWindow!.setAlwaysOnTop(true);

        new Expansion({
          x: leftWidth ? x + width - EXPANSION.width : x + width,
          y: leftWidth ? y : contentY + 36,
          height: leftWidth ? height : contentHeight - 36,
          mainWindow,
          leftWidth,
        });
      };
    },
  };
}
