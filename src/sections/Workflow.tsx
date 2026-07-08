import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const workflowSteps = [
  {
    num: '01',
    title: 'Review Product Information',
    desc: 'I review the product details, supplier information, images, pricing, variations, SKUs, categories, and any client instructions before starting the task.',
  },
  {
    num: '02',
    title: 'Research Product & Competitors',
    desc: 'I research product details, competitor listings, keywords, pricing, customer demand, marketplace trends, and relevant product information to improve listing accuracy and visibility.',
  },
  {
    num: '03',
    title: 'Create or Improve Product Listing',
    desc: 'I write or update product titles, descriptions, bullet points, item specifics, tags, categories, product details, and platform-ready listing content.',
  },
  {
    num: '04',
    title: 'Optimize for SEO & Search Visibility',
    desc: 'I improve keywords, titles, descriptions, tags, item specifics, meta descriptions, and search-friendly content to help listings become easier to find.',
  },
  {
    num: '05',
    title: 'Prepare Product Images',
    desc: 'I select, organize, resize, crop, clean, or enhance product images using tools such as Canva, Photopea, or other basic editing tools to make listings look professional.',
  },
  {
    num: '06',
    title: 'Update Price, Inventory & Variants',
    desc: 'I update stock availability, pricing, sale pricing, product variants, item status, SKU details, and other store information to keep listings accurate.',
  },
  {
    num: '07',
    title: 'Check Accuracy & Quality',
    desc: 'I review product titles, descriptions, images, prices, SKUs, categories, tags, inventory, and shipping details to reduce mistakes before publishing or submitting for approval.',
  },
  {
    num: '08',
    title: 'Publish or Submit for Review',
    desc: 'I publish the listing when approved, or submit it to the client for review with notes, updates, and any missing information that needs confirmation.',
  },
];

export const Workflow: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="workflow" ref={sectionRef} className="py-12 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #d8dbdf 0%, #e2e4e8 50%, #ecedef 100%)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <ScrollReveal className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            How I Work
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold text-dark tracking-tight leading-none mb-6">
            My Ecommerce Workflow
          </h2>
          <p className="text-dark/80 max-w-3xl mx-auto text-lg md:text-xl font-body leading-relaxed mb-4">
            A clear and organized process for managing product listings, optimizing marketplace content, updating store data, and supporting daily ecommerce operations.
          </p>
          <p className="text-dark/60 max-w-2xl mx-auto text-base md:text-lg font-body leading-relaxed">
            I follow a structured ecommerce workflow to help online sellers save time, reduce errors, keep product information accurate, and maintain organized store operations across multiple platforms.
          </p>
        </ScrollReveal>

        {/* Workflow Grid */}
        <ScrollReveal staggerChildren={0.1} amount={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.num}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-dark/5 relative overflow-hidden group flex flex-col h-full"
            >
              {/* Background Number */}
              <div className="absolute -top-6 -right-4 font-serif-display font-bold text-[120px] leading-none text-dark/[0.03] pointer-events-none group-hover:text-dark/[0.05] group-hover:scale-110 transition-all duration-700">
                {step.num}
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex-grow flex flex-col">
                <div className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center font-ui text-sm font-bold text-dark/70 mb-6">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-dark mb-4 leading-snug">
                  {step.title}
                </h3>
                <p className="font-body text-dark/70 text-sm md:text-base leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </ScrollReveal>

        {/* Final Note & CTA */}
        <ScrollReveal className="text-center mt-20 md:mt-24">
          <p className="font-ui text-xs md:text-sm uppercase tracking-widest text-dark/50 mb-8 font-semibold">
            This workflow helps ensure that product listings are accurate, organized, search-friendly, and ready for customers.
          </p>
          <a
            href="#services"
            className="inline-flex items-center justify-center bg-dark text-white font-ui font-bold uppercase tracking-[0.15em] text-[11px] md:text-xs px-10 py-5 rounded-full hover:bg-yellow hover:text-dark transition-colors duration-300 shadow-xl"
          >
            View My Services
          </a>
        </ScrollReveal>

      </div>
    </section>
  );
};
