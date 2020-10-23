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
];
