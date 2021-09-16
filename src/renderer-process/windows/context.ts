import { ipcRenderer as ipc } from 'electron';

import { Context } from '../context';

window.SignalContext = new Context(ipc);
