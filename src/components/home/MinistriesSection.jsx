import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import banner from '../../assets/banner.png';
import { useRegion } from '../../context/RegionContext';

// Static config — icons and routes never change; text comes from i18n
const MINISTRY_CONFIG = [
  {
    key: 'discipleship',
    route: '/discipleship',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'powerBibleSchool',
    route: '/power-bible-school',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'mentoringAcademy',
    route: '/mentoring-academy',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const MinistriesSection = () => {
  const { t } = useTranslation('ui');
  const { selectedRegion } = useRegion();
  const isPCI = selectedRegion && ['US', 'UK', 'ZA', 'GH'].includes(selectedRegion.code);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {isPCI && (
          <img src={banner} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        )}
        <div className={`absolute inset-0 ${isPCI ? 'bg-primary-600/70' : 'bg-primary-600'}`}></div>
        <div className="absolute inset-0 bg-brand-black/40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t('ministries.heading')}
          </h2>
          <p className="text-lg text-accent max-w-3xl mx-auto leading-relaxed">
            {t('ministries.subheading')}
          </p>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MINISTRY_CONFIG.map(({ key, route, icon }) => (
            <Link
              key={key}
              to={route}
              className="group flex flex-col bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-brand-black mb-6">
                {icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white mb-3">{t(`ministries.${key}.title`)}</h3>
              <p className="text-white/75 leading-relaxed flex-1">{t(`ministries.${key}.description`)}</p>

              {/* CTA */}
              <div className="mt-6 flex items-center text-yellow-400 font-semibold group-hover:gap-3 gap-2 transition-all duration-200">
                <span>{t('ministries.joinNow')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
