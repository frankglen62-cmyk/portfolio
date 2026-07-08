import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VideoText } from './video-text';
import { ScrollReveal } from '../animations/ScrollReveal';

const cards = [
  {
    id: 1,
    title: 'Cosmic Exploration',
    description: 'Journey through the nebulae and discover celestial wonders beyond imagination.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    category: 'Astronomy',
  },
  {
    id: 2,
    title: 'Quantum Computing',
    description: 'Exploring the future of computation through quantum mechanical phenomena.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    category: 'Technology',
  },
  {
    id: 3,
    title: 'Neural Networks',
    description: 'The intersection of biology and technology in the field of artificial intelligence.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    category: 'AI',
  },
  {
    id: 4,
    title: 'Biometric Authentication',
    description: 'Securing digital identity through unique biological characteristics.',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    category: 'Security',
  },
  {
    id: 5,
    title: 'Quantum Entanglement',
    description: 'The mysterious connection between particles that transcends space and time.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    category: 'Physics',
  },
];

const particles = Array.from({ length: 20 }, (_, index) => {
  const seed = index + 1;
  return {
    width: `${(seed * 7) % 10 + 2}px`,
    height: `${(seed * 11) % 10 + 2}px`,
    top: `${(seed * 17) % 100}%`,
    left: `${(seed * 23) % 100}%`,
    animation: `float ${(seed * 3) % 10 + 20}s linear infinite`,
    animationDelay: `${(seed * 5) % 20}s`,
  };
});

export const InteractiveCardGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;

    const rect = galleryRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePosition({ x, y });
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const calculateCardStyles = (index: number) => {
    const diff = index - activeIndex;

    if (windowWidth < 768) {
      return {
        zIndex: cards.length - Math.abs(diff),
        transform: diff === 0
          ? 'translateY(0) scale(1)'
          : `translateY(${diff * 20}px) scale(${1 - Math.abs(diff) * 0.1})`,
        opacity: 1 - Math.abs(diff) * 0.2,
      };
    }

    return {
      zIndex: cards.length - Math.abs(diff),
      transform: diff === 0
        ? 'translateX(0) scale(1)'
        : `translateX(${diff * 60}%) scale(${1 - Math.abs(diff) * 0.2})`,
      opacity: 1 - Math.abs(diff) * 0.3,
      filter: diff === 0 ? 'blur(0px)' : 'blur(2px)',
    };
  };

  return (
    <div className="relative w-full min-h-[100vh] py-16 bg-black overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(50, 50, 150, 0.3), transparent 40%)`,
        }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white opacity-10"
            style={particle}
          />
        ))}
      </div>

      <div
        ref={galleryRef}
        className="relative w-full h-full flex flex-col items-center justify-center z-10 px-4 sm:px-6"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <ScrollReveal blur={false} className="w-full mb-12 md:mb-16 px-2 md:px-0 max-w-6xl mx-auto z-20">
          <div className="w-full h-[180px] md:h-[250px] relative overflow-hidden">
            <VideoText src="https://cdn.magicui.design/ocean-small.webm">
              My Project
            </VideoText>
          </div>
        </ScrollReveal>

        <div className="relative w-full max-w-[1400px] h-[550px] flex items-center justify-center mt-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="absolute w-[90vw] max-w-4xl rounded-2xl cursor-pointer transition-all duration-300 ease-out"
              style={{
                ...calculateCardStyles(index),
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
              }}
              whileHover={{
                scale: index === activeIndex ? 1.02 : 1,
                transition: { duration: 0.2 },
              }}
              onClick={() => handleCardClick(index)}
            >
              {index === activeIndex && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{
                    transform: isHovering ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)` : 'none',
                    transition: 'transform 0.2s ease-out',
                    background: 'linear-gradient(135deg, #ffffff10 0%, #ffffff01 100%)',
                  }}
                />
              )}

              <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                  transform: index === activeIndex && isHovering ? `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)` : 'none',
                  transition: 'transform 0.2s ease-out',
                }}
              >
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 mix-blend-overlay z-10`} />

                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white shadow-lg">
                      {card.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-20 flex flex-col">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">{card.title}</h3>
                    <p className="text-gray-200 text-sm sm:text-base max-w-2xl mb-6 drop-shadow-md">{card.description}</p>

                    {index === activeIndex && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex space-x-2">
                          {cards.map((_, dotIndex) => (
                            <div
                              key={dotIndex}
                              className={`w-2 h-2 rounded-full shadow-sm ${dotIndex === activeIndex ? 'bg-white' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                        <button
                          className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:bg-white/20 hover:scale-105"
                        >
                          Explore
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center space-x-8 z-20">
          <button
            onClick={prevCard}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group"
            aria-label="Previous project"
          >
            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex space-x-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === activeIndex
                    ? 'bg-white w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group"
            aria-label="Next project"
          >
            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-100px) translateX(100px);
          }
          100% {
            transform: translateY(-200px) translateX(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
