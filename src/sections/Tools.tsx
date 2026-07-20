import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { ToolsCarousel3D } from '../components/ui/tools-carousel-3d';

const toolCategories = [
  {
    categoryName: 'Ecommerce & Store Platforms',
    tools: [
      { name: 'Shopify', id: 'shopify.svg' },
      { name: 'WordPress', id: 'wordpress.png' },
      { name: 'Mailchimp', id: 'mailchimp.svg' },
      { name: 'eBay Seller Hub', id: 'ebay.png' },
      { name: 'Amazon Seller Central', id: 'amazon.png' },
      { name: 'Poshmark', id: 'poshmark.png' },
      { name: 'Etsy', id: 'etsy.png' },
      { name: 'Walmart', id: 'walmart.png' },
      { name: 'AliExpress', id: 'aliexpress.png' },
    ]
  },
  {
    categoryName: 'Google Workspace & Productivity',
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
    categoryName: 'Microsoft & Office Tools',
    tools: [
      { name: 'Microsoft 365', id: 'microsoft-365.png' },
      { name: 'Outlook', id: 'outlook.png' },
      { name: 'Word', id: 'word.png' },
      { name: 'Excel', id: 'excel.png' },
      { name: 'PowerPoint', id: 'powerpoint.png' },
      { name: 'OneNote', id: 'onenote.png' },
      { name: 'OneDrive', id: 'onedrive.png' },
      { name: 'Teams', id: 'teams.png' },
      { name: 'SharePoint', id: 'sharepoint.png' },
    ]
  },
  {
    categoryName: 'Project Management & Communication',
    tools: [
      { name: 'Trello', id: 'trello.svg' },
      { name: 'Slack', id: 'slack.svg' },
      { name: 'Zoom', id: 'zoom.svg' },
      { name: 'Asana', id: 'asana.svg' },
      { name: 'Notion', id: 'notion.svg' },
    ]
  },
  {
    categoryName: 'AI & Content Tools',
    tools: [
      { name: 'ChatGPT', id: 'chatgpt.svg' },
      { name: 'Gemini', id: 'gemini.svg' },
      { name: 'Claude', id: 'claude.svg' },
      { name: 'Microsoft Copilot', id: 'copilot.png' },
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
    categoryName: 'Design, Video & Creative Tools',
    tools: [
      { name: 'Canva', id: 'canva.svg' },
      { name: 'CapCut', id: 'capcut.svg' },
      { name: 'Photoshop', id: 'photoshop.png' },
      { name: 'After Effects', id: 'after-effects.png' },
      { name: 'Figma', id: 'figma.png' },
      { name: 'TinyPNG', id: 'tinypng.png' },
    ]
  },
  {
    categoryName: 'Product Research & Ads',
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
      className="relative min-h-[100svh] overflow-hidden md:min-h-0"
      style={{ background: '#000000' }}
    >
      {/* Top Centered Header — dark theme with premium typography */}
      <ScrollReveal className="relative z-20 w-full pt-20 sm:pt-24 pb-2 px-6 lg:px-12 flex flex-col items-center text-center pointer-events-none">
        <span
          className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35 mb-4 block"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          What I Use
        </span>
        <h2
          className="text-[clamp(2.2rem,5vw,3.8rem)] font-bold text-white tracking-tight uppercase leading-none mb-6"
          style={{ fontFamily: '"Oswald", sans-serif' }}
        >
          Tools I Use
        </h2>
        <div className="w-10 h-[1px] bg-white/15 mb-6 mx-auto" />
        <p
          className="text-white/40 text-sm sm:text-base xl:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          A curated toolkit of platforms and software I rely on to build, manage, and grow ecommerce businesses.
        </p>
      </ScrollReveal>

      {/* 3D Card Carousel */}
      <div className="relative z-10 w-full">
        <ToolsCarousel3D categories={toolCategories} />
      </div>

      {/* Bottom padding */}
      <div className="h-16 sm:h-20" />
    </section>
  );
};
