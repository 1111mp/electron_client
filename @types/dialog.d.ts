declare namespace IDialog {
  type type = 'modal' | 'alert' | 'confirm' | 'error' | 'network';

  interface props {
    parent?: any; // BrowserWindow
    type?: type;
    title?: string;
    message?: string;
    data?: IAnyObject;
    autoOpen?: boolean;
    confirm?: VoidFunction;
    icon?: 'network' | 'error';
    tips?: string;
    x?: number;
    y?: number;
  }

  interface state {
    title?: string;
    type: type;
    tips?: string;
    icon?: string;
    message: string;
    data?: IAnyObject;
  }

  interface stack {
    [id: string]: any;
  }
}
