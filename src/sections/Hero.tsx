import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { EditableElement } from '../components/editor/EditableElement';
import { WordPullUp } from '../components/animations/WordPullUp';
import { BlurredTextTicker } from '../components/ui/blurred-text-ticker';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  isLoaded: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded }) => {
  const sceneRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitPoseRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [isMobileViewport, setIsMobileViewport] = React.useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 809px)').matches : false
  ));
  const ease = [0.16, 1, 0.3, 1] as const;
  const { layout, configLoaded, editMode, isDragging, setSelectedElement } = useVisualEditor();
  const getLayout = useCallback((id: string) => {
    const mobileId = `${id}Mobile`;
    return isMobileViewport && layout[mobileId] ? layout[mobileId] : layout[id];
  }, [isMobileViewport, layout]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 809px)');
    const sync = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    if (!configLoaded || !sceneRef.current || !portraitRef.current || !portraitPoseRef.current || !aboutRef.current) return;

    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>('.hero-scroll-out');
      const aboutItems = gsap.utils.toArray<HTMLElement>('.about-scroll-in');
      const mm = gsap.matchMedia();

      gsap.set(aboutRef.current, { autoAlpha: 1 });
      gsap.set(aboutItems, { autoAlpha: 0, y: 30 });

      mm.add(
        {
          desktop: '(min-width: 810px)',
          mobile: '(max-width: 809px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            mobile: boolean;
            reduceMotion: boolean;
          };

          const getDesktopPortraitX = () => {
            const widthRatio = window.innerWidth / 1920;
            return -85 * widthRatio;
          };

          const getAboutPortraitX = () => {
            if (!portraitRef.current || !aboutRef.current) return 0;

            const image = portraitRef.current.querySelector('img');
            const imageWidth = image?.getBoundingClientRect().width ?? 0;
            const aboutLeft = aboutRef.current.getBoundingClientRect().left;
            const contentGap = Math.min(16, Math.max(12, window.innerWidth * 0.0075));
            const initialPoseX = getDesktopPortraitX();
            const visibleRightFromCenter = imageWidth * (0.82174688 - 0.5);

            return aboutLeft - contentGap - (window.innerWidth / 2) - visibleRightFromCenter + initialPoseX;
          };

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: sceneRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: reduceMotion ? true : desktop ? 0.9 : 0.35,
              invalidateOnRefresh: true,
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
                y: desktop ? () => -60 * (window.innerHeight / 919) : 24,
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
                y: desktop ? () => -19 * (window.innerHeight / 919) : 0,
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
        },
      );

      return () => mm.revert();
    }, sceneRef);

    return () => ctx.revert();
  }, [configLoaded]);

  return (
    <section
      id="home"
      ref={sceneRef}
      className="relative h-[200svh] min-h-[200svh] overflow-visible"
      onClick={() => editMode && !isDragging && setSelectedElement(null)}
    >
      <div id="about" className="absolute top-1/2 h-px w-px" aria-hidden="true" />

      <div className="sticky top-0 h-[100svh] min-h-[100svh] overflow-hidden">
        {/* This is the original Hero background, shared by both scroll states. */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 50% at 50% 38%, rgba(220, 225, 230, 0.6) 0%, transparent 70%),
              linear-gradient(180deg, #d8dbdf 0%, #aab0b8 20%, #878c96 40%, #969ba5 60%, #b8bdc5 80%, #f0f1f3 100%)
            `,
          }}
        />

        <div
          className={`hero-scroll-out hero-greeting absolute top-[14%] md:top-[12%] w-full flex justify-center gap-[4vw] md:gap-[8vw] ${editMode ? 'z-[80]' : 'z-10'} pointer-events-none select-none px-4`}
        >
          <EditableElement id="heyTextLeft" responsivePosition style={{ pointerEvents: 'none' }}>
            <WordPullUp
              words="Hey,"
              className="hero-greeting-word font-heading italic leading-none block"
              style={{
                fontSize: getLayout('heyTextLeft')?.fontSize, fontWeight: getLayout('heyTextLeft')?.fontWeight,
                letterSpacing: getLayout('heyTextLeft')?.letterSpacing, lineHeight: getLayout('heyTextLeft')?.lineHeight,
                color: getLayout('heyTextLeft')?.color,
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: isMobileViewport ? 0.12 : 0.4 } }
              }}
            />
          </EditableElement>
          <EditableElement id="heyTextRight" responsivePosition style={{ pointerEvents: 'none' }}>
            <WordPullUp
              words="there"
              className="hero-greeting-word font-heading italic leading-none block"
              style={{
                fontSize: getLayout('heyTextRight')?.fontSize, fontWeight: getLayout('heyTextRight')?.fontWeight,
                letterSpacing: getLayout('heyTextRight')?.letterSpacing, lineHeight: getLayout('heyTextRight')?.lineHeight,
                color: getLayout('heyTextRight')?.color,
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: isMobileViewport ? 0.2 : 0.6 } }
              }}
            />
          </EditableElement>
        </div>

        {/* One portrait layer is retained for the entire transition. */}
        <div
          className={`hero-portrait absolute bottom-0 left-1/2 ${editMode ? 'z-[70]' : 'z-20'} h-[74svh] sm:h-[80svh] md:h-[95svh] lg:h-[105svh] will-change-transform`}
        >
          <div ref={portraitRef} className="h-full will-change-transform">
            <motion.div
            initial={isMobileViewport ? { opacity: 0, scale: 0.985, y: 0 } : { opacity: 0, scale: 0.96, y: 30 }}
            animate={isLoaded
              ? { opacity: 1, scale: 1, y: 0 }
              : isMobileViewport
                ? { opacity: 0, scale: 0.985, y: 0 }
                : { opacity: 0, scale: 0.96, y: 30 }}
            transition={isMobileViewport
              ? { duration: 0.62, ease, delay: 0.04 }
              : { duration: 1.2, ease, delay: 0.25 }}
              className="h-full"
            >
              <div ref={portraitPoseRef} className="h-full origin-bottom will-change-transform">
              <EditableElement id="characterImage" responsivePosition className="h-full" style={{ transformOrigin: 'bottom' }}>
                <img
                  src={`${import.meta.env.BASE_URL}frank-profile.png`}
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

        {/* Fade & Blur Effects (Behind text) */}
        <div
          className="hero-bottom-fade absolute inset-x-0 bottom-0 h-[22svh] z-[25] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(240,241,243,0) 0%, rgba(240,241,243,0.18) 58%, rgba(240,241,243,0.68) 100%)' }}
        />
        <div
          className="hero-bottom-blur absolute inset-x-0 bottom-0 h-[12svh] z-[26] pointer-events-none"
          style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            opacity: 0.45,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 72%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 72%)',
          }}
        />
        <div
          className={`hero-scroll-out hero-badge-wrap absolute left-[4%] md:left-[5%] lg:left-[8%] top-[47%] md:top-[50%] ${editMode ? 'z-[80]' : 'z-30'} hidden md:block`}
        >
          <EditableElement id="availableBadge" responsivePosition>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.45 : 0.6, delay: isMobileViewport ? 0.28 : 0.8 }}
              className="hero-availability-badge flex items-center gap-2.5 bg-white/50 backdrop-blur-sm px-5 py-3 rounded-full border border-dark/5 shadow-sm origin-left"
              style={{ opacity: getLayout('availableBadge')?.opacity }}
            >
              <span className="hero-availability-dot w-2.5 h-2.5 rounded-full shrink-0" />
              <span className="font-body font-medium text-[13px] text-dark">
                {isMobileViewport ? 'Available for opportunities' : 'Available for new opportunities'}
              </span>
            </motion.div>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-specialization-wrap absolute right-[4%] md:right-[5%] lg:right-[8%] top-[46%] md:top-[48%] ${editMode ? 'z-[80]' : 'z-30'} max-w-[200px] text-right hidden md:block`}
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
          className={`hero-scroll-out hero-identity-wrap absolute bottom-[13%] md:bottom-[10%] left-[4%] md:left-[5%] lg:left-[8%] ${editMode ? 'z-[80]' : 'z-[60]'} transform-gpu`}
        >
          <EditableElement id="iAmFrankText" responsivePosition>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.62 : 0.8, delay: isMobileViewport ? 0.4 : 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="hero-identity-title font-display text-dark uppercase"
              style={{
                fontSize: getLayout('iAmFrankText')?.fontSize, fontWeight: getLayout('iAmFrankText')?.fontWeight,
                letterSpacing: getLayout('iAmFrankText')?.letterSpacing, lineHeight: getLayout('iAmFrankText')?.lineHeight,
                color: getLayout('iAmFrankText')?.color,
              }}
            >
              I Am<br />Frank
            </motion.h1>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-role-wrap absolute bottom-[13%] md:bottom-[10%] right-[4%] md:right-[5%] lg:right-[8%] ${editMode ? 'z-[80]' : 'z-[60]'} text-right transform-gpu`}
        >
          <EditableElement id="roleTitleText" responsivePosition>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobileViewport ? 0.62 : 0.8, delay: isMobileViewport ? 0.5 : 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="hero-role-title font-display text-dark uppercase"
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
          className="hero-about-panel invisible absolute z-30 top-[10%] bottom-[7%] left-[6%] right-[6%] md:top-[14%] md:bottom-[8%] md:left-[51%] md:right-[6%] lg:left-[52%] lg:right-[8%] flex flex-col justify-start md:justify-center text-dark"
        >
          <div className="about-scroll-in font-ui text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.32em] mb-3 md:mb-5">
            Who I am
          </div>

          <EditableElement id="aboutTitle" label="About Title" responsivePosition>
            <h2
              className="about-scroll-in font-heading font-semibold tracking-[-0.045em] leading-[0.92] text-[clamp(2rem,6.2vw,5.6rem)] mb-5 md:mb-8"
              style={{
                fontSize: getLayout('aboutTitle')?.fontSize,
                fontWeight: getLayout('aboutTitle')?.fontWeight,
                letterSpacing: getLayout('aboutTitle')?.letterSpacing,
                lineHeight: getLayout('aboutTitle')?.lineHeight,
                opacity: getLayout('aboutTitle')?.opacity,
                color: '#1e1e1e',
              }}
            >
              Ecommerce VA<br />for ambitious sellers
            </h2>
          </EditableElement>

          <div className="about-scroll-in border-y border-dark/20 py-3 md:py-5 mb-4 md:mb-6 grid grid-cols-3">
            <div className="pr-2 md:pr-5 border-r border-dark/15">
              <strong className="font-heading text-xl md:text-4xl leading-none block">2+</strong>
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Years experience</span>
            </div>
            <div className="px-2 md:px-5 border-r border-dark/15">
              <strong className="font-heading text-xl md:text-4xl leading-none block">5</strong>
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Store platforms</span>
            </div>
            <div className="pl-2 md:pl-5">
              <strong className="font-heading text-xl md:text-4xl leading-none block">100+</strong>
              <span className="font-ui text-[7px] md:text-[9px] uppercase tracking-[0.13em] leading-tight mt-1.5 block">Listings optimized</span>
            </div>
          </div>

          <p className="about-scroll-in font-body text-[12px] sm:text-[13px] md:text-[16px] font-medium leading-[1.65] md:leading-[1.7] max-w-[640px] mb-4 md:mb-7 text-[#24272b]">
            I'm <strong className="font-bold text-[#111315]">Frank Glen Martin</strong>, a detail-oriented Ecommerce Virtual Assistant helping Shopify, eBay, and Amazon sellers keep their stores accurate, organized, and ready to convert. I support product listings, SEO content, inventory updates, competitor research, and the everyday work that keeps ecommerce moving.
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
              className="inline-flex w-fit items-center gap-5 bg-dark text-white font-body font-semibold text-[10px] md:text-xs rounded-full px-5 md:px-7 py-3 md:py-3.5"
            >
              Let's Connect <span aria-hidden="true">-&gt;</span>
            </motion.a>
            <span className="block font-ui text-[8px] md:text-[10px] font-medium tracking-wide text-[#34383d]">
              E-commerce - Shopify support
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
