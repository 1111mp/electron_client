/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath({
  html,
  hash,
  search,
}: {
  html: string;
  hash?: string;
  search?: Windows.SearchType;
}) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);

    url.pathname = html;
    hash && (url.hash = hash);
    search && (url.search = new URLSearchParams(search).toString());

    return url.href;
  }

  const searchStr = new URLSearchParams(search).toString();
  return `file://${path.resolve(__dirname, '../renderer/', html)}${
    hash ? `#${hash}?` : '?'
  }${searchStr}`;
}
