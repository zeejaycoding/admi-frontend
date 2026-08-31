import React from 'react';
import RegionHeroSection from '../../../components/regions/shared/RegionHeroSection';
import RegionWelcomeSection from '../../../components/regions/shared/RegionWelcomeSection';
import RegionPresenceSection from '../../../components/regions/shared/RegionPresenceSection';
import RegionAtmosphereSection from '../../../components/regions/shared/RegionAtmosphereSection';
import RegionLeadershipSection from '../../../components/regions/shared/RegionLeadershipSection';
import { southAfricaConfig } from '../../../components/regions/shared/regionHomeConfig';
import MinistriesSection from '../../../components/home/MinistriesSection';

const SouthAfricaHomePage = () => {
  return (
    <div className="min-h-screen">
      <RegionHeroSection config={southAfricaConfig} />
      <RegionWelcomeSection config={southAfricaConfig} />
      <RegionPresenceSection config={southAfricaConfig} />
      <RegionAtmosphereSection config={southAfricaConfig} />
      <RegionLeadershipSection config={southAfricaConfig} />
      <MinistriesSection />
    </div>
  );
};

export default SouthAfricaHomePage;
