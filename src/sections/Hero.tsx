import React, { useLayoutEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { useViewport } from '../hooks/useViewport';
import { getViewportState, getRenderScale, getCanvasOrigin } from '../lib/viewportStage';
import { toCanvasLength } from '../lib/canvasUnits';
import { EditableElement } from '../components/editor/EditableElement';
import { WordPullUp } from '../components/animations/WordPullUp';
import { BlurredTextTicker } from '../components/ui/blurred-text-ticker';
import { AnimatedCounter } from '../components/animations/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  isLoaded: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded }) => {
  const sceneRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitPoseRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { mode: canvasMode } = useViewport();
  const isMobileViewport = canvasMode === 'mobile';
  const [aboutContentActive, setAboutContentActive] = React.useState(false);
  const ease = [0.16, 1, 0.3, 1] as const;
  const { layout, configLoaded, editMode, selectedElement } = useVisualEditor();
  const getLayout = useCallback((id: string) => {
    const mobileId = `${id}Mobile`;
    const config = isMobileViewport && layout[mobileId] ? layout[mobileId] : layout[id];
    if (!config) return config;
    // Saved values may still be written with `vw` / `vh`; rewrite them into
    // canvas units so they scale with the stage instead of the raw window.
    return {
      ...config,
      fontSize: toCanvasLength(config.fontSize),
      letterSpacing: toCanvasLength(config.letterSpacing),
      lineHeight: toCanvasLength(config.lineHeight),
      width: toCanvasLength(config.width),
      height: toCanvasLength(config.height),
    };
  }, [isMobileViewport, layout]);

  const getZIndex = useCallback((id: string, normal: string, edit: string) => {
    if (!editMode) return normal;
    const activeId = isMobileViewport ? `${id}Mobile` : id;
    return selectedElement === activeId ? 'z-[9999]' : edit;
  }, [editMode, isMobileViewport, selectedElement]);

  const getElementLayer = useCallback((id: string, fallback: number) => {
    const activeId = isMobileViewport ? `${id}Mobile` : id;
    if (editMode && selectedElement === activeId) return 9900;
    return layout[activeId]?.zIndex ?? fallback;
  }, [editMode, isMobileViewport, layout, selectedElement]);

  useLayoutEffect(() => {
    // Skip GSAP entirely in edit mode — its inline transforms fight EditableElement.
    // ctx.revert() (returned below) clears all GSAP inline styles when editMode turns on.
    if (editMode || !configLoaded || !sceneRef.current || !portraitRef.current || !portraitPoseRef.current || !aboutRef.current) return;

    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>('.hero-scroll-out');
      const aboutItems = gsap.utils.toArray<HTMLElement>('.about-scroll-in');

      gsap.set(aboutRef.current, { autoAlpha: 1 });
      gsap.set(aboutItems, { autoAlpha: 0, y: 30 });

      // Which composition plays is decided by the design canvas, not by the
      // window width, so resizing the browser can never swap the animation.
      const desktop = !isMobileViewport;
      // Read directly instead of through gsap.matchMedia(): that helper only
      // runs its callback while one of its queries matches, so a lone
      // reduced-motion query would silently skip building the timeline —
      // and the About panel would never fade in.
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const getDesktopPortraitX = () => -85;

      const getAboutPortraitX = () => {
        if (!portraitRef.current || !aboutRef.current) return 0;

        // GSAP writes transforms in canvas units while getBoundingClientRect
        // reports rendered pixels — so measure against the canvas box itself
        // instead of against the window, and undo its exact render scale.
        const { designWidth } = getViewportState();
        const scale = getRenderScale(aboutRef.current);
        const origin = getCanvasOrigin(aboutRef.current);

        const image = portraitRef.current.querySelector('img');
        const imageWidth = (image?.getBoundingClientRect().width ?? 0) / scale;
        const aboutLeft = (aboutRef.current.getBoundingClientRect().left - origin.left) / scale;
        const contentGap = Math.min(16, Math.max(12, designWidth * 0.0075));
        const initialPoseX = getDesktopPortraitX();
        const visibleRightFromCenter = imageWidth * (0.82174688 - 0.5);

        return aboutLeft - contentGap - (designWidth / 2) - visibleRightFromCenter + initialPoseX;
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
      scrollTrigger: {
          trigger: sceneRef.current,
          start: 'top top',
          end: 'bottom bottom',
        scrub: reduceMotion ? true : desktop ? 0.9 : 0.35,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (self.progress >= 0.24) setAboutContentActive(true);
        },
        },
      });

      timeline
        .to(heroItems, {
          autoAlpha: 0,
          y: desktop ? -20 : -10,
          duration: desktop ? 0.25 : 0.18,
          stagger: desktop ? 0.015 : 0.008,
        }, 0)
        .fromTo(
          portraitRef.current,
          {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
          },
          {
            // Keep the final portrait edge clear of the About panel at
            // every desktop aspect ratio.
            x: desktop ? getAboutPortraitX : 0,
            // Design pixels: the travel is part of the composition, so it must
            // not scale with however tall this particular window happens to be.
            y: desktop ? -60 : 24,
            scale: desktop ? 1 : 0.96,
            autoAlpha: desktop ? 1 : 0,
            duration: desktop ? 0.72 : 0.46,
            ease: desktop ? 'power2.inOut' : 'power1.out',
          },
          0.08,
        )
        .fromTo(
          portraitPoseRef.current,
          {
            x: desktop ? getDesktopPortraitX : 0,
            y: desktop ? -19 : 0,
            scale: 1,
          },
          {
            // Kept as a separate scroll layer so the saved Hero editor
            // position is never mutated by the About transition.
            x: 0,
            y: 0,
            scale: 1,
            duration: desktop ? 0.72 : 0.46,
            ease: 'power2.inOut',
          },
          0.08,
        )
        .to(
          aboutItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: desktop ? 0.28 : 0.22,
            stagger: desktop ? 0.075 : 0.045,
            ease: 'power2.out',
          },
          desktop ? 0.34 : 0.24,
        );

      return () => timeline.kill();

    }, sceneRef);

    return () => ctx.revert();
  }, [configLoaded, editMode, isMobileViewport]);

  return (
    <section
      id="home"
      ref={sceneRef}
      /* Height is scroll LENGTH, so it follows the window (two screenfuls of
         travel everywhere). The composition inside does not — see .canvas-box. */
      className="relative h-[calc(2*var(--screen-h))] min-h-[calc(2*var(--screen-h))] overflow-visible"
    >
      <div id="about" className="absolute top-1/2 h-px w-px" aria-hidden="true" />

      <div className="sticky top-0 h-[var(--screen-h)] min-h-[var(--screen-h)] overflow-hidden">
        {/* This is the original Hero background, shared by both scroll states.
            It fills the window at any shape — only the background is allowed to. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 20%, #111 40%, #0a0a0a 60%, #050505 80%, #000000 100%)',
          }}
        />

      {/* ── The hero composition lives on a fixed design-w x design-h frame ──
          Percentages, `top`/`bottom` and the editor's saved coordinates all
          resolve against THIS box, never against the window, so the elements
          keep their exact relationship to one another on every screen shape.
          Extra window height shows up as more background above it. */}
      <div className="hero-canvas canvas-box">
        {/* The key light belongs to the composition, not to the window, so it
            rides the canvas and keeps landing on the portrait's shoulders. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 50% at 50% 38%, rgba(30, 30, 30, 0.6) 0%, transparent 70%)',
          }}
        />


        {/* One portrait layer is retained for the entire transition. */}
        <div
          className={`hero-portrait absolute bottom-0 left-1/2 ${getZIndex('characterImage', 'z-20', 'z-[70]')} h-[calc(74*var(--vh))] will-change-transform`}
          style={{ zIndex: getElementLayer('characterImage', 20) }}
        >
          <div ref={portraitRef} className="h-full will-change-transform">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              // On mobile the portrait must fade in at its final position.
              // Only desktop keeps the subtle upward travel.
              x: 0,
              y: isMobileViewport ? 0 : 30,
            }}
            animate={isLoaded
              ? { opacity: 1, scale: 1, x: 0, y: 0 }
              : { opacity: 0, scale: 0.96, x: 0, y: isMobileViewport ? 0 : 30 }}
            transition={{ duration: isMobileViewport ? 0.82 : 1.2, ease, delay: isMobileViewport ? 0.08 : 0.25 }}
              className="h-full"
            >
              <div ref={portraitPoseRef} className="h-full origin-bottom will-change-transform">
              <EditableElement id="characterImage" responsivePosition className="h-full" style={{ transformOrigin: 'bottom' }}>
                <img
                  src={`${import.meta.env.BASE_URL}frank-profile.webp`}
                  alt="Frank Glen Martin"
                  className="hero-portrait-img object-contain origin-bottom"
                  draggable={false}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{
                    width: getLayout('characterImage')?.width,
                    height: getLayout('characterImage')?.height,
                    pointerEvents: 'none',
                  }}
                />
              </EditableElement>
              </div>
            </motion.div>
          </div>
        </div>


        <div
          className={`hero-scroll-out hero-badge-wrap absolute left-[4%] md:left-[5%] lg:left-[8%] top-[47%] md:top-[50%] ${getZIndex('availableBadge', 'z-30', 'z-[80]')} hidden md:block`}
          style={{ zIndex: getElementLayer('availableBadge', 30) }}
        >
          <EditableElement id="availableBadge" responsivePosition>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.45 : 0.6, delay: isMobileViewport ? 0.28 : 0.8 }}
              className="hero-availability-badge flex items-center gap-2.5 bg-black/50 backdrop-blur-sm px-5 py-3 rounded-full border border-white/10 shadow-sm origin-left"
              style={{ opacity: getLayout('availableBadge')?.opacity }}
            >
              <span className="hero-availability-dot w-2.5 h-2.5 rounded-full shrink-0" />
              <span className="font-body font-medium text-[13px] text-white">
                {isMobileViewport ? 'Available for opportunities' : 'Available for new opportunities'}
              </span>
            </motion.div>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-specialization-wrap absolute right-[4%] md:right-[5%] lg:right-[8%] top-[46%] md:top-[48%] ${editMode ? 'z-[80]' : 'z-30'} max-w-[200px] text-right hidden md:block`}
          style={{ zIndex: getElementLayer('specializationText', 30) }}
        >
          <EditableElement id="specializationText" responsivePosition>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: isMobileViewport ? 0.32 : 0.75, ease }}
              style={{
                fontSize: getLayout('specializationText')?.fontSize,
                fontWeight: getLayout('specializationText')?.fontWeight,
                letterSpacing: getLayout('specializationText')?.letterSpacing,
                lineHeight: getLayout('specializationText')?.lineHeight,
                color: getLayout('specializationText')?.color,
              }}
            >
              <BlurredTextTicker isMobile={isMobileViewport} />
              {editMode && !isMobileViewport && (
                <WordPullUp
                  words="Ecommerce support"
                  className="sr-only"
                  style={{
                    fontSize: getLayout('specializationText')?.fontSize, fontWeight: getLayout('specializationText')?.fontWeight,
                    letterSpacing: getLayout('specializationText')?.letterSpacing, lineHeight: getLayout('specializationText')?.lineHeight,
                    color: getLayout('specializationText')?.color,
                  }}
                  wrapperFramerProps={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.9 } }
                  }}
                  framerProps={{
                    hidden: { y: 10, opacity: 0 },
                    show: { y: 0, opacity: 1 }
                  }}
                />
              )}
            </motion.div>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-identity-wrap absolute bottom-[13%] md:bottom-[10%] left-[4%] md:left-[5%] lg:left-[8%] ${getZIndex('iAmFrankText', 'z-10', 'z-[60]')} transform-gpu`}
          style={{ zIndex: getElementLayer('iAmFrankText', 10) }}
        >
          <EditableElement id="iAmFrankText" responsivePosition>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.62 : 0.8, delay: isMobileViewport ? 0.4 : 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="hero-identity-title font-display text-white uppercase"
              style={{
                fontSize: getLayout('iAmFrankText')?.fontSize, fontWeight: getLayout('iAmFrankText')?.fontWeight,
                letterSpacing: getLayout('iAmFrankText')?.letterSpacing, lineHeight: getLayout('iAmFrankText')?.lineHeight,
                color: getLayout('iAmFrankText')?.color,
              }}
            >
              Frank
            </motion.h1>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-role-wrap absolute bottom-[13%] md:bottom-[10%] right-[4%] md:right-[5%] lg:right-[8%] ${getZIndex('roleTitleText', 'z-10', 'z-[60]')} text-right transform-gpu`}
          style={{ zIndex: getElementLayer('roleTitleText', 10) }}
        >
          <EditableElement id="roleTitleText" responsivePosition>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.62 : 0.8, delay: isMobileViewport ? 0.5 : 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="hero-role-title font-display text-white uppercase"
              style={{
                fontSize: getLayout('roleTitleText')?.fontSize, fontWeight: getLayout('roleTitleText')?.fontWeight,
                letterSpacing: getLayout('roleTitleText')?.letterSpacing, lineHeight: getLayout('roleTitleText')?.lineHeight,
                color: getLayout('roleTitleText')?.color,
              }}
            >
              Ecommerce<br />Virtual<br />Assistant
            </motion.h2>
          </EditableElement>
        </div>

        {/* Editorial About state */}
        <div
          ref={aboutRef}
          className="hero-about-panel invisible absolute z-30 top-[10%] bottom-[7%] left-[6%] right-[6%] md:top-[14%] md:bottom-[8%] md:left-[51%] md:right-[6%] lg:left-[52%] lg:right-[8%] flex flex-col justify-start md:justify-center text-white"
        >
          <div className="about-scroll-in font-ui text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.32em] mb-3 md:mb-5 text-white/50">
            Who I am
          </div>

          <EditableElement id="aboutTitle" label="About Title" responsivePosition>
            <WordPullUp
              words="Ecommerce VA for ambitious sellers"
              className="about-scroll-in font-heading font-semibold tracking-[-0.045em] leading-[0.92] text-[clamp(2rem,calc(6.2*var(--vw)),5.6rem)] mb-5 md:mb-8"
              style={{
                fontSize: getLayout('aboutTitle')?.fontSize,
                fontWeight: getLayout('aboutTitle')?.fontWeight,
                letterSpacing: getLayout('aboutTitle')?.letterSpacing,
                lineHeight: getLayout('aboutTitle')?.lineHeight,
                opacity: getLayout('aboutTitle')?.opacity,
                color: '#ffffff',
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
              }}
              framerProps={{
                hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease } },
              }}
            />
          </EditableElement>

          <div className="about-scroll-in border-y border-white/20 py-3 md:py-5 mb-4 md:mb-6 grid grid-cols-3">
            <div className="pr-2 md:pr-5 border-r border-white/15">
              <AnimatedCounter value={2} suffix="+" active={aboutContentActive} className="font-heading text-xl md:text-4xl leading-none block" />
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Years experience</span>
            </div>
            <div className="px-2 md:px-5 border-r border-white/15">
              <AnimatedCounter value={5} active={aboutContentActive} className="font-heading text-xl md:text-4xl leading-none block" />
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Store platforms</span>
            </div>
            <div className="pl-2 md:pl-5">
              <AnimatedCounter value={100} suffix="+" active={aboutContentActive} className="font-heading text-xl md:text-4xl leading-none block" />
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Listings optimized</span>
            </div>
          </div>

          <p className="about-scroll-in font-body text-[12px] sm:text-[13px] md:text-[16px] font-medium leading-[1.65] md:leading-[1.7] max-w-[640px] mb-4 md:mb-7 text-white/70">
            I'm <strong className="font-bold text-white">Frank Glen Martin</strong>, a detail-oriented Ecommerce Virtual Assistant helping Shopify, eBay, and Amazon sellers keep their stores accurate, organized, and ready to convert. I support product listings, SEO content, inventory updates, competitor research, and the everyday work that keeps ecommerce moving.
          </p>

          <ul className="about-scroll-in about-capabilities hidden" aria-label="Ecommerce support capabilities">
            <li>Product listings</li>
            <li>SEO content</li>
            <li>Inventory updates</li>
            <li>Product research</li>
          </ul>

          <div className="about-scroll-in flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex w-fit items-center gap-5 bg-white text-dark font-body font-semibold text-[10px] md:text-xs rounded-full px-5 md:px-7 py-3 md:py-3.5"
            >
              Let's Connect <span aria-hidden="true">-&gt;</span>
            </motion.a>
            <span className="block font-ui text-[8px] md:text-[10px] font-medium tracking-wide text-white/40">
              E-commerce - Shopify support
            </span>
          </div>
        </div>

      </div>
      </div>
    </section>
  );
};
