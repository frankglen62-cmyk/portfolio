import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const availableFor = [
    'Product listing and cross-listing support',
    'Ecommerce store management',
    'Product research and competitor checking',
    'SEO listing optimization',
    'Inventory and price updates',
    'Order processing and fulfillment support',
    'Product data entry and CSV management',
    'Customer support assistance',
    'AI-assisted ecommerce content and workflows'
  ];

  const workSetup = [
    'Part-time ecommerce support',
    'Full-time ecommerce VA support',
    'Project-based listing tasks',
    'Ongoing marketplace management',
    'Short-term product upload or cleanup projects'
  ];

  const socials = [
    { name: 'Facebook', url: 'https://www.facebook.com/itsmeyow11/' },
    { name: 'Instagram', url: 'https://www.instagram.com/fnkgln/?hl=en' },
    { name: 'LinkedIn', url: '#' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@itzyearl' },
    { name: 'YouTube', url: 'https://www.youtube.com/@TunogTriviaPH' }
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-12 md:py-20 overflow-hidden border-t border-dark/5" style={{ background: 'linear-gradient(180deg, #d8dbdf 0%, #e2e4e8 50%, #ecedef 100%)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          
          {/* Left Column: Text & Service Summary */}
          <ScrollReveal delay={0.1}>
            <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
              Contact Me
            </span>
            <h2 className="font-serif-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-dark tracking-tight leading-none mb-6">
              Let's Work Together
            </h2>
            <p className="text-dark/70 text-lg md:text-xl font-body leading-relaxed mb-6">
              Need help with product listings, marketplace management, product research, inventory updates, order support, or daily ecommerce store operations? Let’s discuss how I can support your online business.
            </p>
            <p className="text-dark/50 text-base font-body leading-relaxed mb-10">
              I help online sellers save time, stay organized, and keep ecommerce stores updated across platforms like eBay, Shopify, Amazon, Poshmark, and other marketplaces. Send me a message and let me know what kind of ecommerce support you need.
            </p>

            <div className="flex flex-col md:flex-row gap-10 mb-12">
              <div className="flex-1">
                <h4 className="font-display font-bold text-lg text-dark mb-4 border-b border-dark/10 pb-2">Available For</h4>
                <ul className="space-y-3">
                  {availableFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow flex-shrink-0" />
                      <span className="font-body text-dark/70 text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1">
                <h4 className="font-display font-bold text-lg text-dark mb-4 border-b border-dark/10 pb-2">Work Setup</h4>
                <ul className="space-y-3">
                  {workSetup.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow flex-shrink-0" />
                      <span className="font-body text-dark/70 text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Socials */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex flex-wrap gap-3">
                {socials.map((s) => (
                  <motion.a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="w-10 h-10 bg-dark/5 text-dark border border-dark/10 rounded-full flex items-center justify-center font-ui text-[10px] font-bold uppercase tracking-wider hover:bg-dark hover:text-white hover:border-dark transition-all duration-300"
                    title={s.name}
                  >
                    {s.name[0]}
                  </motion.a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Contact Form */}
          <ScrollReveal delay={0.2} className="bg-white/50 backdrop-blur-sm border border-dark/8 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-dark/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-dark/10 transition-colors duration-700" />
            
            <form className="flex flex-col gap-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Name</label>
                  <input type="text" id="name" placeholder="John Doe" className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark font-body text-sm focus:outline-none focus:border-dark/30 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Email</label>
                  <input type="email" id="email" placeholder="john@example.com" className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark font-body text-sm focus:outline-none focus:border-dark/30 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="business" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Business / Store Name</label>
                <input type="text" id="business" placeholder="Your Store LLC" className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark font-body text-sm focus:outline-none focus:border-dark/30 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="platform" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Platform Used</label>
                  <select id="platform" defaultValue="" className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark/80 font-body text-sm focus:outline-none focus:border-dark/30 transition-colors appearance-none cursor-pointer">
                    <option value="" disabled>Select Platform</option>
                    <option value="eBay">eBay</option>
                    <option value="Shopify">Shopify</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Poshmark">Poshmark</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="service" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Service Needed</label>
                  <input type="text" id="service" placeholder="e.g. Product Listing..." className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark font-body text-sm focus:outline-none focus:border-dark/30 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-ui text-[10px] font-bold uppercase tracking-wider text-dark/50 pl-1">Message</label>
                <textarea id="message" rows={4} placeholder="How can I help your ecommerce business?" className="w-full bg-white/60 border border-dark/10 rounded-xl px-5 py-3.5 text-dark font-body text-sm focus:outline-none focus:border-dark/30 transition-colors resize-none"></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="flex-1 bg-dark text-white font-ui font-bold text-[11px] uppercase tracking-[0.15em] rounded-xl py-4 shadow-xl hover:bg-dark/80 transition-colors duration-300"
                >
                  Send Message
                </motion.button>
                <a
                  href="#services"
                  className="flex-1 inline-flex items-center justify-center bg-dark/5 text-dark font-ui font-bold text-[11px] uppercase tracking-[0.15em] rounded-xl py-4 border border-dark/10 hover:bg-dark/10 transition-colors duration-300 text-center"
                >
                  View My Services
                </a>
              </div>
              
              <p className="font-body text-[11px] text-dark/40 text-center mt-4 leading-relaxed">
                For ecommerce support inquiries, please include the platform you use and the type of help you need so I can better understand your store requirements.
              </p>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

