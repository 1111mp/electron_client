import { createContext, lazy, useContext } from 'react';
import {
  RouteObject,
  useRoutes,
  useLocation,
  Navigate,
} from 'react-router-dom';

const IndexPage = lazy(() => import('Renderer/main/pages/IndexPage'));
const HomePage = lazy(() => import('Renderer/main/pages/Home'));
const ChatPage = lazy(() => import('Renderer/main/pages/ChatPage'));
const AddressBook = lazy(() => import('Renderer/main/pages/AddressBook'));

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <IndexPage />,
    children: [
      {
        path: '/index',
        element: <HomePage />,
        children: [
          {
            path: '/index/chat/*',
            element: <ChatPage />,
          },
        ],
      },
      {
        path: '/addressbook',
        element: <AddressBook />,
      },
    ],
  },
];

export function RouterComponent() {
  return useRoutes(routerConfig);
}

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
