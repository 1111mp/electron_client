import { IpcMainEvent } from 'electron';
// import notifier from 'node-notifier';
import Notifier from './notifyer';
import listener from '../../constants/listener.json';

interface NotifyOptions {
  title?: string;
  message?: string;
  icon?: string;
  sound?: boolean;
  wait?: boolean;
  actions?: string[];
}

export type PopupNotify = {
  title: string;
  content: string;
};

export default {
  // [listener.NOTIFY]() {
  //   return (event: Event, args: NotifyOptions) => {
  //     console.log(111111111);
  //     notifier.removeAllListeners();
  //     notifier.notify(
  //       {
  //         message: 'Hello',
  //         wait: true,
  //         timeout: false,
  //         actions: ['确认', 'Cancel'],
  //       },
  //       function (err, data) {
  //         // Will also wait until notification is closed.
  //         console.log('Waited');
  //         console.log('确认');
  //         console.log(err, data);
  //         // if(`${data}`.toString('utf8le') == '确认') {
  //         //   console.log('866666633333333')
  //         // }
  //       }
  //     );
  //     notifier.on('activate', () => {
  //       console.log('Clicked!');
  //     });
  //     notifier.on('dismissed', () => {
  //       console.log('Dismissed!');
  //     });
  //     // Buttons actions (lower-case):
  //     notifier.on('确认', () => {
  //       console.log('"Ok" was pressed');
  //     });
  //     notifier.on('cancel', () => {
  //       console.log('"Cancel" was pressed');
  //     });
  //   };
  // },
  /** 自定义右下角上滑通知 */
  [listener.POP_UP_NOTIFICATION]() {
    return (event: IpcMainEvent, data: PopupNotify) => {
      new Notifier(data);
    };
  },
};
