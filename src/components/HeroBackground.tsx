'use client';

import { useEffect, useState } from 'react';
import Media from '@/components/Media';
import type { ContentImage } from '@/lib/content/types';

const SLIDE_MS = 8000;
const DEFAULT_MEDIA: ContentImage[] = [{ url: '/assets/bg1.webp', type: 'image' }];

/** Hero background: banner photos/videos from the portal, cross-fading between them. */
export default function HeroBackground({ media }: { media: ContentImage[] }) {
  const slides = media.length ? media : DEFAULT_MEDIA;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="absolute inset-0">
      {slides.map((slide, index) => (
        <div
          key={`${slide.url}-${index}`}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${index === active ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`absolute inset-0 ${index === active ? 'hero-kenburns' : ''}`}>
            <Media media={slide} alt="" sizes="100vw" priority={index === 0} className="object-cover object-center" />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-[#050505]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-6 z-10 flex gap-2 md:right-16">
          {slides.map((slide, index) => (
            <span key={`${slide.url}-bar-${index}`} className="relative h-1 w-10 overflow-hidden rounded-full bg-white/20">
              <span
                key={index === active ? `on-${active}` : 'off'}
                className={`absolute inset-y-0 left-0 rounded-full bg-gold-300 ${index === active ? 'hero-progress' : 'w-0'}`}
                style={index === active ? { animationDuration: `${SLIDE_MS}ms` } : undefined}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
