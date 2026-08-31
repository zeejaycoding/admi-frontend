import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/utils/apiClient';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/my-orders', {
        params: {
          page: 0,
          size: 50,
        },
      });

      // Handle paginated response
      const ordersData = response.data.data?.content || response.data.data || [];
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    return `${symbol}${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">View and track your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start shopping in our store
          </p>
          <div className="mt-6">
            <a
              href="/estore"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse E-Store
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderItems?.length || 0} item(s)
                  </p>
                </div>
              </div>

              {order.orderItems && order.orderItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Items Purchased</h4>
                  <ul className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">
                            {item.bookTitle || item.courseTitle || 'Product'}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({item.productType === 'BOOK' ? 'E-Book' : 'Course'})
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.status === 'COMPLETED' && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {order.orderItems?.some(item => item.productType === 'BOOK') && (
                    <>
                      <p className="text-sm text-blue-900 font-medium mb-1">E-Book Download</p>
                      <p className="text-xs text-blue-800 mb-2">
                        Download link sent to your email. Links expire after 1 hour.
                      </p>
                    </>
                  )}
                  {order.orderItems?.some(item => item.productType === 'COURSE') && (
                    <>
                      <p className="text-sm text-blue-900 font-medium mb-1">Course Access</p>
                      <p className="text-xs text-blue-800 mb-2">
                        Your course is now available in My Dashboard. Start learning immediately!
                      </p>
                    </>
                  )}
                  <p className="text-xs text-blue-700 mt-2">
                    Need help? Contact support at{' '}
                    <a href="mailto:it@drabeldamina.org" className="underline font-medium">
                      it@drabeldamina.org
                    </a>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
