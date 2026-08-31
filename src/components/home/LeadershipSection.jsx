import React from 'react';
import { useTranslation } from 'react-i18next';
import homeMeetOurLeaders from '../../assets/papa_mama_updated.jpeg';

const LeadershipSection = () => {
  const { t } = useTranslation('ui');
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={homeMeetOurLeaders} 
                alt="Powercity International Leaders" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary-500 rounded-full opacity-60 animate-bounce"></div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {t('leadership.heading')}
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t('leadership.description')}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">{t('leadership.visionTitle')}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('leadership.visionDesc')}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">{t('leadership.valuesTitle')}</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('leadership.servantLeadership')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('leadership.biblicalIntegrity')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('leadership.globalVision')}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <span>{t('leadership.spiritualGrowth')}</span>
                  </li>
                </ul>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="#"
                  className="btn-primary text-center"
                >
                  Meet Our Team
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection; 