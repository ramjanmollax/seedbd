import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  ChevronUp,
  Plus,
  Minus,
  Sprout,
  ShieldCheck,
  Headphones,
  Sparkles,
  Globe,
} from 'lucide-react';
import { FooterSettings, ContactSettings } from '../lib/firestoreProducts';

interface FooterProps {
  onSelectCategory?: (catId: string) => void;
  onOpenContact?: (tab?: 'about' | 'contact') => void;
  onOpenPolicy?: (tab?: 'privacy' | 'terms' | 'refund' | 'shipping') => void;
  onOpenCart?: () => void;
  onNavigateHome?: () => void;
  settings?: FooterSettings;
  contactSettings?: ContactSettings;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  contactSettings,
  onSelectCategory,
  onOpenContact,
  onOpenPolicy,
  onOpenCart,
  onNavigateHome,
}) => {
  if (settings && settings.footerEnabled === false) {
    return null;
  }

  // FAQ Accordion State (Initially all closed, only open when clicked)
  const [openFaqIndexes, setOpenFaqIndexes] = useState<number[]>([]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndexes((prev) =>
      prev.includes(idx) ? [] : [idx]
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToTop();
    }
  };

  // Content from panel settings (with sensible defaults)
  const rawBrandName = settings?.brandName;
  const brandName =
    !rawBrandName || rawBrandName.includes('বিচিত্রা') || rawBrandName.toLowerCase().includes('bichitra')
      ? 'Seed Haven BD'
      : rawBrandName;

  const tagline = settings?.tagline || 'বিশুদ্ধ বীজ, সমৃদ্ধ ফসল';
  let bio =
    settings?.bio ||
    'নিজের ছাদবাগানে টাটকা, স্বাস্থ্যকর ও বিষমুক্ত সবজি ফলান। Seed Haven BD আপনার সবুজ স্বপ্নের নির্ভরযোগ্য সঙ্গী।';
  if (bio.includes('বিচিত্রা')) {
    bio = bio.replace(/বীজ\s*বিচিত্রা/g, 'Seed Haven BD');
  }

  const footerLogoUrl = settings?.footerLogoUrl || '';
  const hotline = settings?.hotline || contactSettings?.hotline || '09617443377';
  const whatsapp = settings?.whatsapp || contactSettings?.whatsapp || '01410136900';
  const phone = settings?.phone || contactSettings?.phone || '01410136900';
  const email = settings?.email || contactSettings?.email || 'support@seedhavenbd.com';
  const businessHours = settings?.businessHours || 'সকাল ৯টা - রাত ৮টা';
  const address = settings?.address || contactSettings?.address || 'দেবীগঞ্জ, পঞ্চগড় | সারা দেশে ক্যাশ অন ডেলিভারি';

  let copyright = settings?.copyright || `© ${new Date().getFullYear()} ${brandName} | সর্বস্বত্ব সংরক্ষিত।`;
  if (copyright.includes('বিচিত্রা')) {
    copyright = copyright.replace(/বীজ\s*বিচিত্রা/g, 'Seed Haven BD');
  }

  const facebook = settings?.facebook || contactSettings?.facebook || 'https://facebook.com/seedhavenbd';
  const youtube = settings?.youtube || contactSettings?.youtube || 'https://youtube.com/@seedhavenbd';
  const tiktok = settings?.tiktok || contactSettings?.tiktok || '';
  const instagram = settings?.instagram || contactSettings?.instagram || '';

  // Theme & Colors (Fully controllable from panel)
  const footerBgColor = settings?.footerBgColor || '#082f1e';
  const footerFaqBgColor = settings?.footerFaqBgColor || '#f4f8f3';
  const accentColor = settings?.accentColor || '#22c55e';
  const showFaq = settings?.showFaq !== false;

  // Quick Links
  const quickLinksTitle = settings?.quickLinksTitle || 'দ্রুত লিংক';
  const quickLink1 = settings?.quickLink1Text || 'হোমপেজ';
  const quickLink2 = settings?.quickLink2Text || 'সকল বীজ';
  const quickLink3 = settings?.quickLink3Text || 'কম্বো প্যাক';
  const quickLink4 = settings?.quickLink4Text || 'কেন কিনবেন';
  const quickLink5 = settings?.quickLink5Text || 'প্রশ্নোত্তর';
  const quickLink6 = settings?.quickLink6Text || 'অর্ডার করুন';

  // Contact Box
  const contactBoxTitle = settings?.contactBoxTitle || 'যোগাযোগ ও হেল্পলাইন';

  // Delivery Box text
  const deliveryTitle = settings?.deliveryTitle || 'ডেলিভারি তথ্য';
  const deliveryNote1 = settings?.deliveryNote1 || 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি';
  const deliveryNote2 = settings?.deliveryNote2 || 'ডেলিভারি চার্জ একদম FREE!';
  const deliveryNote3 = settings?.deliveryNote3 || 'Cash on Delivery (ক্যাশ অন ডেলিভারি)';

  // 4 Trust Badges
  const badge1Text = settings?.badge1Text || 'উন্নত মানের বীজ';
  const badge2Text = settings?.badge2Text || 'অঙ্কুরোদগম ৯৫%+';
  const badge3Text = settings?.badge3Text || 'বিশ্বাস ও সততার প্রতীক';
  const badge4Text = settings?.badge4Text || 'সহায়তা সার্বক্ষণিক';

  // Policy Labels
  const privacyLabel = settings?.privacyLabel || 'গোপনীয়তা নীতি';
  const termsLabel = settings?.termsLabel || 'ব্যবহারের শর্তাবলী';
  const refundLabel = settings?.refundLabel || 'রিটার্ন নীতি';
  const shippingLabel = settings?.shippingLabel || 'সাইটম্যাপ / ডেলিভারি';

  // FAQ texts
  const faqTitle = settings?.faqTitle || 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)';
  const faqSubtitle = settings?.faqSubtitle || 'সাধারণ জিজ্ঞাসা';

  const whatsappClean = (whatsapp || phone).replace(/[^0-9]/g, '');
  const whatsappUrl = whatsappClean
    ? whatsappClean.startsWith('88')
      ? `https://wa.me/${whatsappClean}`
      : `https://wa.me/88${whatsappClean}`
    : 'https://wa.me/8801410136900';

  const configuredFaqs = [
    ...(settings?.faq1Q ? [{ q: settings.faq1Q, a: settings.faq1A || '' }] : []),
    ...(settings?.faq2Q ? [{ q: settings.faq2Q, a: settings.faq2A || '' }] : []),
    ...(settings?.faq3Q ? [{ q: settings.faq3Q, a: settings.faq3A || '' }] : []),
    ...(settings?.faq4Q ? [{ q: settings.faq4Q, a: settings.faq4A || '' }] : []),
    ...(settings?.faq5Q ? [{ q: settings.faq5Q, a: settings.faq5A || '' }] : []),
    ...(settings?.faq6Q ? [{ q: settings.faq6Q, a: settings.faq6A || '' }] : []),
  ];

  const faqs = configuredFaqs.length > 0 ? configuredFaqs : [
    {
      q: 'বীজ কীভাবে রোপণ করবো?',
      a: 'দোআঁশ বা বেলে-দোআঁশ মাটির সাথে ৫০% জৈব সার বা ভার্মিকম্পোস্ট ভালো করে মিশিয়ে মাটি ঝুরঝুরে করে নিন। বীজ মাটির ১-২ সেমি গভীরে রোপণ করে হালকা পানি স্প্রে করুন। অতিরিক্ত কড়া রোদ বা বৃষ্টির পানি থেকে চারা রক্ষা করতে হালকা শেডের ব্যবস্থা রাখুন। সঠিক আর্দ্রতা বজায় রাখলে ৩-৭ দিনের মধ্যে দ্রুত অঙ্কুরোদ্গম ঘটবে।',
    },
    {
      q: 'গাইডলাইন PDF কীভাবে পাবো?',
      a: 'আমাদের যেকোনো বীজ অর্ডারের সাথে পাচ্ছেন বিনামূল্যে একটি পূর্ণাঙ্গ প্রিন্টেড ও রঙিন ডিজিটাল বাগান পরিচর্যা গাইডলাইন PDF। এছাড়া পার্সেল কনফার্মেশনের পর আমাদের অফিসিয়াল হোয়াটসঅ্যাপেও সরাসরি গাইডলাইন ফাইলটি পাঠিয়ে দেওয়া হয়।',
    },
    {
      q: 'অন্য কোনো প্রশ্ন আছে?',
      a: `যেকোনো কৃষি পরামর্শ, সঠিক বীজ নির্বাচন বা চাষাবাদ সম্পর্কিত তথ্যের জন্য আমাদের হেল্পলাইনে সরাসরি কল করুন: ${phone || hotline} অথবা হোয়াটসঅ্যাপে মেসেজ পাঠান। আমাদের অভিজ্ঞ এগ্রিকালচারিস্ট টিম আপনাকে সার্বক্ষণিক সহায়তা করবে।`,
    },
    {
      q: 'বীজের গুণগত মান কেমন?',
      a: 'আমাদের সকল বীজ ল্যাব-পরীক্ষিত এবং ৯৫%+ অঙ্কুরোদগম হার সমৃদ্ধ। আমরা কৃষক ও ছাদবাগানীদের জন্য প্রিমিয়াম গ্রেডের বীজ সরাসরি সরবরাহ করি।',
    },
  ];

  const isTwoColumns = settings?.faqTwoColumns !== false;

  const isHexOrRgb = footerBgColor.startsWith('#') || footerBgColor.startsWith('rgb');
  const mainFooterStyle: React.CSSProperties = isHexOrRgb
    ? { backgroundColor: footerBgColor }
    : { background: footerBgColor };

  return (
    <footer className="relative w-full text-white font-sans overflow-hidden" id="footer">
      {/* ========================================================= */}
      {/* 1. FAQ ACCORDION SECTION (TOP LIGHT CARD LAYER) */}
      {/* ========================================================= */}
      {showFaq && (
        <section
          className="pt-8 pb-5 px-3 sm:px-6 lg:px-8 transition-colors duration-300"
          style={{ backgroundColor: footerFaqBgColor }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-5 sm:mb-6">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full inline-block">
                {faqSubtitle}
              </span>
              <h3 className="text-base sm:text-xl font-black text-[#093d20] mt-1.5">
                {faqTitle}
              </h3>
            </div>

            <div
              className={
                isTwoColumns
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start'
                  : 'max-w-2xl mx-auto space-y-2.5'
              }
            >
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndexes.includes(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-emerald-300/80 bg-white shadow-2xs overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between gap-3 p-3.5 sm:p-4 text-left cursor-pointer hover:bg-emerald-50/40 transition-colors select-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: accentColor || '#1b5e20' }}
                        >
                          ?
                        </div>
                        <span className="font-extrabold text-xs sm:text-sm text-[#093d20] tracking-tight leading-snug">
                          {faq.q}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#1b5e20] shrink-0">
                        {isOpen ? <Minus size={18} strokeWidth={2.8} /> : <Plus size={18} strokeWidth={2.8} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-emerald-100 bg-[#fbfdf7] animate-in fade-in duration-200">
                        <p>{faq.a}</p>
                        <div className="mt-2.5 pt-2 border-t border-emerald-100/70 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                          <span>প্রয়োজনে সরাসরি কথা বলুন:</span>
                          <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline"
                          >
                            <Phone size={11} /> {phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 2. BOTANICAL WAVE DIVIDER & CURVED TRANSITION */}
      {/* ========================================================= */}
      <div
        className="relative w-full leading-none pointer-events-none select-none transition-colors duration-300"
        style={{ backgroundColor: showFaq ? footerFaqBgColor : 'transparent' }}
      >
        <svg
          viewBox="0 0 1440 180"
          className="w-full h-12 sm:h-20 md:h-24 block"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Green Glow Path */}
          <path
            d="M0,80 C320,160 540,20 840,110 C1140,190 1340,60 1440,100 L1440,180 L0,180 Z"
            fill={accentColor}
            opacity="0.25"
          />
          {/* Bright Lime Curve Accent */}
          <path
            d="M0,70 C300,150 560,30 860,100 C1160,170 1360,50 1440,80 L1440,180 L0,180 Z"
            fill={accentColor}
            opacity="0.75"
          />
          {/* Deep Base Fill matching Footer Background */}
          <path
            d="M0,85 C280,165 580,45 880,115 C1180,180 1380,65 1440,95 L1440,180 L0,180 Z"
            fill={isHexOrRgb ? footerBgColor : '#063d24'}
          />
        </svg>

        {/* Decorative Leaf Sprigs on Left and Right Sides */}
        <div className="absolute left-2 -top-5 sm:-top-8 w-12 sm:w-20 h-12 sm:h-20 opacity-90 drop-shadow-sm pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ fill: accentColor }}>
            <path d="M10,80 Q30,20 90,10 Q60,50 40,60 Q20,70 10,80 Z" opacity="0.85" />
            <path d="M5,85 Q20,40 70,25 Q45,65 25,75 Z" opacity="0.7" />
          </svg>
        </div>
        <div className="absolute right-2 -top-5 sm:-top-8 w-12 sm:w-20 h-12 sm:h-20 opacity-90 drop-shadow-sm pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ fill: accentColor }}>
            <path d="M10,80 Q30,20 90,10 Q60,50 40,60 Q20,70 10,80 Z" opacity="0.85" />
            <path d="M5,85 Q20,40 70,25 Q45,65 25,75 Z" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN FOOTER BODY (COLOR CONTROLLABLE FROM PANEL) */}
      {/* ========================================================= */}
      <div
        className="pt-2 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        style={mainFooterStyle}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ----------------------------------------------------- */}
          {/* UPPER SECTION: BRAND BIO (LEFT) & QUICK LINKS (RIGHT) */}
          {/* ----------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-7 sm:gap-10 pt-2 items-start">
            {/* Left: Brand Identity & Bio (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3.5 text-left">
              {/* Logo with Leaf Graphic & Dynamic Brand Name */}
              <div className="flex items-center gap-2.5">
                {footerLogoUrl ? (
                  <img
                    src={footerLogoUrl}
                    alt={brandName}
                    className="w-10 h-10 rounded-2xl object-contain bg-white/10 p-1 shadow-lg border border-white/20 shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0 text-white"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #052e16)` }}
                  >
                    <Sprout size={22} className="drop-shadow-xs" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-sm flex items-center gap-2">
                    <span>{brandName}</span>
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-300/90 tracking-wide mt-1">
                    {tagline}
                  </p>
                </div>
              </div>

              {/* Bio Paragraph */}
              <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed font-normal max-w-xl">
                {bio}
              </p>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                {/* Facebook */}
                {facebook && (
                  <a
                    href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Facebook Page"
                    className="w-9 h-9 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}

                {/* YouTube */}
                {youtube && (
                  <a
                    href={youtube.startsWith('http') ? youtube : `https://${youtube}`}
                    target="_blank"
                    rel="noreferrer"
                    title="YouTube Channel"
                    className="w-9 h-9 rounded-full bg-[#ff0000] hover:bg-[#cc0000] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp Chat"
                  className="w-9 h-9 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>

                {/* TikTok (if set) */}
                {tiktok && (
                  <a
                    href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`}
                    target="_blank"
                    rel="noreferrer"
                    title="TikTok"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
                  >
                    <span className="font-black text-xs">TT</span>
                  </a>
                )}

                {/* Instagram (if set) */}
                {instagram && (
                  <a
                    href={instagram.startsWith('http') ? instagram : `https://${instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Instagram"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
                  >
                    <span className="font-black text-xs">IG</span>
                  </a>
                )}

                {/* Website / Globe */}
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    else scrollToTop();
                  }}
                  title="হোমপেজ"
                  className="w-9 h-9 rounded-full bg-[#1e3a29] hover:bg-[#2a4e38] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer border border-white/10"
                >
                  <Globe size={18} />
                </button>
              </div>
            </div>

            {/* Right: Quick Links (lg:col-span-5) */}
            <div className="lg:col-span-5 text-left sm:pl-6 sm:border-l sm:border-white/10 space-y-3">
              <h4 className="text-base font-black text-white tracking-wide border-b border-white/20 pb-1.5 inline-block">
                {quickLinksTitle}
              </h4>

              <ul className="grid grid-cols-2 gap-2 text-xs sm:text-[13px] font-semibold text-emerald-100/90">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateHome) onNavigateHome();
                      else scrollToTop();
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer"
                  >
                    <span className="text-[#4ade80]">🍃</span>
                    <span>{quickLink1}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('products');
                      if (onSelectCategory) onSelectCategory('all');
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer"
                  >
                    <span className="text-[#4ade80]">🍃</span>
                    <span>{quickLink2}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('products');
                      if (onSelectCategory) onSelectCategory('combo');
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer"
                  >
                    <span className="text-[#4ade80]">🍃</span>
                    <span>{quickLink3}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenContact) onOpenContact('about');
                      else scrollToSection('about');
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer"
                  >
                    <span className="text-[#4ade80]">🍃</span>
                    <span>{quickLink4}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('footer');
                      setOpenFaqIndexes([0]);
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer"
                  >
                    <span className="text-[#4ade80]">🍃</span>
                    <span>{quickLink5}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCart) onOpenCart();
                      else scrollToSection('products');
                    }}
                    className="flex items-center gap-2 hover:text-[#facc15] transition-colors cursor-pointer font-bold text-yellow-300"
                  >
                    <span className="text-[#facc15]">🍃</span>
                    <span>{quickLink6}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* MIDDLE ROW: যোগাযোগ (CONTACT) & ডেলিভারি তথ্য (DELIVERY) */}
          {/* ----------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2 border-t border-white/10">
            {/* Box 1: যোগাযোগ */}
            <div className="bg-black/25 rounded-2xl p-4 border border-white/10 shadow-sm space-y-2 text-left">
              <div className="flex items-center gap-2 text-white font-black text-sm pb-1 border-b border-white/10">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: accentColor || '#15803d' }}
                >
                  <Phone size={14} />
                </div>
                <span>{contactBoxTitle}</span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <a
                  href={`tel:${phone || hotline}`}
                  className="block font-bold text-emerald-100 hover:text-yellow-300 transition-colors text-sm tracking-wide"
                >
                  {phone || hotline}
                </a>
                <p className="text-[11px] text-emerald-300/80 font-medium">
                  ({businessHours})
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/90 pt-0.5 truncate">
                  <Mail size={12} className="text-emerald-400 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:underline truncate">
                    {email}
                  </a>
                </div>
                {address && (
                  <p className="text-[11px] text-emerald-300/75 pt-0.5 leading-snug line-clamp-1">
                    📍 {address}
                  </p>
                )}
              </div>
            </div>

            {/* Box 2: ডেলিভারি তথ্য */}
            <div className="bg-black/25 rounded-2xl p-4 border border-white/10 shadow-sm space-y-2 text-left">
              <div className="flex items-center gap-2 text-white font-black text-sm pb-1 border-b border-white/10">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: accentColor || '#15803d' }}
                >
                  <Truck size={15} />
                </div>
                <span>{deliveryTitle}</span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs font-semibold text-emerald-100/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                  <span>{deliveryNote1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                  <span>{deliveryNote2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                  <span>{deliveryNote3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* 4 TRUST & FEATURE BADGES (HORIZONTAL GRID WITH BORDERS) */}
          {/* ----------------------------------------------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 pt-4 pb-1 border-t border-white/10 rounded-2xl overflow-hidden bg-black/20 border border-white/10">
            {/* Badge 1 */}
            <div className="p-3 text-center sm:border-r border-white/10 flex flex-col items-center justify-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: accentColor || '#15803d' }}
              >
                <Sprout size={18} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-snug">
                {badge1Text}
              </span>
            </div>

            {/* Badge 2 */}
            <div className="p-3 text-center sm:border-r border-white/10 flex flex-col items-center justify-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: accentColor || '#15803d' }}
              >
                <Sparkles size={18} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-snug">
                {badge2Text}
              </span>
            </div>

            {/* Badge 3 */}
            <div className="p-3 text-center sm:border-r border-white/10 flex flex-col items-center justify-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: accentColor || '#15803d' }}
              >
                <ShieldCheck size={18} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-snug">
                {badge3Text}
              </span>
            </div>

            {/* Badge 4 */}
            <div className="p-3 text-center flex flex-col items-center justify-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: accentColor || '#15803d' }}
              >
                <Headphones size={18} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-snug">
                {badge4Text}
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* BOTTOM COPYRIGHT, POLICY LINKS & SCROLL TO TOP */}
          {/* ----------------------------------------------------- */}
          <div className="pt-4 border-t border-white/10 flex flex-col items-center justify-center gap-3 text-center relative">
            {/* Scroll To Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="sm:absolute right-0 top-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer active:scale-95"
              title="ওপরে যান"
              aria-label="Scroll to top"
            >
              <ChevronUp size={20} strokeWidth={2.5} />
            </button>

            {/* Copyright */}
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium tracking-wide">
              {copyright}
            </p>

            {/* Policy Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] font-semibold text-emerald-300/80">
              <button
                type="button"
                onClick={() => onOpenPolicy?.('privacy')}
                className="hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {privacyLabel}
              </button>
              <span className="text-emerald-700">•</span>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('terms')}
                className="hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {termsLabel}
              </button>
              <span className="text-emerald-700">•</span>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('refund')}
                className="hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {refundLabel}
              </button>
              <span className="text-emerald-700">•</span>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('shipping')}
                className="hover:text-yellow-300 hover:underline transition-colors cursor-pointer"
              >
                {shippingLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
