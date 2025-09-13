import { createMemoryRouter } from 'react-router';
import { Layout } from './Layout';
import { HighlightsManager } from './pages/HighlightsManager';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './NotFoundPage';
import { ErrorBoundary } from './ErrorBoundary';
import type { RouteObject } from 'react-router';

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HighlightsManager />
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