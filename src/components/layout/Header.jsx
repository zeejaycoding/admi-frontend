import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import admiLogo from '../../assets/admi-small.png';
import powercityLogo from '../../assets/Powercity White 1.png';
import AuthModal from '../auth/AuthModal';
import { useRegion } from '../../context/RegionContext';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../../services/utils/constants';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Portal position for mobile region dropdown
  const [mobileRegionPos, setMobileRegionPos] = useState({ top: 0, right: 0 });

  const { t } = useTranslation('ui');
  const { regions, selectedRegion, switchRegion } = useRegion();
  const { isAuthenticated, user, logout, initializing } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [optimisticAuth, setOptimisticAuth] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const savedTokens = localStorage.getItem(ACCESS_TOKEN_KEY);
      return {
        isAuthenticated: !!(savedUser && savedTokens),
        user: savedUser ? JSON.parse(savedUser) : null
      };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  });

  useEffect(() => {
    if (!initializing) {
      setOptimisticAuth({ isAuthenticated, user });
    }
  }, [isAuthenticated, user, initializing]);

  const buildUrlWithRegion = useCallback((path) => {
    if (process.env.NODE_ENV === 'production') return path;
    if (selectedRegion?.code && selectedRegion.code !== 'NG') {
      return `${path}?region=${selectedRegion.code}`;
    }
    return path;
  }, [selectedRegion?.code]);

  const brandName = useMemo(() => {
    if (selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code)) {
      return 'PowerCity International';
    }
    return 'Abel Damina Ministries International (ADMI)';
  }, [selectedRegion]);

  const currentLogo = useMemo(() => {
    if (selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code)) {
      return powercityLogo;
    }
    return admiLogo;
  }, [selectedRegion]);

  const getDisplayRegionName = useCallback((region) => {
    if (region?.code === 'NG') return 'Global';
    return region?.name || 'Select Region';
  }, []);

  // Desktop refs
  const regionBtnRef = useRef(null);
  const regionMenuRef = useRef(null);
  // Mobile refs
  const mobileRegionBtnRef = useRef(null);
  const mobileRegionMenuRef = useRef(null);

  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile region dropdown when mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) setIsRegionOpen(false);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isRegionOpen) return;
      const inDesktopMenu = regionMenuRef.current?.contains(e.target);
      const inDesktopBtn  = regionBtnRef.current?.contains(e.target);
      const inMobileMenu  = mobileRegionMenuRef.current?.contains(e.target);
      const inMobileBtn   = mobileRegionBtnRef.current?.contains(e.target);
      if (!inDesktopMenu && !inDesktopBtn && !inMobileMenu && !inMobileBtn) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRegionOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const openMobileRegionDropdown = () => {
    if (mobileRegionBtnRef.current) {
      const rect = mobileRegionBtnRef.current.getBoundingClientRect();
      setMobileRegionPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsRegionOpen(true);
  };

  const navLinks = useMemo(() => [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.campuses'), href: '/campuses' },
    { name: t('nav.estore'), href: '/estore' },
    { name: t('nav.partnership'), href: '/partnership' },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t]);

  const displayAuth = initializing ? optimisticAuth : { isAuthenticated, user };
  const displayUser = displayAuth.user;

  const isAdmin = Array.isArray(displayUser?.roles) && (
    displayUser.roles.includes('SUPER_ADMIN') ||
    displayUser.roles.includes('ADMIN') ||
    displayUser.roles.includes('COORDINATOR')
  );
  const initials = displayUser
    ? (displayUser.fullName || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '';

  const regionOptionClass = (r) =>
    `w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
      selectedRegion.code === r.code ? 'font-semibold bg-gray-50' : ''
    }`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-primary-600/95'
    }`}>
      <div className="container mx-auto px-2 sm:px-3 md:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">

          {/* Logo */}
          <Link to={buildUrlWithRegion('/')} className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <img
              src={currentLogo}
              alt={brandName}
              className={`object-contain transition-all duration-300 h-10 sm:h-11 md:h-12 lg:h-14 ${
                selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code)
                  ? `w-auto ${isScrolled ? 'brightness-0' : ''}`
                  : 'w-10 sm:w-11 md:w-12 lg:w-14'
              }`}
            />
            {!(selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code)) && (
              <span className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              } hidden sm:block`}>
                {brandName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-3 xl:space-x-4 2xl:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={buildUrlWithRegion(link.href)}
                className={`font-medium transition-colors duration-200 text-sm lg:text-sm xl:text-base ${
                  isScrolled ? 'text-gray-800 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to={buildUrlWithRegion('/donate')}
              className="ml-1 lg:ml-2 bg-yellow-400 text-black px-2 lg:px-2 xl:px-4 py-1.5 lg:py-1.5 xl:py-2 rounded-full font-semibold hover:brightness-95 transition-colors duration-200 text-xs lg:text-xs xl:text-base"
            >
              {t('nav.give')}
            </Link>

            {/* Desktop region selector */}
            <div className="relative ml-1 lg:ml-1 xl:ml-2">
              <button
                ref={regionBtnRef}
                onClick={() => setIsRegionOpen((o) => !o)}
                className={`flex items-center space-x-1 lg:space-x-1 xl:space-x-2 px-2 lg:px-2 xl:px-3 py-1.5 lg:py-1.5 xl:py-2 rounded-full border text-xs lg:text-xs xl:text-sm ${
                  isScrolled ? 'border-gray-300 text-gray-800 hover:bg-gray-50' : 'border-white/30 text-white hover:bg-white/10'
                } transition`}
                aria-haspopup="listbox"
                aria-expanded={isRegionOpen}
              >
                <span className="text-base lg:text-base xl:text-lg leading-none">{selectedRegion.flag}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 lg:w-3 lg:h-3 xl:w-4 xl:h-4">
                  <path d="M6 9l6 6 6-6H6z" />
                </svg>
              </button>

              {isRegionOpen && !isMobileMenuOpen && (
                <div ref={regionMenuRef} className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg ring-1 ring-black/5 bg-white">
                  <ul className="py-1" role="listbox">
                    {regions.map((r) => (
                      <li key={r.code}>
                        <button
                          onClick={() => { switchRegion(r); setIsRegionOpen(false); }}
                          className={regionOptionClass(r)}
                          role="option"
                          aria-selected={selectedRegion.code === r.code}
                        >
                          <span className="text-lg">{r.flag}</span>
                          <span className="text-gray-800">{getDisplayRegionName(r)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Language switcher */}
            <LanguageSwitcher variant="header" isScrolled={isScrolled} />

            {/* Shopping Cart */}
            {displayAuth.isAuthenticated && (
              <button
                onClick={() => navigate('/cart')}
                className={`ml-2 p-2 rounded-full transition relative ${
                  isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Shopping cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {!displayAuth.isAuthenticated ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`ml-2 p-2 rounded-full transition ${
                  isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Open sign in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                </svg>
              </button>
            ) : (
              <div className="relative ml-2">
                <button
                  ref={userBtnRef}
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    isScrolled ? 'bg-gray-100 text-gray-800' : 'bg-white/95 text-gray-800'
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {initials || (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                    </svg>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg ring-1 ring-black/5 bg-white">
                    <ul className="py-1 text-sm text-gray-800">
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => { navigate('/dashboard/orders'); setIsUserMenuOpen(false); }}
                        >
                          {t('nav.dashboard')}
                        </button>
                      </li>
                      {isAdmin && (
                        <li>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
                          >
                            {t('nav.adminPanel')}
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => { setIsUserMenuOpen(false); logout(); navigate('/'); }}
                        >
                          {t('nav.logout')}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button (hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 transition-all duration-300 ${
                isScrolled ? 'bg-gray-900' : 'bg-white'
              } ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${
                isScrolled ? 'bg-gray-900' : 'bg-white'
              } ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${
                isScrolled ? 'bg-gray-900' : 'bg-white'
              } ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`xl:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className={`space-y-3 px-2 ${isMobileMenuOpen ? 'py-4' : 'py-0'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={buildUrlWithRegion(link.href)}
                className={`block font-medium transition-colors duration-200 py-2 px-2 rounded-lg ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' : 'text-white hover:text-yellow-400 hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Give + Region row */}
            <div className={`flex items-center justify-between ${isMobileMenuOpen ? 'pt-2 mt-2 border-t border-white/20' : ''}`}>
              <Link
                to={buildUrlWithRegion('/donate')}
                className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:brightness-95 transition-colors duration-200 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.give')}
              </Link>

              <div className="flex items-center gap-2">
                {/* Language switcher */}
                <LanguageSwitcher variant="header" isScrolled={isScrolled} />

              {/* Mobile region toggle — portal dropdown */}
              <button
                ref={mobileRegionBtnRef}
                onClick={() => isRegionOpen ? setIsRegionOpen(false) : openMobileRegionDropdown()}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-full border text-sm ${
                  isScrolled ? 'border-gray-300 text-gray-800 hover:bg-gray-50' : 'border-white/30 text-white hover:bg-white/10'
                } transition`}
                aria-haspopup="listbox"
                aria-expanded={isRegionOpen}
              >
                <span className="text-lg leading-none">{selectedRegion.flag}</span>
                <span className="text-xs">{getDisplayRegionName(selectedRegion)}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isRegionOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6H6z" />
                </svg>
              </button>
              </div>
            </div>

            {/* Mobile Auth Section */}
            {!displayAuth.isAuthenticated ? (
              <button
                onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}
                className={`w-full btn-primary ${isMobileMenuOpen ? 'mt-3' : 'mt-0'}`}
              >
                {t('nav.signIn')}
              </button>
            ) : (
              <div className={`space-y-3 ${isMobileMenuOpen ? 'pt-2 border-t border-gray-200' : ''}`}>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    isScrolled ? 'bg-gray-100 text-gray-800' : 'bg-white/95 text-gray-800'
                  }`}>
                    {initials || (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                      </svg>
                    )}
                  </div>
                  <div className={`${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                    <div className="font-medium text-sm">{displayUser?.fullName}</div>
                    <div className="text-xs opacity-75">{displayUser?.email}</div>
                  </div>
                </div>

                <button
                  className={`w-full text-left px-3 py-2 font-medium transition-colors duration-200 ${
                    isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                  }`}
                  onClick={() => { navigate('/dashboard/orders'); setIsMobileMenuOpen(false); }}
                >
                  {t('nav.dashboard')}
                </button>

                <button
                  className={`w-full text-left px-3 py-2 font-medium transition-colors duration-200 flex items-center justify-between ${
                    isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                  }`}
                  onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}
                >
                  <span>{t('nav.shoppingCart')}</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                {isAdmin && (
                  <button
                    className={`w-full text-left px-3 py-2 font-medium transition-colors duration-200 ${
                      isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                    }`}
                    onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                  >
                    {t('nav.adminPanel')}
                  </button>
                )}

                <button
                  className={`w-full text-left px-3 py-2 font-medium transition-colors duration-200 ${
                    isScrolled ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'
                  }`}
                  onClick={() => { setIsMobileMenuOpen(false); logout(); navigate('/'); }}
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile region dropdown — rendered in document.body via portal to escape stacking context */}
      {isRegionOpen && isMobileMenuOpen && createPortal(
        <div
          ref={mobileRegionMenuRef}
          style={{
            position: 'fixed',
            top: mobileRegionPos.top,
            right: mobileRegionPos.right,
            zIndex: 9999,
            minWidth: '180px',
          }}
          className="rounded-xl shadow-2xl ring-1 ring-black/10 bg-white overflow-hidden"
          role="listbox"
        >
          {regions.map((r) => (
            <button
              key={r.code}
              onClick={() => { switchRegion(r); setIsRegionOpen(false); setIsMobileMenuOpen(false); }}
              className={regionOptionClass(r)}
              role="option"
              aria-selected={selectedRegion.code === r.code}
            >
              <span className="text-xl">{r.flag}</span>
              <span className="text-gray-800 text-sm">{getDisplayRegionName(r)}</span>
              {selectedRegion.code === r.code && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-auto text-primary-500">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;
