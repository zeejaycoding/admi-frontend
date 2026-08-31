import React from 'react';
import RegionHeroSection from '../../../components/regions/shared/RegionHeroSection';
import RegionWelcomeSection from '../../../components/regions/shared/RegionWelcomeSection';
import RegionPresenceSection from '../../../components/regions/shared/RegionPresenceSection';
import RegionAtmosphereSection from '../../../components/regions/shared/RegionAtmosphereSection';
import RegionLeadershipSection from '../../../components/regions/shared/RegionLeadershipSection';
import { ukConfig } from '../../../components/regions/shared/regionHomeConfig';
import MinistriesSection from '../../../components/home/MinistriesSection';

const UKHomePage = () => {
  return (
    <div className="min-h-screen">
      <RegionHeroSection config={ukConfig} />
      <RegionWelcomeSection config={ukConfig} />
      <RegionPresenceSection config={ukConfig} />
      <RegionAtmosphereSection config={ukConfig} />
      <RegionLeadershipSection config={ukConfig} />
      <MinistriesSection />
    </div>
  );
};

export default UKHomePage;
