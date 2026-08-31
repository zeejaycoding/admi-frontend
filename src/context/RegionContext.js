import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { detectRegionFromSubdomain } from '../utils/subdomainUtils';

const RegionContext = createContext(null);

const DEFAULT_REGIONS = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦', flag: '🌍', subdomain: 'admi' },
  { code: 'US', name: 'USA', currency: 'USD', symbol: '$', flag: '🇺🇸', subdomain: 'pciusa' },
  { code: 'UK', name: 'UK', currency: 'USD', symbol: '$', flag: '🇬🇧', subdomain: 'pciuk' },
  { code: 'ZA', name: 'South Africa', currency: 'USD', symbol: '$', flag: '🇿🇦', subdomain: 'pcisafrica' },
  { code: 'GH', name: 'Ghana', currency: 'NGN', symbol: '₦', flag: '🇬🇭', subdomain: 'pcighana' },
];

export const RegionProvider = ({ children }) => {
  const location = useLocation();
  const [regions] = useState(DEFAULT_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState(() => {
    // First try to detect from URL parameter (for development)
    const urlParams = new URLSearchParams(window.location.search);
    const urlRegion = urlParams.get('region');
    if (urlRegion) {
      const fromUrl = DEFAULT_REGIONS.find(r => r.code === urlRegion);
      if (fromUrl) return fromUrl;
    }
    
    // Then try to detect from subdomain
    const subdomainRegion = detectRegionFromSubdomain();
    const fromSubdomain = DEFAULT_REGIONS.find(r => r.code === subdomainRegion);
    
    if (fromSubdomain) {
      return fromSubdomain;
    }
    
    // Fallback to localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pc-region') : null;
    const found = DEFAULT_REGIONS.find(r => r.code === saved);
    return found || DEFAULT_REGIONS[0];
  });

  useEffect(() => {
    localStorage.setItem('pc-region', selectedRegion.code);
  }, [selectedRegion]);

  // Optimized URL parameter change detection
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const urlParams = new URLSearchParams(location.search);
    const urlRegion = urlParams.get('region');

    // Only update region if there's an explicit region parameter in the URL
    if (urlRegion) {
      const targetRegion = DEFAULT_REGIONS.find(r => r.code === urlRegion);
      if (targetRegion) {
        setSelectedRegion(targetRegion);
      }
    } else if (location.search !== '') {
      // If there are other params but no region param, switch to Global
      const globalRegion = DEFAULT_REGIONS.find(r => r.code === 'NG');
      if (globalRegion) {
        setSelectedRegion(globalRegion);
      }
    }
  }, [location.search]);

  // Optimized function to switch regions
  const switchRegion = useCallback((newRegion) => {
    // Early return if switching to the same region
    if (newRegion.code === selectedRegion.code) {
      return;
    }

    // Update state immediately for instant UI feedback
    setSelectedRegion(newRegion);

    if (process.env.NODE_ENV === 'production') {
      const targetSubdomain = newRegion.subdomain;
      const currentHostname = window.location.hostname;
      const baseDomain = currentHostname.split('.').slice(-2).join('.');
      window.location.href = `${window.location.protocol}//${targetSubdomain}.${baseDomain}/`;
    } else {
      // For development, update URL without forcing re-navigation
      // This preserves auth state while updating the URL for bookmarking
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      let newUrl;

      if (newRegion.code === 'NG') {
        // For Global (NG), remove region parameter but keep other params
        const urlParams = new URLSearchParams(currentSearch);
        urlParams.delete('region');
        const queryString = urlParams.toString();
        newUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`;
      } else {
        // For other regions, set or update region parameter
        const urlParams = new URLSearchParams(currentSearch);
        urlParams.set('region', newRegion.code);
        newUrl = `${currentPath}?${urlParams.toString()}`;
      }

      // Use pushState instead of replaceState and avoid full URL to prevent reloads
      window.history.pushState(null, '', newUrl);
    }
  }, [selectedRegion.code]);

  const value = useMemo(() => ({
    regions,
    selectedRegion,
    setSelectedRegion,
    switchRegion,
    isSubdomainBased: process.env.NODE_ENV === 'production'
  }), [regions, selectedRegion, switchRegion]);

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
};
