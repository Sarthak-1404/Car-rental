import { useState, useEffect } from 'react';
import axios from 'axios';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/bookings');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/admin/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status. Please try again.');
      console.error('Error updating booking status:', err);
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Car
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  #{booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {booking.user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {booking.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {booking.car.brand} {booking.car.model}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {booking.car.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    to {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${booking.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openDetailsModal(booking)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View Details
                  </button>
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {selectedBooking.user.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {selectedBooking.user.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{' '}
                    {selectedBooking.user.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Car Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Car:</span>{' '}
                    {selectedBooking.car.brand} {selectedBooking.car.model}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{' '}
                    {selectedBooking.car.type}
                  </p>
                  <p>
                    <span className="font-medium">Year:</span>{' '}
                    {selectedBooking.car.year}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Start Date:</span>{' '}
                    {new Date(selectedBooking.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">End Date:</span>{' '}
                    {new Date(selectedBooking.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{' '}
                    {selectedBooking.duration} days
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Total Amount:</span>{' '}
                    ${selectedBooking.totalAmount}
                  </p>
                  <p>
                    <span className="font-medium">Payment Status:</span>{' '}
                    {selectedBooking.paymentStatus}
                  </p>
                  <p>
                    <span className="font-medium">Payment Method:</span>{' '}
                    {selectedBooking.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedBooking.notes || 'No additional notes provided.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings; 