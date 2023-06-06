import { createContext, useContext } from 'react';
import {
  RouteObject,
  useLocation,
  Navigate,
  createHashRouter,
} from 'react-router-dom';

import {
  Conversation,
  loader as ConversationLoader,
} from 'Renderer/main/pages/Conversation';

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    lazy: () => import('Renderer/main/pages/Home'),
    children: [
      {
        path: 'index',
        lazy: () => import('Renderer/main/pages/IndexPage'),
        children: [
          {
            index: true,
            lazy: () => import('Renderer/components/Empty'),
          },
          {
            path: 'conversation/:id',
            loader: ConversationLoader,
            element: <Conversation />,
          },
        ],
      },
      {
        path: 'addressbook',
        lazy: () => import('Renderer/main/pages/AddressBook'),
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
