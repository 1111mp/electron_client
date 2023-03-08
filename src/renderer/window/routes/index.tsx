import { RouteObject, useRoutes } from 'react-router-dom';
import loadable from '@loadable/component';

const Setting = loadable(() => import('Renderer/window/pages/Setting'));
const Search = loadable(() => import('Renderer/window/pages/Search'));

export const routerConfig: RouteObject[] = [
  {
    path: '/setting/*',
    element: <Setting />,
  },
  {
    path: '/search/*',
    element: <Search />,
  },
];

export function RouterComponent() {
  return useRoutes(routerConfig);
}
