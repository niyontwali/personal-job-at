import { type RouteObject } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from '@/authGuard';

// Auth pages
import LoginPage from '@/pages/auth/Login';

// Dashboard pages
import ApplicationsPage from '@/pages/dashboard/Applications';
import ViewApplicationsPage from '@/pages/dashboard/ViewApplications';
import AccountSettingsPage from '@/pages/dashboard/AccountSettings';

// Error pages
import NotFoundPage from '@/pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [{ path: '', element: <LoginPage /> }],
  },

  // Protected applications routes
  {
    path: '/applications',
    element: <ProtectedRoute />,
    children: [
      { path: '', element: <ApplicationsPage /> },
      { path: 'view/:id', element: <ViewApplicationsPage /> },
      { path: 'account-settings', element: <AccountSettingsPage /> },
    ],
  },

  // 404 fallback
  { path: '*', element: <NotFoundPage /> },
];

export default routes;
