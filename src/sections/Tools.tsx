import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

import { CustomIcon } from '../components/CustomIcon';

const tools = [
  { name: 'Google Workspace', id: 'google-workspace.svg' },
  { name: 'Gmail', id: 'gmail.svg' },
  { name: 'Google Calendar', id: 'google-calendar.svg' },
  { name: 'Google Drive', id: 'google-drive.svg' },
  { name: 'Google Sheets', id: 'google-sheets.svg' },
  { name: 'Google Docs', id: 'google-docs.svg' },
  { name: 'Canva', id: 'canva.svg' },
  { name: 'Trello', id: 'trello.svg' },
  { name: 'Slack', id: 'slack.svg' },
  { name: 'Zoom', id: 'zoom.svg' },
  { name: 'Asana', id: 'asana.svg' },
  { name: 'Notion', id: 'notion.svg' },
  { name: 'Microsoft Office', id: 'microsoft-office.svg' },
  { name: 'WordPress', id: 'wordpress.svg' },
  { name: 'Shopify', id: 'shopify.svg' },
  { name: 'MailChimp', id: 'mailchimp.svg' },
  { name: 'ChatGPT', id: 'chatgpt.svg' },
  { name: 'Gemini', id: 'gemini.svg' },
  { name: 'Claude', id: 'claude.svg' },
  { name: 'Capcut', id: 'capcut.svg' },
  { name: 'Meta Business Suite', id: 'meta-business-suite.svg' },
  { name: 'Ads Library', id: 'meta-ads-library.svg' },
  { name: 'MINEA', id: 'minea.png' },
  { name: 'Pipiads', id: 'pipiads.svg' },
  { name: 'Winning Hunter', id: 'winninghunter.png' },
  { name: 'Gethookd', id: 'gethookd.svg' },
];

export const Tools: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="tools" ref={sectionRef} className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/50 mb-4 block">
            What I Use
          </span>
          <h2 className="font-serif-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold text-dark tracking-wide uppercase">
            Tools I Use
          </h2>
          <div className="w-12 h-[2px] bg-yellow mt-5 mx-auto" />
        </ScrollReveal>

        {/* Tools Grid — Staggered ScrollReveal */}
        <ScrollReveal
          staggerChildren={0.03}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.name}
              variants={{
                hidden: { opacity: 0, scale: 0.5, y: 30 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.5, duration: 0.8 } },
              }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="flex flex-col items-center gap-3 group cursor-default"
            >
              <div className="w-full max-w-[110px] h-14 md:h-[64px] flex items-center justify-center transition-all duration-300">
                <CustomIcon 
                  src={`/icons/tools/${tool.id}`} 
                  alt={tool.name} 
                  className={`w-full h-full object-contain transition-transform duration-300 ${
                    ['Winning Hunter', 'Gethookd'].includes(tool.name) 
                      ? 'scale-125 group-hover:scale-150' 
                      : 'group-hover:scale-125'
                  }`} 
                />
              </div>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-wider text-dark/60 text-center leading-tight transition-colors group-hover:text-dark">
                {tool.name}
              </span>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
};
