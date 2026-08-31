import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import homeNigeria from '../../assets/home_nigeria.png';
import homeUsa from '../../assets/home_usa.png';
import homeUk from '../../assets/home_uk.png';

const GlobalPresenceSection = () => {
  const { t } = useTranslation('ui');
  const [activeRegion, setActiveRegion] = useState('AFRICA');

  const continents = [
    {
      code: 'AFRICA',
      name: 'AFRICA',
      image: homeNigeria,
      descKey: 'africaDesc',
      countries: ['Nigeria', 'Ghana', 'South Africa']
    },
    {
      code: 'AMERICA',
      name: 'AMERICA',
      image: homeUsa,
      descKey: 'americaDesc',
      countries: ['United States']
    },
    {
      code: 'EUROPE',
      name: 'EUROPE',
      image: homeUk,
      descKey: 'europeDesc',
      countries: ['United Kingdom']
    }
  ];

  const activeContinentData = continents.find(continent => continent.code === activeRegion);

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t('globalPresence.heading')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('globalPresence.subheading')}
          </p>
        </div>

        {/* Continent Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {continents.map((continent) => (
            <button
              key={continent.code}
              onClick={() => setActiveRegion(continent.code)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeRegion === continent.code
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{continent.code}</div>
                <div className="text-sm">{continent.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Continent Display */}
        {activeContinentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={activeContinentData.image}
                  alt={`Ministry in ${activeContinentData.name}`}
                  className="w-full h-96 object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  {t('globalPresence.continentHeading', { name: activeContinentData.name })}
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {t(`globalPresence.${activeContinentData.descKey}`)}
                </p>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">{t('globalPresence.countriesLabel')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeContinentData.countries.map((country, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">{t('globalPresence.whatWeDoLabel')}</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('globalPresence.services')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('globalPresence.bibleStudy')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('globalPresence.evangelism')}</span>
                  </li>
                </ul>
              </div>

           
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalPresenceSection; 