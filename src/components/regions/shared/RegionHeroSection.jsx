import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import homeFirstImg from '../../../assets/home_1st_img.png';
import AuthModal from '../../auth/AuthModal';

const RegionHeroSection = ({ config }) => {
  const { t } = useTranslation('ui');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const { hero, emoji, badgeLabel, imageAlt } = config;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with region-themed overlay */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${hero.overlayGradient}`}></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30px_30px,_rgba(255,255,255,0.15)_2px,_transparent_2px)] bg-[length:60px_60px]"></div>
        {hero.starsOverlay && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_10px_10px,_rgba(255,255,255,0.3)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">{emoji}</span>
            <span className="text-white font-medium">{badgeLabel}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block">{t('hero.vision')}</span>
            <span className="block text-yellow-300">
              {t('hero.tagline')}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t(hero.subtitleKey)}
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {!isAuthenticated && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-yellow-400 text-black font-medium text-lg px-8 py-4 rounded-full border border-white/20 transition-all duration-300"
              >
                {t('hero.joinUs')}
              </button>
            )}
          </div>

          {/* Featured Image */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative z-10">
              <img
                src={homeFirstImg}
                alt={imageAlt}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
            {/* Decorative Elements */}
            <div className={`absolute -top-4 -left-4 w-8 h-8 ${hero.decorative[0]} rounded-full opacity-60 animate-pulse`}></div>
            <div className={`absolute -bottom-4 -right-4 w-6 h-6 ${hero.decorative[1]} rounded-full opacity-80 animate-bounce`}></div>
            <div className={`absolute top-1/2 -right-8 w-4 h-4 ${hero.decorative[2]} rounded-full opacity-70 animate-ping`}></div>
          </div>
        </div>
      </div>


      {/* Floating Elements */}
      <div className={`absolute top-20 left-10 w-2 h-2 ${hero.floating[0]} rounded-full opacity-60 animate-ping`}></div>
      <div className={`absolute top-40 right-20 w-3 h-3 ${hero.floating[1]} rounded-full opacity-80 animate-bounce`}></div>
      <div className={`absolute bottom-40 left-20 w-2 h-2 ${hero.floating[2]} rounded-full opacity-70 animate-pulse`}></div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
};

export default RegionHeroSection;
