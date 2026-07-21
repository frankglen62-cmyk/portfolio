import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { ToolsFanCards, type ToolFanCategory } from '../components/ui/tools-fan-cards';

const toolCategories: ToolFanCategory[] = [
  {
    categoryName: 'Ecommerce and Store Platforms',
    purpose: 'Managing product listings, storefront content, inventory, orders, and daily marketplace operations.',
    accent: '#f59e0b',
    backgroundImage: 'skills/platforms.webp',
    backgroundPosition: '66% center',
    tools: [
      { name: 'Shopify', id: 'shopify.svg' },
      { name: 'WordPress', id: 'wordpress.svg' },
      { name: 'Mailchimp', id: 'mailchimp.svg' },
      { name: 'eBay Seller Hub', id: 'ebay.svg' },
      { name: 'Amazon Seller Central', id: 'amazon.png' },
      { name: 'Poshmark', id: 'poshmark.svg' },
      { name: 'Etsy', id: 'etsy.png' },
      { name: 'Walmart', id: 'walmart.png' },
      { name: 'AliExpress', id: 'aliexpress.png' },
    ]
  },
  {
    categoryName: 'Google Workspace and Productivity',
    purpose: 'Organizing email, schedules, files, product sheets, reports, and client documentation in one workflow.',
    accent: '#4285f4',
    backgroundImage: 'skills/data-management.webp',
    backgroundPosition: '68% center',
    tools: [
      { name: 'Google Workspace', id: 'google-workspace.svg' },
      { name: 'Gmail', id: 'gmail.svg' },
      { name: 'Google Calendar', id: 'google-calendar.svg' },
      { name: 'Google Drive', id: 'google-drive.svg' },
      { name: 'Google Sheets', id: 'google-sheets.svg' },
      { name: 'Google Docs', id: 'google-docs.svg' },
    ]
  },
  {
    categoryName: 'Microsoft and Office Tools',
    purpose: 'Creating reports and presentations while handling email, spreadsheets, shared files, and team collaboration.',
    accent: '#7c83fd',
    backgroundImage: 'ecommerce-skills-dashboard.png',
    backgroundPosition: 'center',
    tools: [
      { name: 'Microsoft 365', id: 'microsoft-365.svg' },
      { name: 'Outlook', id: 'outlook.svg' },
      { name: 'Word', id: 'ms-word.svg' },
      { name: 'Excel', id: 'ms-excel.svg' },
      { name: 'PowerPoint', id: 'ms-powerpoint.svg' },
      { name: 'OneNote', id: 'ms-onenote.svg' },
      { name: 'OneDrive', id: 'ms-onedrive.svg' },
      { name: 'Teams', id: 'ms-teams.svg' },
      { name: 'SharePoint', id: 'ms-sharepoint.svg' },
    ]
  },
  {
    categoryName: 'Project Management and Communication',
    purpose: 'Planning tasks, tracking deadlines, documenting processes, and keeping client and team communication clear.',
    accent: '#a78bfa',
    backgroundImage: 'skills/inventory-orders.webp',
    backgroundPosition: '70% center',
    tools: [
      { name: 'Trello', id: 'trello.svg' },
      { name: 'Slack', id: 'slack.svg' },
      { name: 'Zoom', id: 'zoom.svg' },
      { name: 'Asana', id: 'asana.svg' },
      { name: 'Notion', id: 'notion.svg' },
    ]
  },
  {
    categoryName: 'AI and Content Tools',
    purpose: 'Speeding up research, writing, ideation, image, video, voice, and content-production workflows.',
    accent: '#10b981',
    backgroundImage: 'skills/seo-optimization.webp',
    backgroundPosition: '72% center',
    tools: [
      { name: 'ChatGPT', id: 'chatgpt.svg' },
      { name: 'Gemini', id: 'gemini.svg' },
      { name: 'Claude', id: 'claude.svg' },
      { name: 'Microsoft Copilot', id: 'copilot.svg' },
      { name: 'Higgsfield', id: 'higgsfield.png' },
      { name: 'Perplexity', id: 'perplexity.png' },
      { name: 'Google Labs', id: 'google-labs.png' },
      { name: 'ElevenLabs', id: 'elevenlabs.png' },
      { name: 'Veo 3.1', id: 'veo-3.1.png' },
      { name: 'Open Art', id: 'openart.png' },
      { name: 'Kling AI', id: 'kling.png' },
      { name: 'Qwen', id: 'qwen.png' },
      { name: 'Veed', id: 'veed.png' },
      { name: 'Grok', id: 'grok.png' },
      { name: 'Runway', id: 'runway.png' },
    ]
  },
  {
    categoryName: 'Design, Video and Creative Tools',
    purpose: 'Producing polished listing images, marketing graphics, videos, presentations, and optimized creative assets.',
    accent: '#ff6b4a',
    backgroundImage: 'skills/product-listing.webp',
    backgroundPosition: '62% center',
    tools: [
      { name: 'Canva', id: 'canva.svg' },
      { name: 'CapCut', id: 'capcut.svg' },
      { name: 'Photoshop', id: 'photoshop.svg' },
      { name: 'After Effects', id: 'after-effects.png' },
      { name: 'Figma', id: 'figma.png' },
      { name: 'TinyPNG', id: 'tinypng.png' },
    ]
  },
  {
    categoryName: 'Product Research and Ads',
    purpose: 'Finding product opportunities, studying competitor ads, validating demand, and tracking creative trends.',
    accent: '#ec4899',
    backgroundImage: 'skills/product-research.webp',
    backgroundPosition: '64% center',
    tools: [
      { name: 'Meta Ads Library', id: 'meta-ads-library.svg' },
      { name: 'Minea', id: 'minea.png' },
      { name: 'PiPiADS', id: 'pipiads.svg' },
      { name: 'WinningHunter', id: 'winninghunter.png' },
      { name: 'GetHookd', id: 'gethookd.svg' },
    ]
  }
];

export const Tools: React.FC = () => {
  return (
    <section
      id="tools"
      className="relative h-[100svh] overflow-hidden md:h-auto md:min-h-0"
      style={{ background: '#000000' }}
    >
      <div className="flex h-[calc(100svh-64px)] w-full flex-col justify-center md:block md:h-auto">
      {/* Top Centered Header — dark theme with premium typography */}
      <ScrollReveal className="relative z-20 flex w-full flex-col items-center px-6 pb-0 pt-6 text-center pointer-events-none sm:px-6 sm:pb-2 sm:pt-24 lg:px-12">
        <span
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35 sm:mb-4 sm:text-[11px]"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          What I Use
        </span>
        <h2
          className="mb-3 text-[clamp(2.2rem,5vw,3.8rem)] font-bold uppercase leading-none tracking-tight text-white sm:mb-6"
          style={{ fontFamily: '"Oswald", sans-serif' }}
        >
          Tools I Use
        </h2>
        <div className="mx-auto mb-0 h-px w-10 bg-white/15 sm:mb-6" />
        <p
          className="mx-auto hidden max-w-xl text-[13px] leading-relaxed text-white/55 sm:block sm:text-base xl:text-lg"
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          A curated toolkit of platforms and software I rely on to build, manage, and grow ecommerce businesses.
        </p>
      </ScrollReveal>

      {/* Interactive fan of category cards */}
        <div className="relative z-10 w-full translate-y-[clamp(0px,calc(18svh-129.6px),20px)] md:translate-y-0">
        <ToolsFanCards categories={toolCategories} />
      </div>

      {/* Bottom padding */}
      <div className="h-0 sm:h-20" />
      </div>
    </section>
  );
};
