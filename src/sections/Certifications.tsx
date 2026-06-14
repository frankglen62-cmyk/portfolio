import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const certifications = [
  { title: 'E-Commerce Management', image: '/certificates/cert_ecommerce.png' },
  { title: 'Shopify Expert Certification', image: '/certificates/cert_shopify.png' },
  { title: 'Amazon FBA Masterclass', image: '/certificates/cert_amazon.png' },
  { title: 'Social Media Marketing', image: '/certificates/cert_social.png' },
  { title: 'Product Research Specialist', image: '/certificates/cert_research.png' },
];

export const Certifications: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="certifications" ref={sectionRef} className="py-24 md:py-36 bg-cream relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16 md:mb-24">
          <span className="font-ui text-[10px] font-bold uppercase tracking-[0.3em] text-dark/60 mb-3 block">
            My Learning
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold text-dark tracking-wide uppercase">
            COURSE CERTIFICATES
          </h2>
          <div className="w-16 h-[2px] bg-dark/20 mt-4 mx-auto" />
        </ScrollReveal>

        {/* Certificates Grid */}
        <ScrollReveal
          staggerChildren={0.15}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto"
        >
          {certifications.map((cert) => (
            <motion.div
              key={cert.title}
              variants={{
                hidden: { opacity: 0, scale: 0.85, y: 40 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.9 } },
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white border border-dark/5 rounded-[2rem] p-5 hover:border-dark/10 hover:shadow-2xl transition-all duration-300 group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-[1.4] rounded-2xl overflow-hidden mb-5 bg-dark/5 shadow-inner">
                <img 
                  src={cert.image} 
                  alt={cert.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <h3 className="font-display font-bold text-[18px] text-dark mb-2 px-2 leading-tight">{cert.title}</h3>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
};

