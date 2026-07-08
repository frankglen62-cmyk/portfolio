import React, { useState, useEffect, useRef } from 'react';

const CARD_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4',
];

interface Tool {
  name: string;
  id?: string;
}

interface ToolCategory {
  categoryName: string;
  tools: Tool[];
}

interface ToolsCarousel3DProps {
  categories: ToolCategory[];
}

export const ToolsCarousel3D: React.FC<ToolsCarousel3DProps> = ({ categories }) => {
  const cardCount = categories.length;
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>(0);
  const progress = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const containerH = useRef<number>(750);
  const isVisible = useRef<boolean>(true);

  // Click-to-advance: uses speed boost instead of lerp so the natural
  // smoothstep/magnetic-dwell animation plays at accelerated speed
  const clickTarget = useRef<number | null>(null);

  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set([0, 1, cardCount - 1]));

  const [metrics, setMetrics] = useState({
    cardW: 420,
    cardH: 264,
  });

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };
    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // IntersectionObserver — pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      let ch: number;
      if (w < 640) ch = 520;
      else if (w < 1024) ch = 650;
      else ch = 750;
      containerH.current = ch;
      if (containerRef.current) containerRef.current.style.height = `${ch}px`;

      let cardW = Math.round(w * 0.2 + 160);
      const heightFactor = Math.min(1.0, Math.max(0.65, ch / 750));
      cardW = Math.round(cardW * heightFactor);
      cardW = Math.min(420, Math.max(200, cardW));
      const cardH = Math.round(cardW / 1.5925);
      setMetrics({ cardW, cardH });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click handler — sets a target, carousel runs at boosted speed 
  // through the natural animation until it reaches the next card
  const handleCardClick = () => {
    const next = Math.ceil(progress.current + 0.05);
    clickTarget.current = next;
  };

  // 60fps render loop
  useEffect(() => {
    let lastVisibleUpdate = 0;

    const tick = () => {
      frameId.current = requestAnimationFrame(tick);
      if (!isVisible.current) return;

      // Speed: normal auto-scroll OR boosted (same animation, just faster)
      const normalSpeed = 0.0016;
      let speed = normalSpeed;

      if (clickTarget.current !== null) {
        if (progress.current >= clickTarget.current - 0.005) {
          // Reached target — snap and resume normal
          progress.current = clickTarget.current;
          clickTarget.current = null;
          speed = 0;
        } else {
          // Boost speed ~15x to play the natural transition faster
          speed = 0.022;
        }
      }

      progress.current += speed;

      // Inertia damping
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

      const cards = cardsRefs.current;
      const h = containerH.current;
      const { cardH } = metrics;

      const continuousProgress = progress.current;
      const roundedIndex = Math.round(continuousProgress);
      const diffFromRound = continuousProgress - roundedIndex;
      const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
      const virtualActiveIndex = roundedIndex + easedDiff;

      // Lazy video loading — update every 250ms
      const now = performance.now();
      if (now - lastVisibleUpdate > 250) {
        lastVisibleUpdate = now;
        const newVisible = new Set<number>();
        for (let i = 0; i < cardCount; i++) {
          let off = i - virtualActiveIndex;
          const hc = cardCount / 2;
          while (off > hc) off -= cardCount;
          while (off < -hc) off += cardCount;
          if (Math.abs(off) <= 2.0) newVisible.add(i);
        }
        setVisibleCards(newVisible);
      }

      for (let i = 0; i < cardCount; i++) {
        const card = cards[i];
        if (!card) continue;

        let offset = i - virtualActiveIndex;
        const halfCount = cardCount / 2;
        while (offset > halfCount) offset -= cardCount;
        while (offset < -halfCount) offset += cardCount;

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);

        if (absOffset > 3.0) {
          card.style.visibility = 'hidden';
          continue;
        } else {
          card.style.visibility = 'visible';
        }

        const gap = 40;
        const peekAmount = -55;
        const D = 1350;
        let y = 0, z = 0, rot = 0;

        if (absOffset <= 1) {
          const t = absOffset;
          const easedT = t * t * (3 - 2 * t);
          y = -sign * (easedT * (cardH + gap));
          z = 400 + easedT * (220 - 400);
          rot = easedT * 132;
        } else if (absOffset <= 2) {
          const t = absOffset - 1;
          const easedT = t * t * (3 - 2 * t);
          const yStart = cardH + gap;
          const zEnd = -60;
          const sEnd = D / (D - zEnd);
          const yEnd = (h / 2 - peekAmount) / sEnd - (cardH / 2);
          y = -sign * (yStart + easedT * (yEnd - yStart));
          z = 220 + easedT * (zEnd - 220);
          rot = 132 + easedT * (175 - 132);
        } else {
          const t = Math.min(absOffset - 2, 1);
          const easedT = t * t * (3 - 2 * t);
          const zStart = -60;
          const zEnd3 = -250;
          const sEnd2 = D / (D - zStart);
          const yEnd2 = (h / 2 - peekAmount) / sEnd2 - (cardH / 2);
          const sEnd3 = D / (D - zEnd3);
          const yEnd3 = (h / 2 + 100) / sEnd3 + (cardH / 2);
          y = -sign * (yEnd2 + easedT * (yEnd3 - yEnd2));
          z = zStart + easedT * (zEnd3 - zStart);
          rot = 175 + easedT * (195 - 175);
        }

        const localRot = -sign * rot;
        const cf = Math.max(0, 1 - absOffset);
        const tiltX = -mouse.current.y * 12 * cf;
        const tiltY = mouse.current.x * 15 * cf;

        card.style.zIndex = Math.round(z).toString();
        card.style.transform = `translateY(${y.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateX(${(localRot + tiltX).toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) rotateZ(-3deg)`;
      }
    };

    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics, cardCount]);

  const thicknessLayers = [-1.2, 0, 1.2];

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center overflow-hidden select-none"
      style={{ height: '750px' }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1350px' }}
      >
        <div
          className="absolute"
          style={{
            width: `${metrics.cardW}px`,
            height: `${metrics.cardH}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {categories.map((category, i) => (
            <div
              key={i}
              ref={(el) => { cardsRefs.current[i] = el; }}
              className="absolute inset-0 cursor-pointer"
              onClick={handleCardClick}
              style={{
                width: `${metrics.cardW}px`,
                height: `${metrics.cardH}px`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
                willChange: 'transform',
              }}
            >
              {thicknessLayers.map((zOffset, layerIdx) => {
                const isFrontFace = layerIdx === thicknessLayers.length - 1;
                const isBackFace = layerIdx === 0;
                const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];
                const shouldLoadVideo = visibleCards.has(i);

                if (!isFrontFace && !isBackFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-[#808080] pointer-events-none overflow-hidden"
                      style={{ backgroundColor: '#808080', transform: `translateZ(${zOffset}px)` }}
                    />
                  );
                }

                if (isFrontFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-white/15 overflow-hidden"
                      style={{
                        backgroundColor: '#0f0f0f',
                        transform: `translateZ(${zOffset}px)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                      }}
                    >
                      {shouldLoadVideo && (
                        <video
                          src={videoSrc}
                          autoPlay loop muted playsInline
                          className="absolute inset-0 w-full h-full object-cover rounded-[16px]"
                        />
                      )}

                      <div className="absolute inset-0 text-white z-10 bg-black/35">
                        <div className="absolute left-4 sm:left-5 top-3.5 sm:top-4">
                          <span
                            className="text-[10px] sm:text-[11px] font-semibold text-white/25 tracking-[0.2em]"
                            style={{ fontFamily: '"JetBrains Mono", monospace' }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-7 pt-2">
                          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                            {category.tools.map((tool) => (
                              <div
                                key={tool.name}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-md flex items-center justify-center"
                              >
                                {tool.id && (
                                  <img
                                    src={`/icons/tools/${tool.id}`}
                                    alt={tool.name}
                                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                                    loading="lazy"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="absolute left-4 sm:left-5 bottom-3.5 sm:bottom-4 right-4 sm:right-5">
                          <h3
                            className="text-[11px] sm:text-[13px] font-bold text-white/85 uppercase tracking-[0.12em] leading-tight"
                            style={{ fontFamily: '"Oswald", sans-serif' }}
                          >
                            {category.categoryName}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isBackFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] border border-white/15 pointer-events-none overflow-hidden"
                      style={{
                        backgroundColor: '#0a0a0a',
                        transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(30,40,80,0.6) 0%, rgba(10,10,20,0.9) 50%, rgba(20,30,60,0.5) 100%)',
                        }}
                      />
                      <div className="absolute left-0 right-0 top-4 sm:top-5 h-7 sm:h-8 bg-black/85 z-10" />
                      <div
                        className="absolute left-4 sm:left-5 bottom-3.5 sm:bottom-4 right-4 sm:right-5 z-20 flex flex-col gap-1.5"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        <div className="text-[7px] sm:text-[8px] font-semibold text-white/35 uppercase tracking-[0.2em]">
                          {category.categoryName}
                        </div>
                        <div className="text-[8px] sm:text-[9px] font-medium text-white/65 leading-[1.7]">
                          {category.tools.map((t) => t.name).join(' · ')}
                        </div>
                        <div className="text-[7px] text-white/25 font-medium tracking-widest mt-0.5">
                          {category.tools.length} TOOLS
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
