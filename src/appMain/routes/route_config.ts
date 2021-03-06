import loadable from '@loadable/component';

export interface RouterConfig {
  path: string;
  component: any;
  exact?: boolean;
  routes?: RouterConfig[];
}

// react-router-config https://www.npmjs.com/package/react-router-config
/**
 * 使用嵌套路由在父级不能用exact， 因为当你匹配路由时路径加了子路由，导致父级路由路径不匹配从而父子组件都显示不了。
 *
 */
const allRoutes = [
  {
    path: '/',
    component: loadable(() => import('appMain/pages/indexPage')),
    // exact: true,
    routes: [
      {
        path: '/index',
        component: loadable(() => import('appMain/pages/home')),
        // exact: true,
        routes: [
          {
            path: '/index/chat',
            component: loadable(() => import('appMain/pages/chatInterface')),
            // exact: true,
          },
        ],
      },
      {
        path: '/addressbook',
        // 同步加载打包
        component: loadable(() => import('appMain/pages/addressBook')),
        exact: true,
      },
    ],
  },
] as RouterConfig[];

export default allRoutes;
