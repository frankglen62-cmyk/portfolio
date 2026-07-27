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
import { WhyHireMe } from './sections/WhyHireMe';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { useHeroIntro } from './hooks/useHeroIntro';
import { useSideNavVisibility } from './hooks/useSideNavVisibility';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {

  useEffect(() => {
    // Refresh ScrollTrigger after all sections mount
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <VisualEditorProvider>
      <AppContent />
    </VisualEditorProvider>
  );
};

const AppContent: React.FC = () => {
  const { editMode, isDragging, setSelectedElement } = useVisualEditor();
  const isHeroIntro = useHeroIntro();
  const isSideNavVisible = useSideNavVisibility();

  return (
    <div
      className="relative"
      onClick={() => {
        if (editMode && !isDragging) {
          setSelectedElement(null);
        }
      }}
    >
      {/* Editor chrome lives OUTSIDE the stage so it stays at true screen size
          and readable no matter how far the page canvas is scaled. */}
      <VisualEditorPanel />

      {/* Everything below is laid out on the fixed design canvas. */}
      <div id="viewport-stage" className="viewport-stage">
        <Navbar isVisible={isHeroIntro} />
        <SideNav isVisible={isSideNavVisible} />
        <main>
          <Hero isLoaded={true} />
          <Services />
          <Skills />
          <EcommercePlatforms />
          <Tools />
          <Portfolio />
          <WhyHireMe />
          <SocialMediaPlatforms />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
