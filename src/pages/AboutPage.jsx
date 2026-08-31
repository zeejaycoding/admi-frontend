import React from 'react';
import AboutHero from '../components/about/AboutHero';
import PastorsSection from '../components/about/PastorsSection';
import RevelationSection from '../components/about/RevelationSection';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <PastorsSection />
      <RevelationSection />
    </div>
  );
};

export default AboutPage;
