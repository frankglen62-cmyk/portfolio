import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { VisualEditorProvider, useVisualEditor } from './contexts/VisualEditorContext';
import { VisualEditorPanel } from './components/editor/VisualEditorPanel';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/layout/Navbar';
import { SideNav } from './components/layout/SideNav';
import { Hero } from './sections/Hero';
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
import { CardCarousel } from './pages/CardCarousel';

const App: React.FC = () => {

  useEffect(() => {
    // Refresh ScrollTrigger after all sections mount
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(timer);
  }, []);

  if (window.location.pathname === '/sample') {
    return <SamplePage />;
  }

  if (window.location.pathname === '/cards') {
    return <CardCarousel />;
  }

  return (
    <VisualEditorProvider>
      <AppContent />
    </VisualEditorProvider>
  );
};

const AppContent: React.FC = () => {
  const { editMode, isDragging, setSelectedElement } = useVisualEditor();

  return (
    <div
      className="relative"
      onClick={() => {
        if (editMode && !isDragging) {
          setSelectedElement(null);
        }
      }}
    >
      <VisualEditorPanel />
      <Navbar />
      <SideNav />
      <main>
        <Hero isLoaded={true} />
        <Services />
        <Skills />
        <EcommercePlatforms />
        <Tools />
        <Portfolio />
        <Certifications />
        <WhyHireMe />
        <SocialMediaPlatforms />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
