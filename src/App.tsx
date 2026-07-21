import { Navigate, createBrowserRouter } from 'react-router-dom'
import RouteSeo from '@/components/RouteSeo'
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

const HOME_DESCRIPTION =
  'ચરોતર સુન્ની વ્હોરા સુધારક મંડળના 68 સમાજ માટે સુરક્ષિત રિશ્તા પોર્ટલ. 68 Vhora Samaj families can browse and submit matrimonial profiles.'
const PORTAL_DESCRIPTION = 'Private profile service for members of the 68 Vhora Samaj community.'
const ADMIN_DESCRIPTION = 'Private administration area for the 68 Vhora Rishta portal.'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RouteSeo
        title="68 Vhora Rishta | 68 સમાજ રિશ્તા પોર્ટલ"
        description={HOME_DESCRIPTION}
        indexable
      >
        <HomePage />
      </RouteSeo>
    ),
  },
  {
    path: '/filter',
    element: (
      <RouteSeo title="Find a Profile | 68 Vhora Rishta" description={PORTAL_DESCRIPTION}>
        <FilterPage />
      </RouteSeo>
    ),
  },
  {
    path: '/userlist',
    element: (
      <RouteSeo title="Profile Results | 68 Vhora Rishta" description={PORTAL_DESCRIPTION}>
        <ListingPage />
      </RouteSeo>
    ),
  },
  {
    path: '/submit',
    element: (
      <RouteSeo title="Submit a Profile | 68 Vhora Rishta" description={PORTAL_DESCRIPTION}>
        <SubmitPage />
      </RouteSeo>
    ),
  },
  {
    path: '/team-design-preview',
    element: (
      <RouteSeo title="Design Preview | 68 Vhora Rishta" description={PORTAL_DESCRIPTION}>
        <TeamDesignPreviewPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <RouteSeo title="Admin Login | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminLoginPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin',
    element: (
      <RouteSeo title="Admin Dashboard | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminDashboardPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin/manage',
    element: (
      <RouteSeo title="Manage Admins | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminManagementPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin/reset-password',
    element: (
      <RouteSeo title="Reset Admin Password | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminResetPasswordPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin/profile/:id',
    element: (
      <RouteSeo title="Review Profile | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminProfileDetailPage />
      </RouteSeo>
    ),
  },
  {
    path: '/admin/profile/:id/edit',
    element: (
      <RouteSeo title="Edit Profile | 68 Vhora Rishta" description={ADMIN_DESCRIPTION}>
        <AdminProfileEditPage />
      </RouteSeo>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
