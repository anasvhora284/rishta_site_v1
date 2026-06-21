import { Navigate, createBrowserRouter } from 'react-router-dom'
import AdminDashboardPage from '@/pages/Admin/AdminDashboardPage'
import AdminLoginPage from '@/pages/Admin/AdminLoginPage'
import AdminProfileDetailPage from '@/pages/Admin/AdminProfileDetailPage'
import AdminProfileEditPage from '@/pages/Admin/AdminProfileEditPage'
import FilterPage from '@/pages/Browse/FilterPage'
import ListingPage from '@/pages/Browse/ListingPage'
import HomePage from '@/pages/Home/HomePage'
import SubmitPage from '@/pages/Submit/SubmitPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/filter', element: <FilterPage /> },
  { path: '/userlist', element: <ListingPage /> },
  { path: '/submit', element: <SubmitPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin', element: <AdminDashboardPage /> },
  { path: '/admin/profile/:id', element: <AdminProfileDetailPage /> },
  { path: '/admin/profile/:id/edit', element: <AdminProfileEditPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
