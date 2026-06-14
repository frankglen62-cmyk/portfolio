# Prolific — Premium Portfolio Site

A pixel-perfect recreation of the Prolific design template, built with modern web technologies and production-ready for deployment.

## 🚀 Tech Stack

- **React 19** + **TypeScript** — Component-based UI with full type safety
- **Vite** — Lightning-fast development & build tool
- **Tailwind CSS v4** — Utility-first styling with custom design tokens
- **Framer Motion** — Component animations, page transitions, scroll reveals
- **GSAP + ScrollTrigger** — Scroll-linked parallax, text reveals, timelines

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── animations/          # Motion variants, GSAP factories, easings
│   ├── variants.ts      # Framer Motion reusable variants
│   ├── gsapAnimations.ts# GSAP ScrollTrigger factories
│   └── easings.ts       # Shared easing curves
├── components/
│   ├── ui/              # Button, Card, Accordion, SectionHeading
│   └── layout/          # Navbar, SectionWrapper
├── sections/            # All page sections (Hero, About, etc.)
├── hooks/               # useMediaQuery, useScrollAnimation
├── data/                # Site content (siteData.ts)
├── types/               # TypeScript interfaces
├── styles/              # Global CSS with Tailwind
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## 🎨 Design System

### Colors
- **Cream** `#f1efe9` — Section backgrounds
- **Gold** `#f9e46e` — Primary accent
- **Orange** `#fdb466` — CTA highlights
- **Dark** `#1e1e1e` — Primary text

### Fonts
- **Archivo** — Headlines (600–900 weights)
- **Instrument Sans** — Body text (400–700)
- **Montserrat** — Badges & labels

### Breakpoints
- Mobile: `< 810px`
- Tablet: `810px – 1279px`
- Desktop: `≥ 1280px`

## 🚢 Deployment

### Vercel
```bash
npm run build
# Deploy the `dist` folder
```

### Netlify
```bash
npm run build
# Set build command: npm run build
# Set publish directory: dist
```

No additional configuration needed — works out of the box.

## 📄 License

MIT
