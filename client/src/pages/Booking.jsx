import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm = ({ car, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    return calculateTotalDays() * car.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create payment intent
      const response = await axios.post('/api/payments/create-intent', {
        amount: calculateTotalPrice() * 100, // Convert to cents
        currency: 'usd',
      });

      const { clientSecret } = response.data;

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Create booking
      await axios.post('/api/bookings', {
        carId: car.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        totalPrice: calculateTotalPrice(),
        paymentIntentId: paymentIntent.id,
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={bookingData.startDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={bookingData.endDate}
            onChange={handleInputChange}
            min={bookingData.startDate || new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            name="pickupLocation"
            value={bookingData.pickupLocation}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dropoff Location
          </label>
          <input
            type="text"
            name="dropoffLocation"
            value={bookingData.dropoffLocation}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Total Days:</span> {calculateTotalDays()}
          </p>
          <p>
            <span className="font-medium">Price per Day:</span> ${car.price}
          </p>
          <p className="text-xl font-bold text-blue-600">
            <span className="font-medium">Total Price:</span> ${calculateTotalPrice()}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Details
        </label>
        <div className="p-4 border rounded-md dark:bg-gray-700 dark:border-gray-600">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Confirm Booking'}
      </button>
    </form>
  );
};

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`/api/cars/${id}`);
        setCar(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch car details. Please try again later.');
        console.error('Error fetching car:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleBookingSuccess = () => {
    navigate('/booking-success');
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Book {car.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Car Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Type:</span> {car.type}
                </p>
                <p>
                  <span className="font-medium">Transmission:</span> {car.transmission}
                </p>
                <p>
                  <span className="font-medium">Price per Day:</span> ${car.price}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {car.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <Elements stripe={stripePromise}>
              <BookingForm car={car} onSuccess={handleBookingSuccess} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking; 