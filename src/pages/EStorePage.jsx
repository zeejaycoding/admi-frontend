import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, BookOpen, GraduationCap, Loader2, Filter, X,
  Search, Lock, ChevronLeft, ChevronRight, ShoppingCart, Play,
} from 'lucide-react';
import { fetchAllBooks } from '../store/slices/bookSlice';
import { fetchAllCourses } from '../store/slices/courseSlice';
import { useCart } from '../context/CartContext';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import courseService from '../services/api/courseService';
import { notify } from '../services/utils/authUtils';

const PAGE_SIZE = 12;

/* ─── Pagination ──────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();
  const base = 'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all';
  const active = 'bg-primary-600 text-white shadow-sm';
  const inactive = 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600';

  return (
    <div className="flex items-center justify-center gap-1 mt-8 mb-2 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`${base} ${inactive} px-2.5 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>

      {visiblePages[0] > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className={`${base} ${inactive}`}>1</button>
          {visiblePages[0] > 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
        </>
      )}

      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${base} ${page === currentPage ? active : inactive}`}
        >
          {page + 1}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
            <span className="px-1 text-gray-400 text-sm">…</span>
          )}
          <button onClick={() => onPageChange(totalPages - 1)} className={`${base} ${inactive}`}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`${base} ${inactive} px-2.5 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const EStorePage = () => {
  const { t } = useTranslation('ui');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { books, isLoading: booksLoading, bookPagination } = useSelector((state) => state.book);
  const { courses, isLoading: coursesLoading, coursePagination } = useSelector((state) => state.course);
  const { cart, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const productsRef = useRef(null);

  // TODO: enable NGN when Naira payments are ready — USD only for now
  const selectedCurrency = 'USD';

  const [activeTab, setActiveTab] = useState('books');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bookPage, setBookPage] = useState(0);
  const [coursePage, setCoursePage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [enrollingFree, setEnrollingFree] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setBookPage(0);
      setCoursePage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const bookParams = { page: bookPage, size: PAGE_SIZE };
    if (debouncedSearch) bookParams.searchTerm = debouncedSearch;

    const courseParams = { page: coursePage, size: PAGE_SIZE };
    if (debouncedSearch) courseParams.searchTerm = debouncedSearch;

    if (activeTab !== 'courses') dispatch(fetchAllBooks(bookParams));
    if (activeTab !== 'books') dispatch(fetchAllCourses(courseParams));
  }, [activeTab, bookPage, coursePage, debouncedSearch, dispatch]);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setFiltersOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setBookPage(0);
    setCoursePage(0);
  };

  const handlePageChange = (newPage, setter) => {
    setter(newPage);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const getProductPrice = (product, curr = selectedCurrency) => {
    const base = product.baseCurrency || 'USD';
    if (curr === base) return product.basePrice;
    if (base === 'NGN' && curr === 'USD') return product.basePrice / 1650;
    return product.basePrice;
  };

  const isInCart = (productId, productType) =>
    cart?.items?.some(item => item.productId === productId && item.productType === productType) || false;

  const handleAddToCart = async (product, type) => {
    if (!isAuthenticated) { setShowSignInModal(true); return; }
    setAddingToCart(product.id);
    try {
      await addToCart(product.id, type, getProductPrice(product), selectedCurrency);
    } finally {
      setAddingToCart(null);
    }
  };

  // A product is free when its price is 0
  const isFree = (product) => Number(getProductPrice(product)) === 0;

  const formatPrice = (product) => {
    if (isFree(product)) return t('estore.free', 'Free');
    const amount = getProductPrice(product);
    return `$${Number.parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleEnrollFree = async (course) => {
    if (!isAuthenticated) { setShowSignInModal(true); return; }
    setEnrollingFree(course.id);
    try {
      await courseService.enrollFree(course.id);
      notify.success('Enrolled! Find it in My Courses.');
      navigate(`/course-player/${course.id}`);
    } catch (err) {
      notify.error(err?.response?.data?.message || err?.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrollingFree(null);
    }
  };

  const filteredBooks = (books || [])
    .filter(b => b.isActive === true)
    .filter(b => getProductPrice(b) >= priceRange[0] && getProductPrice(b) <= priceRange[1]);

  const filteredCourses = (courses || [])
    .filter(c => c.isActive === true)
    .filter(c => getProductPrice(c) >= priceRange[0] && getProductPrice(c) <= priceRange[1]);

  const totalCount = activeTab === 'books'
    ? bookPagination.totalElements
    : coursePagination.totalElements;

  /* ── Product action button ── */
  const renderProductAction = (product) => {
    if (product.type === 'COURSE' && product.isEnrolled) {
      return (
        <button
          onClick={() => navigate(`/course-player/${product.id}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <Play size={14} className="fill-white" />
          {t('estore.continueLearning')}
        </button>
      );
    }
    // Free courses: enroll directly, no cart/payment
    if (product.type === 'COURSE' && isFree(product)) {
      return (
        <button
          onClick={() => handleEnrollFree(product)}
          disabled={enrollingFree !== null}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg font-semibold transition-all ${
            enrollingFree === product.id
              ? 'bg-gray-200 text-gray-500 cursor-wait'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
          }`}
        >
          {enrollingFree === product.id ? (
            <><Loader2 size={14} className="animate-spin" />{t('estore.enrolling', 'Enrolling...')}</>
          ) : (
            <><Play size={14} className="fill-white" />{t('estore.enrollForFree', 'Enroll for free')}</>
          )}
        </button>
      );
    }
    if (isInCart(product.id, product.type)) {
      return (
        <button
          onClick={() => navigate('/cart')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <ShoppingCart size={14} />
          {t('estore.viewCart')}
        </button>
      );
    }
    return (
      <button
        onClick={() => handleAddToCart(product, product.type)}
        disabled={addingToCart !== null}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg font-semibold transition-all ${
          addingToCart === product.id
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : 'bg-yellow-400 text-brand-black hover:bg-yellow-500 shadow-sm hover:shadow-md'
        }`}
      >
        {addingToCart === product.id ? (
          <><Loader2 size={14} className="animate-spin" />{t('estore.addingToCart')}</>
        ) : (
          <><ShoppingCart size={14} />{t('estore.addToCart')}</>
        )}
      </button>
    );
  };

  /* ── Product card ── */
  const renderProductCard = (product) => {
    const isBook = product.type === 'BOOK';
    const isCourse = product.type === 'COURSE';
    const categoryLabel = isCourse && product.category
      ? product.category.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
      : null;

    return (
      <div
        key={`${product.type}-${product.id}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      >
        {/* Thumbnail */}
        <div className={`relative overflow-hidden flex-shrink-0 ${isBook ? 'aspect-[3/4]' : 'aspect-video'} bg-gray-100`}>
          {isBook ? (
            product.coverImageUrl ? (
              <img
                src={product.coverImageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <BookOpen className="h-16 w-16 text-primary-300" />
              </div>
            )
          ) : (
            product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                <GraduationCap className="h-14 w-14 text-white/40" />
              </div>
            )
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              isBook ? 'bg-primary-600 text-white' : 'bg-brand-black text-white'
            }`}>
              {isBook ? t('estore.eCopy') : t('estore.course')}
            </span>
          </div>
          {product.isFeatured && (
            <div className="absolute top-2.5 right-2.5 bg-yellow-400 text-brand-black px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
              {t('estore.featured')}
            </div>
          )}
          {categoryLabel && (
            <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-primary-700">
              {categoryLabel}
            </div>
          )}
          {isCourse && product.isEnrolled && (
            <div className="absolute bottom-2.5 right-2.5 bg-green-500 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
              {t('estore.enrolled')}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1 min-h-[2.5rem]">
            {product.title}
          </h3>
          {isBook && product.author && (
            <p className="text-[11px] sm:text-xs text-gray-500 mb-2">{t('estore.by')} {product.author}</p>
          )}
          {isCourse && product.lessonCount > 0 && (
            <p className="text-[11px] sm:text-xs text-gray-500 mb-2">{t('estore.lessons', { count: product.lessonCount })}</p>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
            <span className="block text-base sm:text-lg font-bold text-primary-600">
              {formatPrice(product)}
            </span>
            {renderProductAction(product)}
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = ({ aspect }) => (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className={`${aspect} bg-gray-200`} />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded mt-4" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{t('estore.noProductsFound')}</h3>
      <p className="text-sm text-gray-500">{t('estore.noProductsDesc')}</p>
    </div>
  );

  const isInitialLoading = (booksLoading || coursesLoading) && books.length === 0 && courses.length === 0;
  if (isInitialLoading) return <LoadingSpinner fullScreen text={t('estore.loadingStore')} />;

  const tabs = [
    { id: 'books', label: t('estore.tabBooks'), icon: BookOpen },
    { id: 'courses', label: t('estore.tabCourses'), icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sign-in Modal ─────────────────────────────────── */}
      {showSignInModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignInModal(false); }}
        >
          <div className="max-w-sm w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="w-14 h-14 bg-primary-50 border-2 border-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('estore.signInToShop')}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t('estore.signInDesc')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login', { state: { from: '/estore' } })}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                {t('estore.signIn')}
              </button>
              <button
                onClick={() => setShowSignInModal(false)}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors py-2"
              >
                {t('estore.continueBrowsing')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Filter Drawer ───────────────────────────── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('estore.filters')}</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('estore.maxPrice')}
                </label>
                <input
                  type="range"
                  min="0"
                  max={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value)])}
                  className="w-full accent-primary-600 cursor-pointer"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">$0</span>
                  <span className="text-sm font-bold text-primary-600">
                    ${Number.parseFloat(priceRange[1]).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPriceRange([0, 100])}
                className="w-full text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors py-1"
              >
                {t('estore.resetFilters')}
              </button>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>{t('estore.totalProducts')}</span>
                <span className="font-bold text-gray-900">{totalCount}</span>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                {t('estore.showResults')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="bg-brand-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-yellow-400 font-semibold text-xs sm:text-sm mb-3 uppercase tracking-widest">
              {t('estore.resourcesLabel')}
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-4">
              {t('estore.booksAnd')} <span className="text-yellow-400">{t('estore.courses')}</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-lg max-w-xl leading-relaxed">
              {t('estore.heroDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2 sm:space-y-0">
          {/* Row 1: Tabs + Filter button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors flex-shrink-0"
            >
              <Filter size={15} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Row 2: Search (full width on mobile, inline on desktop) */}
          <div className="sm:hidden relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="search"
              placeholder={t('estore.searchMobile')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop search row */}
        <div className="hidden sm:block border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="search"
                  placeholder={t('estore.searchDesktop')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {/* TODO: add NGN toggle here when Naira payments are ready */}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-28 space-y-6">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t('estore.filters')}</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('estore.maxPrice')}
                </label>
                <input
                  type="range"
                  min="0"
                  max={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value)])}
                  className="w-full accent-primary-600 cursor-pointer"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">$0</span>
                  <span className="text-sm font-bold text-primary-600">
                    ${Number.parseFloat(priceRange[1]).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPriceRange([0, 100])}
                className="w-full text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors py-1"
              >
                {t('estore.resetFilters')}
              </button>

              <div className="pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>{t('estore.total')}</span>
                <span className="font-bold text-gray-900">{totalCount}</span>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main ref={productsRef} className="flex-1 min-w-0">

            {/* BOOKS TAB */}
            {activeTab === 'books' && (
              <>
                {booksLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} aspect="aspect-[3/4]" />
                    ))}
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredBooks.map(book => renderProductCard({ ...book, type: 'BOOK' }))}
                  </div>
                )}
                <Pagination
                  currentPage={bookPage}
                  totalPages={bookPagination.totalPages}
                  onPageChange={(p) => handlePageChange(p, setBookPage)}
                />
              </>
            )}

            {/* COURSES TAB */}
            {activeTab === 'courses' && (
              <>
                {coursesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} aspect="aspect-video" />
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {filteredCourses.map(course => renderProductCard({ ...course, type: 'COURSE' }))}
                  </div>
                )}
                <Pagination
                  currentPage={coursePage}
                  totalPages={coursePagination.totalPages}
                  onPageChange={(p) => handlePageChange(p, setCoursePage)}
                />
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default EStorePage;
