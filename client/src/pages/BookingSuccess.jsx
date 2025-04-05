import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const BookingSuccess = () => {
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get('/api/bookings/latest');
        setBooking(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch booking details. Please try again later.');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Booking Confirmed!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Thank you for choosing our car rental service.
          </p>
        </div>

        {booking && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Booking Details
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Booking ID:</span> {booking.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Car:</span> {booking.car.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Start Date:</span>{' '}
                    {new Date(booking.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">End Date:</span>{' '}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Total Price:</span> ${booking.totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Next Steps
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1. You will receive a confirmation email shortly.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2. Please arrive at the pickup location 15 minutes before your scheduled time.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3. Bring your valid driver's license and booking confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Link
            to="/my-bookings"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View My Bookings
          </Link>
          <Link
            to="/cars"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Browse More Cars
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 