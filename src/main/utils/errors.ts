import { get, has } from 'lodash';

export function toLogFormat(error: unknown): string {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }

  if (has(error, 'message')) {
    return get(error, 'message')!;
  }

  return String(error);
}
