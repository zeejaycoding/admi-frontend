import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import useAuth from '../hooks/useAuth';
import paymentService from '../services/api/paymentService';
import apiClient from '../services/utils/apiClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { notify } from '../services/utils/authUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    loading,
    currency,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    syncCartWithBackend
  } = useCart();

  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      notify.error('Please sign in to view your cart');
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart, navigate]);

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      notify.error('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    updateQuantity(cartItemId, newQuantity);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearModal(false);
    } catch (error) {
      notify.error('Failed to clear cart. Please try again.');
      setShowClearModal(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart?.items || cart.items.length === 0) {
      notify.error('Your cart is empty');
      return;
    }

    try {
      setProcessingCheckout(true);

      // Sync local quantities with backend before checkout
      await syncCartWithBackend();

      // Checkout all cart items at once
      const response = await paymentService.checkoutCart(currency);

      const checkoutUrl = response.data?.checkoutSession?.checkoutUrl ||
                         response.checkoutSession?.checkoutUrl ||
                         response.data?.checkoutUrl ||
                         response.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        notify.error('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to process checkout');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleBuyNow = async (item) => {
    try {
      setProcessingItemId(item.id);

      // Sync this item's quantity with backend
      await apiClient.put(`/cart/items/${item.id}/quantity`, null, {
        params: { quantity: item.quantity }
      });

      // Checkout ONLY this specific item
      const response = await apiClient.post('/payments/checkout-cart-item', {
        cartItemId: item.id,
        currency: item.currency
      });

      // Extract checkout URL from nested response structure
      const checkoutUrl = response.data?.data?.checkoutSession?.checkoutUrl ||
                         response.data?.checkoutSession?.checkoutUrl ||
                         response.data?.data?.checkoutUrl ||
                         response.data?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        notify.error('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to process purchase');
    } finally {
      setProcessingItemId(null);
    }
  };

  const formatPrice = (price, curr = currency) => {
    const symbol = curr === 'NGN' ? '₦' : '$';
    return `${symbol}${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading && !cart) {
    return <LoadingSpinner fullScreen text="Loading cart..." />;
  }

  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  // Check if cart has any NGN items (Paystack not yet integrated)
  const hasNGNItems = cartItems.some(item => item.currency === 'NGN');
  const hasUSDItems = cartItems.some(item => item.currency === 'USD');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start shopping to add items to your cart.</p>
            <button
              onClick={() => navigate('/estore')}
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Browse E-Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.productTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {item.productType === 'BOOK' ? 'E-Book' : 'Course'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatPrice(item.subtotal, item.currency)}
                      </div>

                      {/* Quantity Controls - Only for books, courses are always quantity 1 */}
                      {item.productType === 'BOOK' ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                          >
                            −
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                          1 Enrollment
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Buy Now Button - Disabled for NGN */}
                      {item.currency === 'NGN' ? (
                        <div className="flex-1 px-4 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                          <p className="text-sm font-medium text-yellow-800">Coming Soon</p>
                          <p className="text-xs text-yellow-600">NGN payments unavailable</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyNow(item)}
                          disabled={processingItemId === item.id}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            processingItemId === item.id
                              ? 'bg-gray-400 text-white cursor-wait'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-md'
                          }`}
                        >
                          {processingItemId === item.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buying...
                            </span>
                          ) : (
                            'Buy Now'
                          )}
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={() => setShowClearModal(true)}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Checkout All Button - Show warning if NGN items exist */}
                {hasNGNItems && !hasUSDItems ? (
                  <div className="w-full py-4 rounded-lg bg-yellow-50 border-2 border-yellow-200 text-center">
                    <p className="text-sm font-semibold text-yellow-900">Payment Not Available</p>
                    <p className="text-xs text-yellow-700 mt-1">NGN checkout is currently unavailable. Please use USD currency.</p>
                  </div>
                ) : hasNGNItems && hasUSDItems ? (
                  <div className="space-y-3">
                    <div className="w-full py-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <p className="text-xs font-medium text-blue-800">
                        Note: NGN items in cart cannot be processed at this time. Only USD items will proceed.
                      </p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={processingCheckout}
                      className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                        processingCheckout
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:shadow-lg'
                      }`}
                    >
                      {processingCheckout ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Checkout USD Items Only`
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={processingCheckout || cartItems.length === 0}
                    className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                      processingCheckout || cartItems.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:shadow-lg'
                    }`}
                  >
                    {processingCheckout ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Checkout All Items (${cartItems.length})`
                    )}
                  </button>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center flex items-center justify-center gap-1">
                  {hasNGNItems ? (
                    <span className="text-gray-600">
                      USD payments only at this time
                    </span>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Secure payment processing</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Clear Cart</h3>
              <button
                onClick={() => setShowClearModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to clear your cart? This will remove all items.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
