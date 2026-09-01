import React, { useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';
import useAuth from './hooks/useAuth';
import { RegionProvider } from './context/RegionContext';
import { CartProvider } from './context/CartContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import MiniPlayer from './components/audio/MiniPlayer';

const App = () => {
  const { initialize, validateToken } = useAuth();

  useEffect(() => {
    // Initialize auth state from cache (fast, synchronous)
    const initPromise = initialize();

    // After initialization, validate token in background (async)
    // This ensures tokens are valid without blocking UI render
    initPromise.then(() => {
      validateToken();
    }).catch(() => {
      // Initialization failed, validation not needed
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array intentional - we only want this to run once on app mount

  return (
    <Router>
      <RegionProvider>
        <CartProvider>
          <AudioPlayerProvider>
          <ScrollToTop />
          <AppRoutes />
          <MiniPlayer />
          <Toaster
            position="bottom-right"
            gutter={8}
            containerStyle={{ top: 16, right: 16 }}
            toastOptions={{
              duration: 3500,
              style: {
                maxWidth: 420,
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
              },
              error: {
                duration: 4500,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
                iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
              },
            }}
          />
          </AudioPlayerProvider>
        </CartProvider>
      </RegionProvider>
    </Router>
  );
};

export default App;