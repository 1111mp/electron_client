/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: ({
  html,
  search,
}: {
  html: string;
  url?: string;
  search?: Windows.SearchType;
}) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = ({ html, url: hash, search }) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = html;
    if (hash !== undefined) {
      url.hash = hash;
    }
    if (search !== undefined) {
      url.search = new URLSearchParams(search).toString();
    }
    return url.href;
  };
} else {
  resolveHtmlPath = ({ html, url, search }) => {
    const searchStr = new URLSearchParams(search).toString();
    return `file://${path.resolve(__dirname, '../renderer/', html)}${
      url ? `#${url}?` : '?'
    }${searchStr}`;
  };
}
