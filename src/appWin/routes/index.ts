import loadable from '@loadable/component';

export default [
  {
    path: '/',
    component: loadable(() => import('appWin/pages/home')),
    exact: true,
  },
  {
    path: '/settings',
    component: loadable(() => import('appWin/pages/settings')),
    exact: true,
  },
  {
    path: '/addfriend',
    component: loadable(() => import('appWin/pages/addFriend')),
    exact: true,
  },
  {
    path: '/notifier',
    component: loadable(() => import('appWin/pages/notifier')),
    exact: true,
  },
  {
    path: '/dialog',
    component: loadable(() => import('components/dialog')),
    exact: true,
  },
  {
    path: '/browser',
    component: loadable(() => import('components/browser')),
    exact: true,
  },
];
