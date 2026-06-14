import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Tools } from './sections/Tools';
import { SocialMediaPlatforms } from './sections/SocialMediaPlatforms';
import { EcommercePlatforms } from './sections/EcommercePlatforms';
import { Services } from './sections/Services';
import { Portfolio } from './sections/Portfolio';
import { Skills } from './sections/Skills';
import { Certifications } from './sections/Certifications';
import { WhyHireMe } from './sections/WhyHireMe';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

import { SamplePage } from './pages/SamplePage';

const App: React.FC = () => {

  useEffect(() => {
    // Refresh ScrollTrigger after all sections mount
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(timer);
  }, []);

  if (window.location.pathname === '/sample') {
    return <SamplePage />;
  }

  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero isLoaded={true} />
        <About />
        <Tools />
        <EcommercePlatforms />
        <SocialMediaPlatforms />
        <Services />
        <Portfolio />
        <Skills />
        <Certifications />
        <WhyHireMe />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;

