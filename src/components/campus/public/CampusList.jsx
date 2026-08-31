import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { searchCampuses } from '../../../store/slices/campusSlice';
import { useRegion } from '../../../context/RegionContext';
import JoinACampusForm from '../../ministry-forms/JoinACampusForm';


const REGION_MAP = {
  US: 'USA',
  UK: 'UK',
  GH: 'Ghana',
  ZA: 'South Africa',
  NG: '',          // Global — no filter
};


const SkeletonCard = memo(() => (
  <div className="animate-pulse rounded-2xl overflow-hidden shadow-lg">
    <div className="h-64 bg-gray-300" />
    <div className="p-6 bg-white">
      <div className="h-6 bg-gray-300 rounded mb-4" />
      <div className="h-4 bg-gray-300 rounded mb-3 w-full" />
      <div className="h-4 bg-gray-300 rounded mb-3 w-3/4" />
      <div className="h-4 bg-gray-300 rounded mb-3 w-1/2" />
      <div className="pt-2 border-t border-gray-200">
        <div className="h-6 bg-gray-300 rounded-full w-16" />
      </div>
    </div>
  </div>
));


const CampusCard = memo(({ campus, onJoin, joinLabel, campusLabel }) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(campus.fullAddress || campus.address || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const nullSafe = (v) => (!v || v === 'null' ? '' : v);
  const displayAddress = nullSafe(campus.fullAddress) || nullSafe(campus.address);
  const short = displayAddress.length > 50
    ? displayAddress.slice(0, 50) + '…'
    : displayAddress;

  return (
    <div className="group relative overflow-visible rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">

      {/* Image / fallback */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        {campus.imageUrl ? (
          <img
            src={campus.imageUrl}
            alt={campus.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white relative bg-primary-700">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90" />
            <div className="relative text-center z-10 px-4">
              <div className="text-xl font-bold mb-1 line-clamp-2">{campus.name}</div>
              <div className="text-xs opacity-75">{campusLabel}</div>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {campus.isFeatured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2.5 py-0.5 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 bg-white flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {campus.name}
          </h3>

          {nullSafe(campus.country) && (
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
              {nullSafe(campus.country)}
            </p>
          )}

          {displayAddress && (
            <div
              className="relative flex items-start gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600 transition-colors group/addr"
              onClick={copyAddress}
              title="Click to copy address"
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{short}</span>
              {/* tooltip */}
              <div className="invisible group-hover/addr:visible opacity-0 group-hover/addr:opacity-100 transition-opacity absolute bottom-full left-0 mb-2 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                <p className="break-words">{displayAddress}</p>
                {copied
                  ? <p className="text-green-300 mt-1">Copied!</p>
                  : <p className="text-gray-400 mt-1">Click to copy</p>
                }
                <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 mt-4">
          {nullSafe(campus.region) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {campus.region}
            </span>
          )}
          <button
            onClick={() => onJoin(campus)}
            className="ml-auto flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {joinLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Pagination (stable, outside component) ───────────────────────────────────
const Pagination = memo(({ page, totalPages, onChange }) => {
  const pages = useMemo(() => {
    const list = [];
    const delta = 2;
    list.push(1);
    const start = Math.max(2, page - delta);
    const end   = Math.min(totalPages - 1, page + delta);
    if (start > 2) list.push('…');
    for (let p = start; p <= end; p++) list.push(p);
    if (end < totalPages - 1) list.push('…');
    if (totalPages > 1) list.push(totalPages);
    return list;
  }, [page, totalPages]);

  const btn = 'w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="flex flex-col items-center gap-2 mt-12">
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(1)} disabled={page === 1} title="First" className={btn}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => onChange(page - 1)} disabled={page === 1} title="Previous" className={btn}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === p ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} title="Next" className={btn}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button onClick={() => onChange(totalPages)} disabled={page === totalPages} title="Last" className={btn}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const CampusList = () => {
  const { t } = useTranslation('ui');
  const dispatch = useDispatch();
  const { selectedRegion: currentRegion } = useRegion();
  const { campuses = [], isLoading, totalPages, error } = useSelector((s) => s.campus);

  const [searchTerm, setSearchTerm]       = useState('');
  const [page, setPage]                   = useState(1);
  const [selectedCampus, setSelectedCampus] = useState(null);

  // Derive region filter directly — no need for getSupportedRegions
  const regionFilter = useMemo(
    () => REGION_MAP[currentRegion?.code] ?? '',
    [currentRegion?.code]
  );

  // Reset to page 1 when region or search changes
  useEffect(() => { setPage(1); }, [regionFilter, searchTerm]);

  // Debounced API call
  useEffect(() => {
    const params = {
      page: page - 1,
      size: PAGE_SIZE,
      sortBy: 'name',
      sortDirection: 'asc',
      ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
      ...(regionFilter         && { region: regionFilter }),
    };

    const id = setTimeout(() => dispatch(searchCampuses(params)), searchTerm ? 400 : 0);
    return () => clearTimeout(id);
  }, [dispatch, page, searchTerm, regionFilter]);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleJoin = useCallback((campus) => setSelectedCampus(campus), []);

  const heroTitle = currentRegion?.code && currentRegion.code !== 'NG'
    ? t('campuses.regionTitle', { regionName: REGION_MAP[currentRegion.code] || currentRegion.code })
    : t('campuses.globalTitle');

  const heroSubtitle = currentRegion?.code && currentRegion.code !== 'NG'
    ? t('campuses.regionSubtitle', { regionName: REGION_MAP[currentRegion.code] || currentRegion.code })
    : t('campuses.globalSubtitle');

  const campusLabel = t('campuses.powerCityCampus');
  const joinLabel   = t('campuses.join');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">{heroSubtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Search */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('campuses.findYourCampus')}</h3>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('campuses.clearFilters')}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('campuses.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error.message || t('campuses.errorDefault')}</p>
          </div>
        )}

        {/* Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
              : campuses.map((campus) => (
                  <CampusCard
                    key={campus.id}
                    campus={campus}
                    onJoin={handleJoin}
                    joinLabel={joinLabel}
                    campusLabel={campusLabel}
                  />
                ))
            }
          </div>

          {/* No results */}
          {!isLoading && campuses.length === 0 && !error && (
            <div className="text-center py-20">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('campuses.noCampusesFound')}</h3>
              <p className="text-gray-500 mb-6">{t('campuses.noCampusesDesc')}</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
                >
                  {t('campuses.clearSearch')}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        )}
      </div>

      {/* Join modal */}
      {selectedCampus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCampus(null); }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t('campuses.joinACampus')}</h2>
              <button
                onClick={() => setSelectedCampus(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
              <JoinACampusForm
                campus={selectedCampus}
                onClose={() => setSelectedCampus(null)}
                onSuccess={() => setSelectedCampus(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusList;
