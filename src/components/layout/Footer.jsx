import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import admiLogo from '../../assets/admi-small.png';
import powercityLogo from '../../assets/Powercity White 1.png';
import { useRegion } from '../../context/RegionContext';
import { API_BASE_URL } from '../../constants/api';
import { useTranslation } from 'react-i18next';

const inp =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm text-gray-900 placeholder-gray-400';

const Footer = () => {
  const { t } = useTranslation('ui');
  const currentYear = new Date().getFullYear();
  const { selectedRegion } = useRegion();

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const isPowercityRegion = selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code);

  const getBrandName = () => isPowercityRegion
    ? 'PowerCity International'
    : 'Abel Damina Ministries International (ADMI)';

  const currentLogo = isPowercityRegion ? powercityLogo : admiLogo;

  const buildUrlWithRegion = useCallback((path) => {
    if (process.env.NODE_ENV === 'production') return path;
    if (selectedRegion?.code && selectedRegion.code !== 'NG') {
      return `${path}?region=${selectedRegion.code}`;
    }
    return path;
  }, [selectedRegion?.code]);

  const openInNewTab = (url) => (e) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const setField = (f) => (e) => setContactForm((p) => ({ ...p, [f]: e.target.value }));

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactSuccess(false);
    setContactError('');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError('');
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message.');
      }
      setContactSuccess(true);
    } catch (err) {
      setContactError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const quickLinks = [
    { name: t('footer.aboutUs'), href: buildUrlWithRegion('/about') },
    { name: t('footer.campuses'), href: buildUrlWithRegion('/campuses') },
    { name: t('footer.estore'), href: buildUrlWithRegion('/estore') },
  ];

  const ministries = [
    { name: t('footer.discipleship'), href: buildUrlWithRegion('/discipleship') },
    { name: t('footer.powerBibleSchool'), href: buildUrlWithRegion('/power-bible-school') },
    { name: t('footer.mentoringAcademy'), href: buildUrlWithRegion('/mentoring-academy') },
  ];

  return (
    <footer className="bg-brand-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to={buildUrlWithRegion('/')} className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
              <img
                src={currentLogo}
                alt={getBrandName()}
                className={`object-contain h-12 ${isPowercityRegion ? 'w-auto' : 'w-12'}`}
              />
              {!isPowercityRegion && (
                <span className="text-xl font-bold">{getBrandName()}</span>
              )}
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/185bhZihhH/" onClick={openInNewTab('https://www.facebook.com/share/185bhZihhH/')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://x.com/abeldamina" onClick={openInNewTab('https://x.com/abeldamina')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/abeldamina?igsh=eWJoeDdvZjNkMDE0" onClick={openInNewTab('https://www.instagram.com/abeldamina?igsh=eWJoeDdvZjNkMDE0')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@abeldamina?lang=en&is_from_webapp=1&sender_device=mobile&sender_web_id=7612034227505382913" onClick={openInNewTab('https://www.tiktok.com/@abeldamina?lang=en&is_from_webapp=1&sender_device=mobile&sender_web_id=7612034227505382913')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 112.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005.76 20.5a6.34 6.34 0 003.86-5.8V2.28h3.59a8.39 8.39 0 004.59 7.56z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO" onClick={openInNewTab('https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ministries */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.ministriesSection')}</h3>
            <ul className="space-y-2">
              {ministries.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.connect')}</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                >
                  {t('footer.contactUs')}
                </button>
              </li>
              <li>
                <Link
                  to={buildUrlWithRegion('/donate')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {t('footer.give')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} {getBrandName()}. {t('footer.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) closeContactModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t('footer.contact.title')}</h2>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {contactSuccess ? (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green-600">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('footer.contact.successTitle')}</h3>
                <p className="text-gray-500 text-sm mb-6">{t('footer.contact.successMsg')}</p>
                <button
                  onClick={closeContactModal}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-colors"
                >
                  {t('footer.contact.done')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('footer.contact.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inp}
                      placeholder={t('footer.contact.namePlaceholder')}
                      value={contactForm.name}
                      onChange={setField('name')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('footer.contact.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className={inp}
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={setField('email')}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('footer.contact.subject')}</label>
                  <input
                    className={inp}
                    placeholder={t('footer.contact.subjectPlaceholder')}
                    value={contactForm.subject}
                    onChange={setField('subject')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('footer.contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className={`${inp} resize-none`}
                    placeholder={t('footer.contact.messagePlaceholder')}
                    value={contactForm.message}
                    onChange={setField('message')}
                    required
                  />
                </div>
                {contactError && (
                  <p className="text-sm text-red-600 text-center">{contactError}</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeContactModal}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('footer.contact.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {contactSubmitting ? t('footer.contact.sending') : t('footer.contact.send')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
