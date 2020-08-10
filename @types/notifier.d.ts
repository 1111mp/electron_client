declare namespace Notifier {
  interface Args {
    title?: string;
    message?: string;
    icon?: string;
    sound?: boolean;
    wait?: boolean;
    actions?: string[];
    events?: 'click' | 'ok'[];
  }
}
