import { RouteObject, createHashRouter } from 'react-router-dom';

import Setting from 'Renderer/window/pages/Setting';
import Search from 'Renderer/window/pages/Search';

export const routerConfig: RouteObject[] = [
  {
    path: '/setting',
    element: <Setting />,
  },
  {
    path: '/search',
    element: <Search />,
  },
];

export const router = createHashRouter(routerConfig);
