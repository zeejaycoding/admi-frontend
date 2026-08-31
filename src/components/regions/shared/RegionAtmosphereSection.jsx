import React from 'react';
import { useTranslation } from 'react-i18next';
import homeUnforgettableMoments from '../../../assets/home_unforgettable_moments.png';

const YOUTUBE_URL = 'https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO';

const listIconPaths = [
  'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
];

const listLabelKeys = [
  'atmosphere.spiritFilled',
  'atmosphere.revelationTeaching',
  'atmosphere.testimonies',
  'atmosphere.warmFellowship',
];

const RegionAtmosphereSection = ({ config }) => {
  const { t } = useTranslation('ui');
  const { atmosphere } = config;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={homeUnforgettableMoments}
          alt="Worship Atmosphere"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${atmosphere.overlayGradient}`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="font-medium">{t('atmosphere.experienceDiff')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t(atmosphere.encounterKey)}
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                {t('atmosphere.encounterDesc')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">{t('atmosphere.awaitYou')}</h3>
              <ul className="space-y-3 text-gray-200">
                {atmosphere.listIcons.map((icon, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${icon.wrap} rounded-full flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${icon.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={listIconPaths[index]} />
                      </svg>
                    </div>
                    <span>{t(listLabelKeys[index])}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer'); }}
                className="btn-primary text-center"
              >
                {t('atmosphere.visitSunday')}
              </a>
            </div>
          </div>

          {/* Service Times Card */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm">
              <div className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10">
                <div className="text-center text-white space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${atmosphere.cardGradient} rounded-full mx-auto flex items-center justify-center`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300 mb-1">{t('atmosphere.serviceTimes')}</div>
                    <div className="text-2xl font-bold">{t('atmosphere.sundays')}</div>
                    <div className="text-yellow-400 font-semibold">{t('atmosphere.sundayTimes')}</div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-300 mb-1">{t('atmosphere.midweekService')}</div>
                    <div className="text-lg font-semibold">{t('atmosphere.wednesdayTime')}</div>
                  </div>
                  <div className="pt-4">
                    <div className="text-xs text-gray-400">{t('atmosphere.timesVary')}</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className={`absolute -top-4 -right-4 w-8 h-8 ${atmosphere.cardFloating[0]} rounded-full opacity-80 animate-pulse`}></div>
              <div className={`absolute -bottom-4 -left-4 w-6 h-6 ${atmosphere.cardFloating[1]} rounded-full opacity-60 animate-bounce`}></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-3 h-3 bg-white rounded-full opacity-70 animate-ping"></div>
            <div className={`absolute bottom-20 right-10 w-2 h-2 ${atmosphere.bottomFloating} rounded-full opacity-80 animate-bounce`}></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default RegionAtmosphereSection;
