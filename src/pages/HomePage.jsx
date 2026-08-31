import React from 'react';
import HeroSection from '../components/home/HeroSection';
import EventsTicker from '../components/home/EventsTicker';
import WelcomeSection from '../components/home/WelcomeSection';
import GlobalPresenceSection from '../components/home/GlobalPresenceSection';
import AtmosphereSection from '../components/home/AtmosphereSection';
import LeadershipSection from '../components/home/LeadershipSection';
import MinistriesSection from '../components/home/MinistriesSection';
// import NewsletterSection from '../components/home/NewsletterSection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <EventsTicker />
      <HeroSection />
      <WelcomeSection />
<GlobalPresenceSection />
      <AtmosphereSection />
      <LeadershipSection />
      <MinistriesSection />
      {/* <NewsletterSection /> */}
    </div>
  );
};

export default HomePage;
