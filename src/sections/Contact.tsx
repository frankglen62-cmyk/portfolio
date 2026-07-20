import React, { useRef } from 'react';
import { Camera, Clock3, Mail, MapPin, Play, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../components/animations/ScrollReveal';

const emailAddress = 'agnesann@email.com';

const contactDetails = [
  {
    label: 'Mail me',
    value: emailAddress,
    href: `mailto:${emailAddress}`,
    icon: Mail,
  },
  {
    label: 'Location',
    value: 'Philippines',
    icon: MapPin,
  },
  {
    label: 'Availability',
    value: 'Remote · Worldwide',
    icon: Clock3,
  },
];

const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com/fnkgln/?hl=en', icon: Camera },
  { name: 'TikTok', url: 'https://www.tiktok.com/@itzyearl', icon: Send },
  { name: 'YouTube', url: 'https://www.youtube.com/@TunogTriviaPH', icon: Play },
];

export const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = String(data.get('subject') || 'Portfolio inquiry');
    const name = String(data.get('name') || 'Visitor');
    const senderEmail = String(data.get('email') || '');
    const message = String(data.get('message') || '');
    const body = `Name: ${name}\nEmail: ${senderEmail}\n\n${message}`;
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" ref={sectionRef} className="overflow-hidden bg-[#0c0c0c] py-16 text-white md:py-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-[0.72fr_1.55fr] lg:gap-14">
        <ScrollReveal delay={0.05} className="flex flex-col justify-between">
          <div>
            <p className="mb-7 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
              Contact info
            </p>

            <div className="space-y-7">
              {contactDetails.map(({ label, value, href, icon: Icon }) => {
                const content = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/[0.04] text-white/76">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="mb-1 block font-ui text-[9px] font-medium uppercase tracking-[0.12em] text-white/32">
                        {label}
                      </span>
                      <span className="block font-body text-sm text-white/78">{value}</span>
                    </span>
                  </>
                );

                return href ? (
                  <a key={label} href={href} className="flex items-center gap-4 transition-opacity hover:opacity-70">
                    {content}
                  </a>
                ) : (
                  <div key={label} className="flex items-center gap-4">{content}</div>
                );
              })}
            </div>
          </div>

          <div className="mt-12">
            <p className="mb-5 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
              Social info
            </p>
            <div className="flex gap-3">
              {socials.map(({ name, url, icon: Icon }) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72 transition-colors hover:bg-white hover:text-black"
                  aria-label={name}
                  title={name}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </motion.a>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12} className="relative overflow-hidden rounded-lg border border-white/8 bg-[#141414] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-8 md:p-10">
          <Sparkles className="absolute right-7 top-7 h-8 w-8 text-white/34" strokeWidth={1.1} />

          <h2 className="mb-8 pr-12 font-body text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-none tracking-normal text-white">
            Let&apos;s work <span className="text-yellow">together.</span>
          </h2>

          <form className="relative z-10 flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              name="name"
              type="text"
              required
              placeholder="Name *"
              className="h-12 w-full rounded-md border border-white/5 bg-white/[0.045] px-4 font-body text-sm text-white outline-none transition-colors placeholder:text-white/32 focus:border-white/22"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email *"
              className="h-12 w-full rounded-md border border-white/5 bg-white/[0.045] px-4 font-body text-sm text-white outline-none transition-colors placeholder:text-white/32 focus:border-white/22"
            />
            <input
              name="subject"
              type="text"
              required
              placeholder="Your Subject *"
              className="h-12 w-full rounded-md border border-white/5 bg-white/[0.045] px-4 font-body text-sm text-white outline-none transition-colors placeholder:text-white/32 focus:border-white/22"
            />
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Your Message *"
              className="w-full resize-none rounded-md border border-white/5 bg-white/[0.045] px-4 py-4 font-body text-sm text-white outline-none transition-colors placeholder:text-white/32 focus:border-white/22"
            />
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="mt-1 h-12 w-full rounded-md border border-white/10 bg-white/[0.09] font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black"
            >
              Send Message
            </motion.button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
};
