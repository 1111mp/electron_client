import { Theme } from 'App/types';

export function applyTheme() {
  const theme =
    window.systemTheme === Theme.system
      ? window.Context.getSystemTheme()
      : window.systemTheme;

  if (window.document.body.classList.contains(`${theme}-theme`)) return;

  window.document.body.classList.remove('dark-theme');
  window.document.body.classList.remove('light-theme');
  window.document.body.classList.add(`${theme}-theme`);
}

export async function getThemeFromDatabase() {
  const user = await window.Context.sqlClient.getUserInfo();

  if (!user) return { theme: window.systemTheme || 'system' };

  return user;
}
