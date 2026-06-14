// ============================================================
// Types for Frank Glen Martin VA Portfolio
// ============================================================

export interface NavLink {
  label: string;
  href: string;
}

export interface Tool {
  id?: string;
  name: string;
  icon: string;
  description: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description: string;
  impact: string;
  gradient: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
  color: string;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  badge: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface SocialLink {
  platform: string;
  href: string;
}

export interface SiteData {
  name: string;
  title: string;
  tagline: string;
  nav: NavLink[];
  hero: {
    headline: string;
    subtext: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    bio: string;
    specializations: string[];
    stats: Stat[];
  };
  tools: Tool[];
  services: Service[];
  portfolio: PortfolioItem[];
  skills: SkillCategory[];
  certifications: Certification[];
  whyHireMe: {
    headline: string;
    points: string[];
  };
  contact: {
    headline: string;
    subtext: string;
    email: string;
  };
  socials: SocialLink[];
}
