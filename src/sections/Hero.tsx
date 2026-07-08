import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { EditableElement } from '../components/editor/EditableElement';
import { WordPullUp } from '../components/animations/WordPullUp';

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
      const nav = document.querySelector<HTMLElement>('[data-hero-nav]');
      const mm = gsap.matchMedia();

      // GSAP owns the complete portrait transform. Keeping the centering
      // transform out of CSS prevents it from being overwritten on refresh.
      gsap.set(portraitRef.current, { xPercent: -50 });
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

          gsap.set(
            portraitPoseRef.current,
            desktop ? { x: -120, y: -19, scale: 1 } : { x: 0, y: 0, scale: 1 },
          );

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: sceneRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: reduceMotion ? true : 0.9,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .to(heroItems, { autoAlpha: 0, y: -20, duration: 0.25, stagger: 0.015 }, 0)
            .to(nav, { autoAlpha: 0, duration: 0.22 }, 0)
            .to(
              portraitRef.current,
              {
                // Account for characterImage editor offset (x: 117px) so the
                // portrait left edge sits flush with the viewport edge.
                x: desktop ? '-27vw' : 0,
                y: desktop ? -60 : -42,
                scale: desktop ? 1 : 0.72,
                autoAlpha: desktop ? 1 : 0,
                duration: 0.72,
                ease: 'power2.inOut',
              },
              0.08,
            )
            .to(
              portraitPoseRef.current,
              {
                // Kept as a separate scroll layer so the saved Hero editor
                // position is never mutated by the About transition.
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.72,
                ease: 'power2.inOut',
              },
              0.08,
            )
            .to(
              aboutItems,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.28,
                stagger: 0.075,
                ease: 'power2.out',
              },
              0.34,
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
      className="sticky top-0 h-[200svh] min-h-[200svh] overflow-visible"
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
          className={`hero-scroll-out absolute top-[14%] md:top-[12%] w-full flex justify-center gap-[4vw] md:gap-[8vw] ${editMode ? 'z-[80]' : 'z-10'} pointer-events-none select-none px-4`}
        >
          <EditableElement id="heyTextLeft" style={{ pointerEvents: 'none' }}>
            <WordPullUp
              words="Hey,"
              className="font-heading italic leading-none block"
              style={{
                fontSize: getLayout('heyTextLeft')?.fontSize, fontWeight: getLayout('heyTextLeft')?.fontWeight,
                letterSpacing: getLayout('heyTextLeft')?.letterSpacing, lineHeight: getLayout('heyTextLeft')?.lineHeight,
                opacity: getLayout('heyTextLeft')?.opacity, color: getLayout('heyTextLeft')?.color,
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.4 } }
              }}
            />
          </EditableElement>
          <EditableElement id="heyTextRight" style={{ pointerEvents: 'none' }}>
            <WordPullUp
              words="there"
              className="font-heading italic leading-none block"
              style={{
                fontSize: getLayout('heyTextRight')?.fontSize, fontWeight: getLayout('heyTextRight')?.fontWeight,
                letterSpacing: getLayout('heyTextRight')?.letterSpacing, lineHeight: getLayout('heyTextRight')?.lineHeight,
                opacity: getLayout('heyTextRight')?.opacity, color: getLayout('heyTextRight')?.color,
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.6 } }
              }}
            />
          </EditableElement>
        </div>

        {/* One portrait layer is retained for the entire transition. */}
        <div
          ref={portraitRef}
          className={`hero-portrait absolute bottom-0 left-1/2 ${editMode ? 'z-[70]' : 'z-20'} h-[74svh] sm:h-[80svh] md:h-[95svh] lg:h-[105svh] will-change-transform`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 30 }}
            transition={{ duration: 1.2, ease, delay: 0.25 }}
            className="h-full"
          >
            <div ref={portraitPoseRef} className="h-full origin-bottom will-change-transform">
              <EditableElement id="characterImage" className="h-full">
                <img
                  src="/frank-profile.png"
                  alt="Frank Glen Martin"
                  className="hero-portrait-img object-contain origin-bottom"
                  draggable={false}
                  style={{
                    width: getLayout('characterImage')?.width,
                    height: getLayout('characterImage')?.height,
                    transform: `scale(${getLayout('characterImage')?.scale || 1})`,
                    opacity: getLayout('characterImage')?.opacity,
                    pointerEvents: 'none',
                  }}
                />
              </EditableElement>
            </div>
          </motion.div>
        </div>

        <div
          className={`hero-scroll-out hero-badge-wrap absolute left-[4%] md:left-[5%] lg:left-[8%] top-[47%] md:top-[50%] ${editMode ? 'z-[80]' : 'z-30'} hidden md:block`}
        >
          <EditableElement id="availableBadge">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm px-5 py-3 rounded-full border border-dark/5 shadow-sm origin-left"
              style={{ transform: `scale(${getLayout('availableBadge')?.scale || 1})`, opacity: getLayout('availableBadge')?.opacity }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange shrink-0" />
              <span className="font-body font-medium text-[13px] text-dark">Available for new opportunities</span>
            </motion.div>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out hero-specialization-wrap absolute right-[4%] md:right-[5%] lg:right-[8%] top-[46%] md:top-[48%] ${editMode ? 'z-[80]' : 'z-30'} max-w-[200px] text-right hidden md:block`}
        >
          <EditableElement id="specializationText">
            <WordPullUp
              words="Specialized in E-commerce, Product Listing, Store Management, and Virtual Assistance."
              className="font-body leading-relaxed"
              style={{
                fontSize: getLayout('specializationText')?.fontSize, fontWeight: getLayout('specializationText')?.fontWeight,
                letterSpacing: getLayout('specializationText')?.letterSpacing, lineHeight: getLayout('specializationText')?.lineHeight,
                opacity: getLayout('specializationText')?.opacity, color: getLayout('specializationText')?.color,
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
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out absolute bottom-[13%] md:bottom-[10%] left-[4%] md:left-[5%] lg:left-[8%] ${editMode ? 'z-[80]' : 'z-30'}`}
        >
          <EditableElement id="iAmFrankText">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-dark uppercase"
              style={{
                fontSize: getLayout('iAmFrankText')?.fontSize, fontWeight: getLayout('iAmFrankText')?.fontWeight,
                letterSpacing: getLayout('iAmFrankText')?.letterSpacing, lineHeight: getLayout('iAmFrankText')?.lineHeight,
                opacity: getLayout('iAmFrankText')?.opacity, color: getLayout('iAmFrankText')?.color,
              }}
            >
              I Am<br />Frank
            </motion.h1>
          </EditableElement>
        </div>

        <div
          className={`hero-scroll-out absolute bottom-[13%] md:bottom-[10%] right-[4%] md:right-[5%] lg:right-[8%] ${editMode ? 'z-[80]' : 'z-30'} text-right`}
        >
          <EditableElement id="roleTitleText">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-dark uppercase"
              style={{
                fontSize: getLayout('roleTitleText')?.fontSize, fontWeight: getLayout('roleTitleText')?.fontWeight,
                letterSpacing: getLayout('roleTitleText')?.letterSpacing, lineHeight: getLayout('roleTitleText')?.lineHeight,
                opacity: getLayout('roleTitleText')?.opacity, color: getLayout('roleTitleText')?.color,
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

          <EditableElement id="aboutTitle" label="About Title">
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

        <div
          className="absolute inset-x-0 bottom-0 h-[22svh] z-[25] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(240,241,243,0) 0%, rgba(240,241,243,0.18) 58%, rgba(240,241,243,0.68) 100%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[12svh] z-[26] pointer-events-none"
          style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            opacity: 0.45,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 72%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 72%)',
          }}
        />
      </div>
    </section>
  );
};
