import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Country, State } from 'country-state-city';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Shared input class ────────────────────────────────────────────────────────
const inp =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-200 hover:border-gray-400 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400';


const PRIORITY = ['NG', 'GB', 'US', 'ZA', 'GH'];

// ─── Generic searchable Combobox ───────────────────────────────────────────────
// Uses position:fixed for the dropdown so it escapes overflow:hidden ancestors
// (e.g. accordion wrappers, card containers, etc.)

const Combobox = ({
  value,
  onChange,
  items,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  noResultsText = (q) => `No results for "${q}"`,
  disabled = false,
}) => {
  const [query,         setQuery]         = useState('');
  const [open,          setOpen]          = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const triggerRef  = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  const selected = useMemo(
    () => items.find((i) => i.value === value) || null,
    [items, value],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  // Calculate fixed position from the trigger element's bounding rect
  const calcPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // Flip upward if not enough space below (threshold: 280px)
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp     = spaceBelow < 280 && rect.top > 280;
    setDropdownStyle({
      position: 'fixed',
      left:     rect.left,
      width:    rect.width,
      zIndex:   9999,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
    });
  };

  const handleOpen = () => {
    if (disabled) return;
    calcPosition();
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 40);
  };

  const handleSelect = (item) => {
    onChange(item.value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  // Close on outside click (need to check both trigger and floating dropdown)
  useEffect(() => {
    const fn = (e) => {
      const inTrigger  = triggerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Reposition if user scrolls or resizes while open
  useEffect(() => {
    if (!open) return;
    const fn = () => calcPosition();
    window.addEventListener('scroll', fn, true);
    window.addEventListener('resize', fn);
    return () => {
      window.removeEventListener('scroll', fn, true);
      window.removeEventListener('resize', fn);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`${inp} flex items-center gap-2.5 text-left ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {selected ? (
          <>
            {selected.flag && (
              <span className="text-xl leading-none flex-shrink-0">{selected.flag}</span>
            )}
            <span className="flex-1 truncate text-gray-900 font-medium">{selected.label}</span>
            <span
              role="button"
              onMouseDown={handleClear}
              className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
            >
              <X size={13} strokeWidth={2.5} />
            </span>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400">{placeholder}</span>
            <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />
          </>
        )}
      </button>

      {/* ── Floating dropdown — rendered with fixed positioning ──────────── */}
      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/80">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.map((item) => (
              <React.Fragment key={item.value}>
                <li
                  onMouseDown={() => handleSelect(item)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm select-none transition-colors
                    ${
                      item.value === value
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {item.flag && (
                    <span className="text-xl leading-none w-7 flex-shrink-0">{item.flag}</span>
                  )}
                  <span className="flex-1 leading-snug">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold tracking-wide bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.value === value && (
                    <Check size={14} className="text-primary-600 flex-shrink-0" />
                  )}
                </li>
                {item.separator && !query && (
                  <li className="border-t border-gray-100 my-1 mx-3" role="separator" />
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-8 text-sm text-gray-400 text-center">
                {noResultsText(query)}
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

// ─── FormLocationSelect ────────────────────────────────────────────────────────

const FormLocationSelect = ({ value = {}, onChange }) => {
  const { t } = useTranslation('ministryForms');
  const {
    countryCode  = '',
    stateCode    = '',
    city         = '',
    postalCode   = '',
    addressLine1 = '',
    addressLine2 = '',
  } = value;

  // Country items — priority pinned, rest alphabetical
  const countryItems = useMemo(() => {
    const all      = Country.getAllCountries();
    const priority = PRIORITY.map((c) => all.find((x) => x.isoCode === c)).filter(Boolean);
    const rest     = all
      .filter((c) => !PRIORITY.includes(c.isoCode))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [
      ...priority.map((c, i) => ({
        value:     c.isoCode,
        label:     c.name,
        flag:      c.flag,
        badge:     'Priority',
        separator: i === priority.length - 1,
      })),
      ...rest.map((c) => ({ value: c.isoCode, label: c.name, flag: c.flag })),
    ];
  }, []);

  // State items from selected country, alphabetically sorted
  const stateItems = useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ value: s.isoCode, label: s.name }));
  }, [countryCode]);

  const stateLabel = t(`location.stateLabels.${countryCode}`, t('location.stateLabels.default'));
  const hasStates  = stateItems.length > 0;

  const set = (field, val) => onChange({ ...value, [field]: val });

  const handleCountryChange = (code) => {
    const country = countryItems.find((c) => c.value === code);
    onChange({ ...value, countryCode: code, countryName: country?.label || code, stateCode: '', stateName: '', city: '' });
  };

  const handleStateChange = (code) => {
    const state = stateItems.find((s) => s.value === code);
    onChange({ ...value, stateCode: code, stateName: state?.label || code, city: '' });
  };

  return (
    <div className="space-y-4">

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('location.addressLine1')}
        </label>
        <input
          className={inp}
          placeholder={t('location.addressLine1Placeholder')}
          value={addressLine1}
          onChange={(e) => set('addressLine1', e.target.value)}
        />
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('location.addressLine2')}{' '}
          <span className="text-gray-400 font-normal text-xs">{t('common.optional')}</span>
        </label>
        <input
          className={inp}
          placeholder={t('location.addressLine2Placeholder')}
          value={addressLine2}
          onChange={(e) => set('addressLine2', e.target.value)}
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('location.country')} <span className="text-red-500">*</span>
        </label>
        <Combobox
          value={countryCode}
          onChange={handleCountryChange}
          items={countryItems}
          placeholder={t('location.selectCountry')}
          searchPlaceholder={t('location.searchCountry')}
          noResultsText={(q) => t('location.noResults', { query: q })}
        />
      </div>

      {/* State / Province */}
      {countryCode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {stateLabel}
          </label>
          {hasStates ? (
            <Combobox
              value={stateCode}
              onChange={handleStateChange}
              items={stateItems}
              placeholder={t('location.selectState', { state: stateLabel })}
              searchPlaceholder={t('location.searchState', { state: stateLabel })}
              noResultsText={(q) => t('location.noResults', { query: q })}
            />
          ) : (
            <input
              className={inp}
              placeholder={t('location.enterState', { state: stateLabel })}
              value={stateCode}
              onChange={(e) => set('stateCode', e.target.value)}
            />
          )}
        </div>
      )}

      {/* City + Postal Code */}
      {countryCode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('location.city')}</label>
            <input
              className={inp}
              placeholder={t('location.cityPlaceholder')}
              value={city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('location.postalCode')}
            </label>
            <input
              className={inp}
              placeholder={t('location.postalCodePlaceholder')}
              value={postalCode}
              onChange={(e) => set('postalCode', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

FormLocationSelect.propTypes = {
  value: PropTypes.shape({
    countryCode:  PropTypes.string,
    stateCode:    PropTypes.string,
    city:         PropTypes.string,
    postalCode:   PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

export default FormLocationSelect;
