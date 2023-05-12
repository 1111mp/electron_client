import { createContext, useContext } from 'react';
import {
  RouteObject,
  useLocation,
  Navigate,
  createHashRouter,
} from 'react-router-dom';

import Home from 'Renderer/main/pages/Home';
import IndexPage from 'Renderer/main/pages/IndexPage';
import Room from 'Renderer/main/pages/Room';
import AddressBook from 'Renderer/main/pages/AddressBook';
import { Empty } from 'App/renderer/components/Empty';

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <Home />,

    children: [
      {
        path: 'index',
        element: <IndexPage />,
        children: [
          {
            index: true,
            element: <Empty />,
          },
          {
            path: 'room/:roomId',
            element: <Room />,
          },
        ],
      },
      {
        path: 'addressbook',
        element: <AddressBook />,
      },
    ],
  },
];

export const router = createHashRouter(routerConfig);

// TODO permission
type Auths = string[] | 403 | null;

interface AuthContextType {
  auths: Auths;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({
  auths,
  children,
}: {
  auths: Auths;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ auths }}>{children}</AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function RequireAuth({
  children,
  auth = [],
}: {
  children: JSX.Element;
  auth?: string[];
}) {
  const { auths } = useAuth();
  const location = useLocation();

  if (
    auths === 403 ||
    auths === null ||
    (auth.length && !auth.some((cur) => auths.indexOf(cur) !== -1))
  ) {
    return <Navigate to="/deny" state={{ from: location }} />;
  }

  return children;
}
