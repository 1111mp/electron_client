/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export type SearchType = { [key: string]: string };

export let resolveHtmlPath: ({
  html,
  search,
}: {
  html: string;
  url?: string;
  search?: SearchType;
}) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = ({ html, url: hash, search }) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = html;
    if (hash !== void 0) {
      url.hash = hash;
    }
    if (search !== void 0) {
      url.search = new URLSearchParams(search).toString();
    }
    return url.href;
  };
} else {
  resolveHtmlPath = ({ html, url, search }) => {
    const search_str = new URLSearchParams(search).toString();
    return `file://${path.resolve(__dirname, '../renderer/', html)}${
      url ? `#${url}` : ''
    }${search_str}`;
  };
}
