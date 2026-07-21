import React, { useRef } from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { HoverExpand } from '../components/ui/hover-expand';
import { WordPullUp } from '../components/animations/WordPullUp';

const accordionSkills = [
  {
    label: 'Marketplace & Store Operations',
    sublabel: 'PLATFORMS',
    image: `${import.meta.env.BASE_URL}skills/platforms.webp`,
    imageAlt: 'Ecommerce operations workspace with store dashboards and parcels',
    description: 'Day-to-day storefront support that keeps listings, orders, and channel activity organized.',
    detailTags: ['Shopify Admin', 'eBay Seller Hub', 'Amazon Seller Central', 'Walmart Marketplace']
  },
  {
    label: 'Conversion-Ready Listings',
    sublabel: 'LISTING',
    image: `${import.meta.env.BASE_URL}skills/product-listing.webp`,
    imageAlt: 'Product photography and listing production workspace',
    description: 'Complete, customer-friendly product pages with polished copy, imagery, and accurate attributes.',
    detailTags: ['Titles & Bullets', 'Descriptions', 'Item Specifics', 'Variations', 'SKU Structure']
  },
  {
    label: 'Marketplace SEO',
    sublabel: 'VISIBILITY',
    image: `${import.meta.env.BASE_URL}skills/seo-optimization.webp`,
    imageAlt: 'Marketplace SEO analytics and optimized product page',
    description: 'Intent-led optimization that improves relevance, discoverability, and listing clarity.',
    detailTags: ['Keyword Research', 'SEO Titles', 'Search Copy', 'Meta Data', 'Listing Audits']
  },
  {
    label: 'Product & Competitor Research',
    sublabel: 'RESEARCH',
    image: `${import.meta.env.BASE_URL}skills/product-research.webp`,
    imageAlt: 'Product samples beside a competitor research dashboard',
    description: 'Structured market research for smarter product selection, positioning, and pricing decisions.',
    detailTags: ['Demand Signals', 'Competitor Analysis', 'Pricing', 'Supplier Checks', 'Trend Review']
  },
  {
    label: 'Inventory & Order Support',
    sublabel: 'OPERATIONS',
    image: `${import.meta.env.BASE_URL}skills/inventory-orders.webp`,
    imageAlt: 'Inventory station with parcels, scanner, and order dashboard',
    description: 'Accurate stock and fulfillment support from order intake through tracking and returns.',
    detailTags: ['Stock Monitoring', 'Order Processing', 'Tracking Updates', 'Fulfillment', 'Returns']
  },
  {
    label: 'Ecommerce Data Systems',
    sublabel: 'DATA',
    image: `${import.meta.env.BASE_URL}skills/data-management.webp`,
    imageAlt: 'Ecommerce spreadsheet and reporting data workspace',
    description: 'Clean spreadsheet and catalog workflows that make store data dependable and easy to maintain.',
    detailTags: ['Excel', 'Google Sheets', 'CSV Import & Export', 'Bulk Updates', 'Reporting']
  }
];

export const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={sectionRef} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#d8dbdf] py-6 text-[#1a1a1a] shadow-[0_-32px_0_#d8dbdf] sm:py-10 md:block md:min-h-0 md:py-28 md:shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <ScrollReveal className="mb-3 text-center sm:mb-5 md:mb-8">
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

        <ScrollReveal className="mt-3 w-full md:mt-6">
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
