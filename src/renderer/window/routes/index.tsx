import { Suspense, lazy } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';

const Setting = lazy(() => import('Renderer/window/pages/Setting'));
const Search = lazy(() => import('Renderer/window/pages/Search'));

export const routerConfig: RouteObject[] = [
  {
    path: '/setting/*',
    element: (
      <Suspense>
        <Setting />
      </Suspense>
    ),
  },
  {
    path: '/search/*',
    element: (
      <Suspense>
        <Search />
      </Suspense>
    ),
  },
];

export function RouterComponent() {
  return useRoutes(routerConfig);
}
