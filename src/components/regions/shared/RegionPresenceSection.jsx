import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RegionPresenceSection = ({ config }) => {
  const { t } = useTranslation('ui');
  const { presence, emoji } = config;
  const [activeRegion, setActiveRegion] = useState(presence.initial);

  const regions = presence.regions;
  const activeRegionData = regions.find((region) => region.code === activeRegion);
  const items = activeRegionData ? activeRegionData[presence.itemsKey] : [];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-yellow-400 font-semibold mb-4">
            <span className="text-2xl">{emoji}</span>
            <span>{t('presence.acrossTheNation')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t(presence.headingKey)}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t(presence.subtitleKey)}
          </p>
        </div>

        {/* Region Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {regions.map((region) => (
            <button
              key={region.code}
              onClick={() => setActiveRegion(region.code)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeRegion === region.code
                  ? `bg-gradient-to-r ${presence.tabGradient} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold mb-1">
                  {presence.tabCodeReplace ? region.code.replace('_', ' ') : region.code}
                </div>
                <div className="text-xs">{region.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Region Display */}
        {activeRegionData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={presence.image}
                  alt={`Ministry in ${activeRegionData.name}`}
                  className="w-full h-96 object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${presence.imageOverlay} to-transparent`}></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold">{activeRegionData.highlight}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  Powercity {activeRegionData.name}
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {activeRegionData.description}
                </p>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t(presence.itemsLabelKey)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <span key={index} className={`px-4 py-2 bg-gradient-to-r ${presence.chipGradient} text-white rounded-full text-sm border border-white/10`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">{t('presence.focusTitle')}</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${presence.focusBullets[0]} rounded-full`}></div>
                    <span>{t('presence.celebrations')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${presence.focusBullets[1]} rounded-full`}></div>
                    <span>{t('presence.outreach')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${presence.focusBullets[2]} rounded-full`}></div>
                    <span>{t('presence.discipleship')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${presence.focusBullets[3]} rounded-full`}></div>
                    <span>{t('presence.youth')}</span>
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

export default RegionPresenceSection;
