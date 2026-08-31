import React from 'react';
import { useTranslation } from 'react-i18next';
import aboutCongregation from '../../assets/home_unforgettable_moments.png';

const RevelationSection = () => {
  const { t } = useTranslation('ui');
  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">{t('about.revelationHeading')}</h2>
            <div className="space-y-4 text-gray-200 leading-relaxed">
              <p>{t('about.revelationP1')}</p>
              <p>{t('about.revelationP2')}</p>
              <p>{t('about.revelationP3')}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={aboutCongregation} alt="Powercity congregation worship" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevelationSection;
