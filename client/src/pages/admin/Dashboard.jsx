import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics. Please try again later.');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Cars
          </h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalCars}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Active Bookings
          </h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.activeBookings}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-purple-600">${stats.revenue}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/cars"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Manage Cars
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add, edit, or remove cars from the inventory
          </p>
        </Link>
        <Link
          to="/admin/bookings"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Manage Bookings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all bookings
          </p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Manage Users
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage user accounts
          </p>
        </Link>
        <Link
          to="/admin/reports"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View analytics and generate reports
          </p>
        </Link>
        <Link
          to="/admin/settings"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system settings
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 