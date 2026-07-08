import React, { useRef } from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { HoverExpand } from '../components/ui/hover-expand';
import { WordPullUp } from '../components/animations/WordPullUp';

const accordionSkills = [
  {
    label: 'Ecommerce Platforms',
    sublabel: 'PLATFORMS',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Ecommerce dashboard collage with marketplace platform cards',
    description: 'Marketplace and store admin systems used for daily ecommerce operations',
    detailTags: ['eBay Seller Hub', 'Shopify Admin', 'Amazon Seller Central', 'Walmart Marketplace', 'Etsy Shop Manager', 'Poshmark']
  },
  {
    label: 'Product Listing',
    sublabel: 'LISTING',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Product listing dashboard with ecommerce product table',
    description: 'Clean, searchable product pages with complete item details and organized SKUs',
    detailTags: ['Product Titles', 'Descriptions', 'Bullet Points', 'Categories', 'Item Specifics', 'Variations', 'SKU Organization']
  },
  {
    label: 'SEO & Optimization',
    sublabel: 'SEARCH',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Ecommerce SEO analytics and marketplace optimization dashboard',
    description: 'Keyword-led listing improvements for stronger marketplace search visibility',
    detailTags: ['Keyword Research', 'SEO Titles', 'Search Descriptions', 'eBay Item Specifics', 'Amazon Bullets', 'Shopify Meta Tags']
  },
  {
    label: 'Product Research',
    sublabel: 'RESEARCH',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Ecommerce research dashboard with charts and product insights',
    description: 'Demand, competitor, pricing, and supplier research for smarter listing decisions',
    detailTags: ['Demand Research', 'Competitor Analysis', 'Pricing Research', 'Supplier Research', 'Trend Checking', 'Profitable Products']
  },
  {
    label: 'Inventory & Orders',
    sublabel: 'MANAGEMENT',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Inventory and order management dashboard for ecommerce stores',
    description: 'Reliable stock, order, fulfillment, tracking, and returns support',
    detailTags: ['Inventory Monitoring', 'Stock Updates', 'Price Adjustments', 'Order Processing', 'Tracking Updates', 'Returns']
  },
  {
    label: 'Data Management',
    sublabel: 'DATA',
    image: '/ecommerce-skills-dashboard.png',
    imageAlt: 'Ecommerce data management dashboard with CSV and spreadsheet widgets',
    description: 'Spreadsheet, CSV, and reporting workflows that keep store data tidy',
    detailTags: ['Microsoft Excel', 'Google Sheets', 'CSV Imports', 'CSV Exports', 'Bulk Updates', 'Reports']
  }
];

export const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden" style={{ backgroundColor: '#f9f9f9', color: '#1a1a1a' }}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <ScrollReveal className="mb-8 text-center">
          <span className="font-body text-[13px] font-medium text-dark/45 mb-3 block">
            E-Commerce Expertise
          </span>
          <WordPullUp
            words="My Skills"
            className="font-body text-[clamp(2.8rem,6vw,5rem)] font-medium leading-none text-dark tracking-normal"
            wrapperFramerProps={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
            }}
          />
          <div className="w-12 h-[2px] bg-yellow mt-4 mx-auto" />
        </ScrollReveal>

        <ScrollReveal className="w-full mt-6">
          <HoverExpand 
            items={accordionSkills} 
            collapsedHeight={74} 
            expandedHeight={320} 
            className="w-full text-[#1a1a1a]"
          />
        </ScrollReveal>
        
      </div>
    </section>
  );
};
