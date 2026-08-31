import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import papaMain from '../../assets/papa_hd.jpeg';
import papaMama from '../../assets/papa_mama_update_hd.jpeg';
import papaMama2 from '../../assets/papa_mama_2.jpg';

const PastorsSection = () => {
  const { t } = useTranslation('ui');
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary-50 via-white to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-semibold tracking-wide uppercase">
              {t('about.leadershipBadge')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
            {t('about.meetOurPastors')}
            <span className="text-primary-600"> {t('about.pastors')}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-yellow-400 mx-auto mb-6"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">

          {/* Left Column - Portrait and Quick Stats */}
          <div className="space-y-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-yellow-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src={papaMain}
                    alt="Dr Abel Damina"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Bio and Details */}
          <div className="space-y-8">
            {/* Name and Title */}
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800">
                Dr. Abel Damina
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {t('about.seniorPastor')}
                </span>
                <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium">
                  {t('about.admiFounder')}
                </span>
                <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
                  {t('about.klnCeo')}
                </span>
              </div>
            </div>

            {/* Bio Content */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  <Trans i18nKey="about.bio1" ns="ui" components={{ strong: <strong /> }} />
                </p>

                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  <Trans i18nKey="about.bio2" ns="ui" components={{ strong: <strong /> }} />
                </p>

                <p className="text-lg text-slate-700 leading-relaxed">
                  <Trans i18nKey="about.bio3" ns="ui" components={{ strong: <strong /> }} />
                </p>
              </div>

              {/* Family Section */}
              <div className="bg-gradient-to-r from-primary-50 to-white p-8 rounded-2xl shadow-lg border border-white/20">
                <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  {t('about.familyLife')}
                </h4>
                <p className="text-slate-700 leading-relaxed mb-6">
                  <Trans i18nKey="about.familyDesc" ns="ui" components={{ strong: <strong />, em: <em /> }} />
                </p>

                {/* Family Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="group relative overflow-hidden rounded-xl h-64 sm:h-80">
    <img
      src={papaMama}
      alt="Drs Abel and Rachel Damina"
      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
    <div className="absolute bottom-3 left-3 text-white font-medium opacity-0 group-hover:opacity-100 transition duration-300">
      {t('about.drAbelRachel')}
    </div>
  </div>
  <div className="group relative overflow-hidden rounded-xl h-64 sm:h-80">
    <img
      src={papaMama2}
      alt="Dr Abel Damina Ministry"
      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
    <div className="absolute bottom-3 left-3 text-white font-medium opacity-0 group-hover:opacity-100 transition duration-300">
      {t('about.ministryLeadership')}
    </div>
  </div>
</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastorsSection;
