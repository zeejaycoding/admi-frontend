import React from 'react';
import { useTranslation } from 'react-i18next';
import aboutTop from '../../assets/about_top.png';

const AboutHero = () => {
  const { t } = useTranslation('ui');
  return (
    <section
      className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center overflow-hidden"
      style={{ backgroundImage: `url(${aboutTop})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-primary-600/60 to-black/80" />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          {t('about.ourMission')}
        </h1>
        <p className="mt-6 max-w-4xl mx-auto text-lg md:text-xl text-gray-200 leading-relaxed">
          {t('about.missionDesc')}
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
