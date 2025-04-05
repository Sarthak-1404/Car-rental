import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Cars from '../pages/Cars';
import Booking from '../pages/Booking';
import BookingSuccess from '../pages/BookingSuccess';
import MyBookings from '../pages/MyBookings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCars from '../pages/admin/Cars';
import AdminBookings from '../pages/admin/Bookings';
import AdminUsers from '../pages/admin/Users';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'cars',
        element: <Cars />,
      },
      {
        path: 'booking/:carId',
        element: (
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        ),
      },
      {
        path: 'booking-success',
        element: (
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/cars',
        element: (
          <AdminRoute>
            <AdminCars />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/bookings',
        element: (
          <AdminRoute>
            <AdminBookings />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
    ],
  },
]); 