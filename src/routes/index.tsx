import { type RouteObject } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from '@/authGuard';

// Auth pages
import LoginPage from '@/pages/auth/Login';

// Dashboard pages
import DashboardPage from '@/pages/dashboard/Dashboard';
import AccountSettingsPage from '@/pages/dashboard/AccountSettings';

// Error pages
import NotFoundPage from '@/pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [{ path: '', element: <LoginPage /> }],
  },

  // Protected dashboard routes
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      { path: '', element: <DashboardPage /> },
      { path: 'account-settings', element: <AccountSettingsPage /> },
    ],
  },

  // 404 fallback
  { path: '*', element: <NotFoundPage /> },
];

export default routes;
