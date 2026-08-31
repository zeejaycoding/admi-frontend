/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/utils/apiClient';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId] = useState(searchParams.get('session_id'));
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Fetch order details if we have a session ID
    if (sessionId) {
      fetchOrderFromSession();
    }
  }, [sessionId]);

  const fetchOrderFromSession = async () => {
    try {
      // Try to get session details from backend which includes order info
      const response = await apiClient.get(`/payments/session/${sessionId}`);
      if (response.data?.data) {
        setOrderDetails(response.data.data);
      }
    } catch {
      // Order details are supplementary — success page still renders without them
    }
  };

  // Determine what was purchased
  const hasBooks = orderDetails?.orderItems?.some(item => item.productType === 'BOOK') || false;
  const hasCourses = orderDetails?.orderItems?.some(item => item.productType === 'COURSE') || false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and you should receive a confirmation email shortly.
        </p>

        {/* Order Details */}
        {orderDetails ? (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-lg font-bold text-green-700 mb-2">
              #{orderDetails.orderNumber}
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Amount: {orderDetails.currency === 'NGN' ? '₦' : '$'}{orderDetails.totalAmount?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
              <p>Status: <span className={orderDetails.status === 'COMPLETED' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>{orderDetails.status}</span></p>
            </div>
          </div>
        ) : sessionId ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Payment Confirmation ID</p>
            <p className="text-xs font-mono text-gray-600 break-all">
              {sessionId}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Check your email for your order number and details
            </p>
          </div>
        ) : null}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            {hasCourses && (
              <>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your course{hasBooks ? 's are' : ' is'} now available in <strong>My Dashboard</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Start learning immediately - no downloads required!</span>
                </li>
              </>
            )}
            {hasBooks && (
              <>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check your email for the order confirmation and download link</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Important:</strong> Download links expire after 1 hour. Save your e-book immediately.</span>
                </li>
              </>
            )}
            {!hasBooks && !hasCourses && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Check your email for order confirmation details</span>
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {hasCourses && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Go to My Dashboard
            </button>
          )}
          <button
            onClick={() => navigate('/estore')}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
