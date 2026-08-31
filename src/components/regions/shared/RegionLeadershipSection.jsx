import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import homeMeetOurLeaders from '../../../assets/papa_mama_updated.jpeg';

const valueLabelKeys = [
  'leadership.excellenceInMinistry',
  'leadership.biblicalIntegrity',
  'leadership.communityTransformation',
  'leadership.servantLeadership',
];

const RegionLeadershipSection = ({ config }) => {
  const { t } = useTranslation('ui');
  const { leadership, emoji } = config;

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={homeMeetOurLeaders}
                alt={leadership.imageAlt}
                className="w-full h-auto object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${leadership.imageOverlay} to-transparent`}></div>
            </div>

            {/* Leadership Badge */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-yellow-400 font-semibold text-center">
                  {t('leadership.globalLocalBadge')}
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className={`absolute -top-4 -right-4 w-8 h-8 ${leadership.decorative[0]} rounded-full opacity-80 animate-pulse`}></div>
            <div className={`absolute -bottom-4 -left-4 w-6 h-6 ${leadership.decorative[1]} rounded-full opacity-60 animate-bounce`}></div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-yellow-400 font-semibold">
                <span className="w-8 h-0.5 bg-yellow-400"></span>
                <span>{t('leadership.ourLeadership')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {t(leadership.headingKey)}
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t(leadership.descKey)}
              </p>
            </div>

            <div className="space-y-6">
              <div className={`bg-gradient-to-r ${leadership.visionBoxGradient} p-6 rounded-lg border border-white/10`}>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  {t(leadership.visionKey)}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t(leadership.visionDescKey)}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">{t('leadership.coreValues')}</h4>
                <ul className="space-y-3 text-gray-300">
                  {leadership.values.map((value, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${value.wrap} rounded-full flex items-center justify-center`}>
                        <span className={value.text}>{`0${index + 1}`}</span>
                      </div>
                      <span>{t(valueLabelKeys[index])}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/become-coordinator" className="btn-primary text-center">
                  {t('leadership.becomeCoordinator')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionLeadershipSection;
