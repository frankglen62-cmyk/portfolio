import React from 'react';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { ToolsFanCards, type ToolFanCategory } from '../components/ui/tools-fan-cards';

const toolCategories: ToolFanCategory[] = [
  {
    categoryName: 'Ecommerce Platforms',
    shortName: 'Ecommerce',
    purpose: 'Storefront, listing, inventory, and marketplace tools for daily ecommerce operations.',
    backgroundPosition: '6% center',
    tools: [
      { name: 'Shopify', id: 'shopify.svg' },
      { name: 'Amazon', id: 'amazon.png' },
      { name: 'eBay', id: 'ebay.svg' },
      { name: 'Etsy', id: 'etsy.webp' },
      { name: 'Walmart', id: 'walmart.png' },
      { name: 'WordPress', id: 'wordpress.svg' },
      { name: 'Mailchimp', id: 'mailchimp.svg' },
      { name: 'Poshmark', id: 'poshmark.svg' },
      { name: 'AliExpress', id: 'aliexpress.png' },
    ],
  },
  {
    categoryName: 'Google Workspace',
    shortName: 'Google',
    purpose: 'Connected email, schedules, files, product sheets, and documentation in one workflow.',
    backgroundPosition: '19% center',
    tools: [
      { name: 'Google Workspace', id: 'google-workspace.svg' },
      { name: 'Gmail', id: 'gmail.svg' },
      { name: 'Calendar', id: 'google-calendar.svg' },
      { name: 'Drive', id: 'google-drive.svg' },
      { name: 'Sheets', id: 'google-sheets.svg' },
      { name: 'Docs', id: 'google-docs.svg' },
    ],
  },
  {
    categoryName: 'Microsoft Office',
    shortName: 'Microsoft',
    purpose: 'Professional spreadsheets, reports, presentations, email, and shared file workflows.',
    backgroundPosition: '32% center',
    tools: [
      { name: 'Microsoft 365', id: 'microsoft-365.svg' },
      { name: 'Outlook', id: 'outlook.svg' },
      { name: 'Word', id: 'ms-word.svg' },
      { name: 'Excel', id: 'ms-excel.svg' },
      { name: 'PowerPoint', id: 'ms-powerpoint.svg' },
      { name: 'OneNote', id: 'ms-onenote.svg' },
      { name: 'OneDrive', id: 'ms-onedrive.svg' },
    ],
  },
  {
    categoryName: 'Project Management',
    shortName: 'Projects',
    purpose: 'Clear task planning, organized documentation, deadlines, and dependable project tracking.',
    backgroundPosition: '44% center',
    tools: [
      { name: 'Trello', id: 'trello.svg' },
      { name: 'Asana', id: 'asana.svg' },
      { name: 'Notion', id: 'notion.svg' },
    ],
  },
  {
    categoryName: 'Communication',
    shortName: 'Connect',
    purpose: 'Fast client updates, meetings, shared conversations, and remote team collaboration.',
    backgroundPosition: '57% center',
    tools: [
      { name: 'Slack', id: 'slack.svg' },
      { name: 'Zoom', id: 'zoom.svg' },
      { name: 'Teams', id: 'ms-teams.svg' },
      { name: 'SharePoint', id: 'ms-sharepoint.svg' },
    ],
  },
  {
    categoryName: 'AI & Content',
    shortName: 'AI Content',
    purpose: 'Research, writing, ideation, voice, and faster content-production workflows.',
    backgroundPosition: '69% center',
    tools: [
      { name: 'ChatGPT', id: 'chatgpt.svg' },
      { name: 'Gemini', id: 'gemini.svg' },
      { name: 'Claude', id: 'claude.svg' },
      { name: 'Copilot', id: 'copilot.svg' },
      { name: 'Perplexity', id: 'perplexity.webp' },
      { name: 'ElevenLabs', id: 'elevenlabs.webp' },
      { name: 'Higgsfield', id: 'higgsfield.webp' },
      { name: 'Google Labs', id: 'google-labs.webp' },
      { name: 'Veo 3.1', id: 'veo-3.1.webp' },
      { name: 'OpenArt', id: 'openart.webp' },
      { name: 'Kling AI', id: 'kling.webp' },
      { name: 'Qwen', id: 'qwen.png' },
      { name: 'Veed', id: 'veed.webp' },
      { name: 'Grok', id: 'grok.png' },
      { name: 'Runway', id: 'runway.webp' },
    ],
  },
  {
    categoryName: 'Design & Video',
    shortName: 'Creative',
    purpose: 'Polished listing images, marketing graphics, video edits, and optimized creative assets.',
    backgroundPosition: '82% center',
    tools: [
      { name: 'Canva', id: 'canva.svg' },
      { name: 'CapCut', id: 'capcut.svg' },
      { name: 'Photoshop', id: 'photoshop.svg' },
      { name: 'After Effects', id: 'after-effects.webp' },
      { name: 'Figma', id: 'figma.webp' },
      { name: 'TinyPNG', id: 'tinypng.webp' },
    ],
  },
  {
    categoryName: 'Product Research & Ads',
    shortName: 'Research',
    purpose: 'Product opportunities, competitor ads, demand validation, and creative trend research.',
    backgroundPosition: '95% center',
    tools: [
      { name: 'Meta Ads Library', id: 'meta-ads-library.svg' },
      { name: 'Minea', id: 'minea.png' },
      { name: 'PiPiADS', id: 'pipiads.svg' },
      { name: 'WinningHunter', id: 'winninghunter.png' },
      { name: 'GetHookd', id: 'gethookd.svg' },
    ],
  },
];

export const Tools: React.FC = () => (
  <section
    id="tools"
    className="relative flex min-h-[760px] items-center overflow-hidden bg-[#080808] py-20 sm:min-h-[820px] sm:py-24"
  >
    {/* Gradient transition from previous section (black to #080808) */}
    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black to-[#080808] pointer-events-none z-0" />
    <div className="w-full">
      <ScrollReveal
        className="relative z-20 mx-auto mb-10 max-w-3xl px-5 text-center sm:mb-12"
        blur={false}
      >
        <span className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-white/38">
          What I Use
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">
          Tools I Use
        </h2>
        <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-relaxed text-slate-400 sm:text-[15px]">
          A focused collection of platforms and software I use to manage ecommerce work,
          create content, collaborate, and turn research into results.
        </p>
      </ScrollReveal>

      <ToolsFanCards categories={toolCategories} />
    </div>
  </section>
);
