import { RouteObject, useRoutes } from 'react-router-dom';
import loadable from '@loadable/component';

const Setting = loadable(() => import('Renderer/window/pages/Setting'));

export const routerConfig: RouteObject[] = [
  {
    path: '/setting/*',
    element: <Setting />,
  },
];

export function RouterComponent() {
  return useRoutes(routerConfig);
}
