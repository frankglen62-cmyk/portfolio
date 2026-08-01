import React, { useEffect, useState, Suspense, lazy } from 'react';
import { gsap } from 'gsap';
import { VisualEditorProvider } from './contexts/VisualEditorContext';
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
import { subscribeStageRelayout } from './lib/viewportStage';

gsap.registerPlugin(ScrollTrigger);

// The editor is Frank's authoring tool, not part of what a visitor came to see,
// but it was in the same chunk as the site — so every first-time visitor waited
// on it before the hero could paint. It is now its own chunk, fetched once the
// browser has gone idle. The gear button appears a beat later than the page; the
// page no longer waits for the gear button.
const EditorRoot = lazy(() => import('./components/editor/EditorRoot'));

/** True once the page has finished its initial work and can afford a side quest. */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => setIdle(true), { timeout: 4000 });
    return () => cancel(handle as number);
  }, []);

  return idle;
}

if (import.meta.env.DEV) {
  // Companion to `__viewportStage`: lets a scroll timeline be inspected and
  // stepped from the console when checking how the stage rescale behaves.
  Object.assign(window, { gsap, ScrollTrigger });
}

const App: React.FC = () => {

  useEffect(() => {
    // Refresh ScrollTrigger after all sections mount
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Every ScrollTrigger start/end is a cached pixel measurement. Rescaling
    // the stage — restoring the window down, rotating a phone, switching the
    // preview canvas — invalidates all of them at once, and without this the
    // page keeps playing the old timeline: that is what left the About panel
    // stuck half-faded after a resize.
    let timer = 0;
    const unsubscribe = subscribeStageRelayout(() => {
      // Settle first: dragging a window edge rescales the stage on every frame,
      // and a full refresh per frame would crawl.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 140);
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <VisualEditorProvider>
      <AppContent />
    </VisualEditorProvider>
  );
};

const AppContent: React.FC = () => {
  const isHeroIntro = useHeroIntro();
  const isSideNavVisible = useSideNavVisibility();
  const editorReady = useIdle();

  return (
    <div className="relative">
      {/* Editor chrome lives OUTSIDE the stage so it stays at true screen size
          and readable no matter how far the page canvas is scaled. */}
      {editorReady && (
        <Suspense fallback={null}>
          <EditorRoot />
        </Suspense>
      )}

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
