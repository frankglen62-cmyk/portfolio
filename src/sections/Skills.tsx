import React, { useRef } from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { HoverExpand } from '../components/ui/hover-expand';
import { WordPullUp } from '../components/animations/WordPullUp';

const accordionSkills = [
  {
    label: 'Ecommerce Platforms',
    sublabel: 'PLATFORMS',
    image: `${import.meta.env.BASE_URL}skills/platforms.png`,
    imageAlt: 'Ecommerce operations workspace with store dashboards and parcels',
    description: 'Marketplace and store admin systems used for daily ecommerce operations',
    detailTags: ['eBay Seller Hub', 'Shopify Admin', 'Amazon Seller Central', 'Walmart Marketplace', 'Etsy Shop Manager', 'Poshmark']
  },
  {
    label: 'Product Listing',
    sublabel: 'LISTING',
    image: `${import.meta.env.BASE_URL}skills/product-listing.png`,
    imageAlt: 'Product photography and listing production workspace',
    description: 'Clean, searchable product pages with complete item details and organized SKUs',
    detailTags: ['Product Titles', 'Descriptions', 'Bullet Points', 'Categories', 'Item Specifics', 'Variations', 'SKU Organization']
  },
  {
    label: 'SEO & Optimization',
    sublabel: 'SEARCH',
    image: `${import.meta.env.BASE_URL}skills/seo-optimization.png`,
    imageAlt: 'Marketplace SEO analytics and optimized product page',
    description: 'Keyword-led listing improvements for stronger marketplace search visibility',
    detailTags: ['Keyword Research', 'SEO Titles', 'Search Descriptions', 'eBay Item Specifics', 'Amazon Bullets', 'Shopify Meta Tags']
  },
  {
    label: 'Product Research',
    sublabel: 'RESEARCH',
    image: `${import.meta.env.BASE_URL}skills/product-research.png`,
    imageAlt: 'Product samples beside a competitor research dashboard',
    description: 'Demand, competitor, pricing, and supplier research for smarter listing decisions',
    detailTags: ['Demand Research', 'Competitor Analysis', 'Pricing Research', 'Supplier Research', 'Trend Checking', 'Profitable Products']
  },
  {
    label: 'Inventory & Orders',
    sublabel: 'MANAGEMENT',
    image: `${import.meta.env.BASE_URL}skills/inventory-orders.png`,
    imageAlt: 'Inventory station with parcels, scanner, and order dashboard',
    description: 'Reliable stock, order, fulfillment, tracking, and returns support',
    detailTags: ['Inventory Monitoring', 'Stock Updates', 'Price Adjustments', 'Order Processing', 'Tracking Updates', 'Returns']
  },
  {
    label: 'Data Management',
    sublabel: 'DATA',
    image: `${import.meta.env.BASE_URL}skills/data-management.png`,
    imageAlt: 'Ecommerce spreadsheet and reporting data workspace',
    description: 'Spreadsheet, CSV, and reporting workflows that keep store data tidy',
    detailTags: ['Microsoft Excel', 'Google Sheets', 'CSV Imports', 'CSV Exports', 'Bulk Updates', 'Reports']
  }
];

export const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={sectionRef} className="relative flex min-h-[calc(100*var(--vh))] flex-col justify-center overflow-hidden bg-[#080808] py-6 font-heading text-white sm:py-10 md:block md:min-h-0 md:py-28">
      
      {/* Gradient transition from previous section (black to #080808) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-[#080808] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <ScrollReveal className="mb-3 text-center sm:mb-5 md:mb-8">
          <span className="font-heading text-[13px] font-medium text-white/45 mb-3 block">
            E-Commerce Expertise
          </span>
          <WordPullUp
            words="My Skills"
            className="font-heading text-[clamp(2.8rem,calc(6*var(--vw)),5rem)] font-semibold leading-none text-white tracking-[-0.025em]"
            wrapperFramerProps={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
            }}
          />
          <div className="w-12 h-[2px] bg-yellow mt-4 mx-auto" />
        </ScrollReveal>

        <ScrollReveal className="mt-3 w-full md:mt-6">
          <HoverExpand 
            items={accordionSkills} 
            collapsedHeight={74} 
            expandedHeight={320} 
            className="w-full font-heading text-white"
          />
        </ScrollReveal>
        
      </div>
    </section>
  );
};
