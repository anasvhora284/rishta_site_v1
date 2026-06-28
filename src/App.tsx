import { Navigate, createBrowserRouter } from 'react-router-dom'
import AdminDashboardPage from '@/pages/Admin/AdminDashboardPage'
import AdminLoginPage from '@/pages/Admin/AdminLoginPage'
import AdminManagementPage from '@/pages/Admin/AdminManagementPage'
import AdminProfileDetailPage from '@/pages/Admin/AdminProfileDetailPage'
import AdminProfileEditPage from '@/pages/Admin/AdminProfileEditPage'
import AdminResetPasswordPage from '@/pages/Admin/AdminResetPasswordPage'
import FilterPage from '@/pages/Browse/FilterPage'
import ListingPage from '@/pages/Browse/ListingPage'
import HomePage from '@/pages/Home/HomePage'
import SubmitPage from '@/pages/Submit/SubmitPage'
import TeamDesignPreviewPage from '@/pages/Dev/TeamDesignPreviewPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/filter', element: <FilterPage /> },
  { path: '/userlist', element: <ListingPage /> },
  { path: '/submit', element: <SubmitPage /> },
  { path: '/team-design-preview', element: <TeamDesignPreviewPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin', element: <AdminDashboardPage /> },
  { path: '/admin/manage', element: <AdminManagementPage /> },
  { path: '/admin/reset-password', element: <AdminResetPasswordPage /> },
  { path: '/admin/profile/:id', element: <AdminProfileDetailPage /> },
  { path: '/admin/profile/:id/edit', element: <AdminProfileEditPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
