import React, { useRef } from 'react';
import { HomepageSettings } from '../lib/firestoreProducts';
import { ArrowRight } from 'lucide-react';

interface MarqueeSectionProps {
  settings?: HomepageSettings;
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({ settings }) => {
  const marqueeRef = useRef<HTMLMarqueeElement>(null);

  if (settings?.marqueeEnabled === false) return null;

  const text =
    settings?.marqueeText ||
    '🌾 Seed Haven BD - বিশুদ্ধ বীজ ও সুস্থ চারা দিয়ে গড়ে তুলুন আপনার স্বপ্নের ছাদবাগান! সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা ও ১০০% অঙ্কুরোদ্গম নিশ্চয়তা।';

  if (!text || text.trim() === '') return null;

  const badge = settings?.marqueeBadge || '📢 বিশেষ ঘোষণা';
  const bgColor = settings?.marqueeBgColor || '#07361a';
  const textColor = settings?.marqueeTextColor || '#ffffff';
  const speedMap: Record<string, number> = {
    slow: 5,
    normal: 8,
    fast: 14,
  };
  const scrollAmount = speedMap[settings?.marqueeSpeed || 'normal'] || 8;
  const link = settings?.marqueeLink || '';

  const handleClick = () => {
    if (!link) return;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
    } else if (link.startsWith('#')) {
      const el = document.getElementById(link.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-3">
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl shadow-xs border border-emerald-950/20 flex items-center gap-2 sm:gap-3 py-2 px-3 sm:px-4 select-none ${
          link ? 'cursor-pointer group hover:shadow-md transition-shadow' : ''
        }`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {/* Left Badge / Announcement Pill */}
        {badge && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide whitespace-nowrap shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping shrink-0" />
            <span>{badge}</span>
          </div>
        )}

        {/* Marquee Scrolling Content */}
        <div className="flex-1 min-w-0 overflow-hidden flex items-center">
          <marquee
            ref={marqueeRef}
            behavior="scroll"
            direction="left"
            scrollamount={scrollAmount}
            onMouseEnter={() => marqueeRef.current?.stop()}
            onMouseLeave={() => marqueeRef.current?.start()}
            onTouchStart={() => marqueeRef.current?.stop()}
            onTouchEnd={() => marqueeRef.current?.start()}
            className="text-xs sm:text-sm font-semibold tracking-wide"
          >
            <span className="inline-flex items-center gap-6">
              <span>{text}</span>
              <span className="opacity-60">•</span>
              <span>{text}</span>
              <span className="opacity-60">•</span>
              <span>{text}</span>
            </span>
          </marquee>
        </div>

        {/* Right Click Indicator if link is present */}
        {link && (
          <div className="shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-bold opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>দেখুন</span>
            <ArrowRight size={13} />
          </div>
        )}
      </div>
    </section>
  );
};
