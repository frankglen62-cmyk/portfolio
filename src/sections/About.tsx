import React, { useRef, useState, useCallback, useMemo, useContext, createContext, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { EditableElement } from '../components/editor/EditableElement';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { WordPullUp } from '../components/animations/WordPullUp';

// --- Hover Context & Components ---

interface HoverRect {
  top: number;
  height: number;
  left: number;
  width: number;
}

const HoverContext = createContext<{
  hovered: string | null;
  hoverRect: HoverRect | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setHovered: (id: string | null, rect?: HoverRect | null) => void;
}>({
  hovered: null,
  hoverRect: null,
  containerRef: { current: null },
  setHovered: () => {},
});

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const MotionChevronWrapper = ({ isOpen }: { isOpen: boolean }) => (
  <motion.div
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className="shrink-0 text-yellow/70 mr-3"
  >
    <ChevronIcon />
  </motion.div>
);

function HelpItem({ item, index }: { item: any, index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const { setHovered, containerRef, hovered } = useContext(HoverContext);
  const itemRef = useRef<HTMLDivElement>(null);

  const isHovered = hovered === id;

  const handleMouseEnter = useCallback(() => {
    const el = itemRef.current;
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setHovered(id, {
        top: elRect.top - containerRect.top,
        height: elRect.height,
        left: 0,
        width: elRect.width,
      });
    } else {
      setHovered(id);
    }
  }, [id, setHovered, containerRef]);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, [setHovered]);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + (index * 0.05), duration: 0.5 }}
      className="relative z-10 rounded-xl"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full text-left relative z-10 flex items-center py-3 px-3 cursor-pointer group outline-none"
      >
        <MotionChevronWrapper isOpen={isOpen} />
        
        <motion.span
          animate={{ x: isHovered ? 6 : 0, color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.8)' }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="font-body text-sm md:text-[15px] leading-relaxed relative z-10"
        >
          {item.title}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            style={{ overflow: "hidden" }}
          >
            <div className="pl-10 pr-4 pb-3">
              <p className="text-white/60 text-sm font-body leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HelpList({ items }: { items: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHoveredId] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null);

  const setHovered = useCallback((id: string | null, rect?: HoverRect | null) => {
    setHoveredId(id);
    setHoverRect(rect ?? null);
  }, []);

  const value = useMemo(() => ({ hovered, hoverRect, containerRef, setHovered }), [hovered, hoverRect, containerRef, setHovered]);

  return (
    <HoverContext.Provider value={value}>
      <div ref={containerRef} className="relative space-y-1">
        <AnimatePresence>
          {hovered && hoverRect && (
            <motion.div
              key="hover-bg"
              className="pointer-events-none absolute z-0 rounded-xl bg-white/10"
              initial={{ opacity: 0, top: hoverRect.top, height: hoverRect.height, left: hoverRect.left, width: hoverRect.width }}
              animate={{
                top: hoverRect.top,
                height: hoverRect.height,
                left: hoverRect.left,
                width: hoverRect.width,
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </AnimatePresence>
        
        {items.map((item, i) => (
          <HelpItem key={i} item={item} index={i} />
        ))}
      </div>
    </HoverContext.Provider>
  );
}

// --- Main About Component ---

export const About: React.FC = () => {
  const { layout } = useVisualEditor();
  const sectionRef = useRef<HTMLElement>(null);

  const helpList = [
    {
      title: 'Product listing and cross-listing',
      description: 'Accurately list and sync your products across multiple platforms like eBay, Shopify, and Amazon to maximize visibility.'
    },
    {
      title: 'SEO-friendly product titles and descriptions',
      description: 'Optimize your product listings with relevant keywords to rank higher in search results and attract more buyers.'
    },
    {
      title: 'Product research and competitor checking',
      description: 'Analyze market trends, pricing strategies, and competitor performance to give your products an edge.'
    },
    {
      title: 'Inventory and price updates',
      description: 'Keep your stock levels accurate and adjust pricing dynamically to maintain competitiveness and profitability.'
    },
    {
      title: 'Order and fulfillment support',
      description: 'Ensure smooth processing and tracking of customer orders for timely deliveries and high satisfaction.'
    },
    {
      title: 'Product data and spreadsheet organization',
      description: 'Maintain clean, structured, and easily accessible product databases to streamline your ecommerce operations.'
    },
    {
      title: 'Product image selection and basic editing',
      description: 'Enhance visual appeal by selecting the best product photos and performing necessary touch-ups.'
    },
    {
      title: 'AI-assisted ecommerce content and workflow support',
      description: 'Leverage AI tools to generate compelling copy and automate repetitive tasks, saving you valuable time.'
    }
  ];

  return (
    <section id="about" ref={sectionRef} className="py-16 md:py-24 bg-dark overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="mb-16 md:mb-20">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow mb-4 block">
            WHO I AM
          </span>
          <EditableElement id="aboutTitle" label="About Title">
            <WordPullUp
              words="About Me"
              className="font-serif-display font-bold tracking-tight leading-none mb-6"
              style={{
                fontSize: layout.aboutTitle?.fontSize || 'clamp(2.5rem,5vw,4.5rem)',
                color: layout.aboutTitle?.color || '#ffffff',
              }}
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
              }}
            />
          </EditableElement>
          <div className="w-12 h-[2px] bg-yellow mt-5" />
        </ScrollReveal>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left — Text */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 mb-10 group/text">
              <motion.p 
                className="text-base md:text-lg text-white/80 leading-relaxed font-body transition-colors group-hover/text:text-white"
              >
                I’m <span className="font-bold text-white">Frank Glen Martin</span>, a detail-oriented Ecommerce Virtual Assistant dedicated to streamlining online store operations. I help sellers save time by managing product listings, optimizing SEO content, updating inventory, and conducting competitor research across platforms like eBay, Shopify, and Amazon. My goal is to ensure your product pages are accurate, organized, and ready to convert customers.
              </motion.p>
            </div>

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-yellow text-dark font-ui font-bold text-[11px] uppercase tracking-wider rounded-full px-8 py-4 cursor-pointer hover:bg-white transition-all duration-300 shadow-xl hover:shadow-yellow/20"
            >
              Let's Connect
            </motion.a>
          </ScrollReveal>

          {/* Right — What I Can Help With List */}
          <ScrollReveal delay={0.2} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-yellow/10 transition-colors duration-700" />

            <h3 className="font-serif-display font-bold text-2xl md:text-3xl text-white mb-6 relative z-10 px-3">
              What I Can Help With
            </h3>

            <HelpList items={helpList} />
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
};
