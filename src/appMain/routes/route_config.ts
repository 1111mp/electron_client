import loadable from '@loadable/component';
import Home from 'appMain/pages/home';
import AddressBook from 'appMain/pages/addressBook';

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
    exact: true,
  },
  {
    path: '/index',
    component: Home,
    // exact: true,
    routes: [
      {
        path: '/index/chat',
        component: loadable(() => import('appMain/pages/chatInterface')),
        exact: true,
      },
    ],
  },
  {
    path: '/addressbook',
    // 同步加载打包
    component: AddressBook,
    exact: true,
  },
] as RouterConfig[];

export default allRoutes;
