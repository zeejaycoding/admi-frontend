import React from 'react';
import RegionHeroSection from '../../../components/regions/shared/RegionHeroSection';
import RegionWelcomeSection from '../../../components/regions/shared/RegionWelcomeSection';
import RegionPresenceSection from '../../../components/regions/shared/RegionPresenceSection';
import RegionAtmosphereSection from '../../../components/regions/shared/RegionAtmosphereSection';
import RegionLeadershipSection from '../../../components/regions/shared/RegionLeadershipSection';
import { usaConfig } from '../../../components/regions/shared/regionHomeConfig';
import MinistriesSection from '../../../components/home/MinistriesSection';

const USAHomePage = () => {
  return (
    <div className="min-h-screen">
      <RegionHeroSection config={usaConfig} />
      <RegionWelcomeSection config={usaConfig} />
      <RegionPresenceSection config={usaConfig} />
      <RegionAtmosphereSection config={usaConfig} />
      <RegionLeadershipSection config={usaConfig} />
      <MinistriesSection />
    </div>
  );
};

export default USAHomePage;
