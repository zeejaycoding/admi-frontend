import React from 'react';
import RegionHeroSection from '../../../components/regions/shared/RegionHeroSection';
import RegionWelcomeSection from '../../../components/regions/shared/RegionWelcomeSection';
import RegionPresenceSection from '../../../components/regions/shared/RegionPresenceSection';
import RegionAtmosphereSection from '../../../components/regions/shared/RegionAtmosphereSection';
import RegionLeadershipSection from '../../../components/regions/shared/RegionLeadershipSection';
import { ghanaConfig } from '../../../components/regions/shared/regionHomeConfig';
import MinistriesSection from '../../../components/home/MinistriesSection';

const GhanaHomePage = () => {
  return (
    <div className="min-h-screen">
      <RegionHeroSection config={ghanaConfig} />
      <RegionWelcomeSection config={ghanaConfig} />
      <RegionPresenceSection config={ghanaConfig} />
      <RegionAtmosphereSection config={ghanaConfig} />
      <RegionLeadershipSection config={ghanaConfig} />
      <MinistriesSection />
    </div>
  );
};

export default GhanaHomePage;
