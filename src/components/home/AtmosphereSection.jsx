import React from 'react';
import { useTranslation } from 'react-i18next';
import homeUnforgettableMoments from '../../assets/home_unforgettable_moments.png';

const AtmosphereSection = () => {
  const { t } = useTranslation('ui');
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={homeUnforgettableMoments} 
          alt="Worship Atmosphere" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-primary-600/60 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t('atmosphere.heading')}
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                {t('atmosphere.description')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">{t('atmosphere.experienceTitle')}</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span>{t('atmosphere.worship')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span>{t('atmosphere.messages')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span>{t('atmosphere.miracles')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span>{t('atmosphere.revelation')}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); window.open('https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO', '_blank', 'noopener,noreferrer'); }}
                className="btn-primary text-center"
              >
                {t('atmosphere.joinSunday')}
              </a>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative">
            {/* Phone Mockup */}
            <a
              href="https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.preventDefault(); window.open('https://youtube.com/@abeldaminaministries?si=JHtvIWRi4h2Z7IZO', '_blank', 'noopener,noreferrer'); }}
              className="relative mx-auto max-w-sm cursor-pointer block"
            >
              <div className="relative bg-black rounded-3xl p-2 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl p-1">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl p-4 text-center text-white">
                    <div className="text-sm mb-2">{t('atmosphere.liveNow')}</div>
                    <div className="text-lg font-bold">{t('atmosphere.sundayService')}</div>
                    <div className="text-xs mt-2">{t('atmosphere.joinWorship')}</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary-500 rounded-full opacity-60 animate-bounce"></div>
            </a>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-3 h-3 bg-primary-400 rounded-full opacity-70 animate-ping"></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
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

export default AtmosphereSection; 