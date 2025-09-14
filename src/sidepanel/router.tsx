import { createMemoryRouter } from 'react-router';
import { Layout } from './Layout';
import { ManagerPage } from './pages/ManagerPage';
import { ConfigPage } from './pages/ConfigPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './NotFoundPage';
import { ErrorBoundary } from './ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import type { RouteObject } from 'react-router';

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ManagerPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'config',
        element: (
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
] satisfies RouteObject[]);