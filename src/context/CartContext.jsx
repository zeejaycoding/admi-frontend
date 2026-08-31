import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/utils/apiClient';
import { useRegion } from './RegionContext';
import { notify } from '../services/utils/authUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { selectedRegion } = useRegion();

  // Initialize currency based on region: Global (NG) = NGN, all others = USD
  const getInitialCurrency = () => {
    if (selectedRegion?.code === 'NG') return 'NGN'; // Global: default to NGN
    return 'USD'; // All other regions: USD only
  };

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(getInitialCurrency());

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Sync currency when region changes (only if cart is empty)
  useEffect(() => {
    const isEmpty = !cart || !cart.items || cart.items.length === 0;
    if (isEmpty) {
      const newCurrency = getInitialCurrency();
      if (newCurrency !== currency) {
        setCurrency(newCurrency);
      }
    }
  }, [selectedRegion?.code]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/cart');
      setCart(response.data.data);
      if (response.data.data?.currency) {
        setCurrency(response.data.data.currency);
      }
    } catch (error) {
      // If cart doesn't exist or user not authenticated, set empty cart
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId, productType, price, productCurrency) => {
    // Check if cart has items with a different currency BEFORE setting loading
    if (cart && cart.items && cart.items.length > 0) {
      // Use cart.currency from the actual cart data, NOT the currency state variable
      const cartCurrency = cart.currency || (cart.items[0]?.currency);
      const newItemCurrency = productCurrency;

      // Both must exist and must be different to block
      if (cartCurrency && newItemCurrency && cartCurrency !== newItemCurrency) {
        const currencySymbols = { NGN: '₦', USD: '$' };
        notify.error(
          `Cannot mix currencies! Your cart has ${currencySymbols[cartCurrency] || ''}${cartCurrency} items. Please checkout or clear your cart first to add ${currencySymbols[newItemCurrency] || ''}${newItemCurrency} items.`,
          { duration: 6000 }
        );
        return Promise.reject(new Error('Currency mismatch'));
      }
    }

    try {
      setLoading(true);

      // Courses are access-based, always quantity 1. Books can have multiple quantities.
      const quantity = productType === 'COURSE' ? 1 : 1;

      const response = await apiClient.post('/cart/add', {
        productId,
        productType,
        price,
        currency: productCurrency || currency,
        quantity
      });
      setCart(response.data.data);

      // Update the cart currency if this is the first item
      if (productCurrency && (!cart || !cart.items || cart.items.length === 0)) {
        setCurrency(productCurrency);
      }

      notify.success(productType === 'COURSE' ? 'Course added to cart!' : 'Item added to cart!');
      return response.data.data;
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currency, cart]);

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/cart/items/${cartItemId}`);
      setCart(response.data.data);
      notify.success('Item removed from cart');
      return response.data.data;
    } catch (error) {
      notify.error('Failed to remove item from cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback((cartItemId, quantity) => {
    // Update quantity locally - no API call for better UX
    setCart(prevCart => {
      if (!prevCart) return prevCart;

      const updatedItems = prevCart.items.map(item => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            subtotal: item.price * quantity
          };
        }
        return item;
      });

      const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...prevCart,
        items: updatedItems,
        totalAmount: newTotalAmount
      };
    });
  }, []);

  const updateCurrency = useCallback(async (newCurrency, silent = false) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/cart/currency`, null, {
        params: { currency: newCurrency }
      });
      setCart(response.data.data);
      setCurrency(newCurrency);
      if (!silent) {
        notify.success(`Currency changed to ${newCurrency}`);
      }
      return response.data.data;
    } catch (error) {
      if (!silent) {
        notify.error('Failed to update currency');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.delete('/cart/clear');
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      notify.success('Cart cleared');
    } catch (error) {
      notify.error('Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncCartWithBackend = useCallback(async () => {
    // Sync local cart quantities with backend before checkout
    if (!cart || !cart.items || cart.items.length === 0) return;

    try {
      const updatePromises = cart.items.map(item =>
        apiClient.put(`/cart/items/${item.id}/quantity`, null, {
          params: { quantity: item.quantity }
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      throw error;
    }
  }, [cart]);

  const value = {
    cart,
    loading,
    currency,
    setCurrency,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCurrency,
    clearCart,
    syncCartWithBackend,
    cartCount: cart?.totalItems || 0,
    cartTotal: cart?.totalAmount || 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
