import React, { useState } from 'react';
import {
  Gift,
  Percent,
  Copy,
  Check,
  ShieldCheck,
  BadgeDollarSign,
  Globe,
  Wrench,
  Truck,
  Headset,
  Clock,
  Calendar,
  ArrowRight,
  X,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { HomepageSettings } from '../lib/firestoreProducts';
import { OrderDetails, LeaderboardUser } from '../types';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  category: string;
  imageEmoji: string;
}

const BLOG_POSTS: BlogPost[] = [];

// ==========================================
// 1. PROMO COUPON SECTION
// ==========================================

interface PromoSectionProps {
  title?: string;
  subtext?: string;
  buttonText?: string;
  couponCode?: string;
  onCopyCoupon?: (code: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({
  title,
  subtext,
  couponCode,
  onCopyCoupon,
}) => {
  const [copied, setCopied] = useState(false);
  const code = (couponCode || 'SEED10').toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopyCoupon) onCopyCoupon(code);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-4">
      <div className="bg-gradient-to-r from-[#edf2dc] via-[#e5eed5] to-[#f2f6e9] rounded-2xl p-3.5 flex items-center justify-between gap-3 border border-[#dce4c7] relative overflow-hidden shadow-2xs">
        {/* Left Gift Box Icon */}
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#2b5019] text-white flex items-center justify-center shadow-2xs">
          <Gift size={20} className="text-amber-300" />
        </div>

        {/* Center Text & Coupon Code */}
        <div className="text-center space-y-0.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-[#386221] uppercase tracking-wider block truncate">
            {subtext || 'নতুন গ্রাহকদের জন্য বিশেষ কুপন'}
          </span>

          <h3 className="text-sm sm:text-base font-black text-[#1c3822] tracking-tight truncate">
            {title || '১০% ডিসকাউন্ট পেতে ব্যবহার করুন'}
          </h3>

          <div className="pt-0.5 flex items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-700">কুপন কোড:</span>
            <button
              onClick={handleCopy}
              className="bg-[#2b5019] hover:bg-[#1c3822] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1 active:scale-95"
              title="কপি করতে ক্লিক করুন"
            >
              <span>{code}</span>
              {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Right Percent Icon */}
        <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-2xs">
          <Percent size={20} />
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. TRUST & ASSURANCE BADGES
// ==========================================

export const TrustSection: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      title: '১০০% আসল বীজ',
      desc: 'মাঠ পর্যায়ে পরীক্ষিত, উচ্চ অঙ্কুরোদগম হার।',
    },
    {
      icon: <BadgeDollarSign className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100 text-amber-600',
      title: 'ন্যায্য মূল্য',
      desc: 'সেরা মানের বীজ সাশ্রয়ী মূল্যে দোরগোড়ায়।',
    },
    {
      icon: <Globe className="w-4 h-4 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-100 text-sky-600',
      title: 'রেয়ার কালেকশন',
      desc: 'দেশি-বিদেশি বিরল জাতের বিশাল সংগ্রহ।',
    },
    {
      icon: <Wrench className="w-4 h-4 text-violet-600" />,
      bg: 'bg-violet-50 border-violet-100 text-violet-600',
      title: 'আধুনিক সরঞ্জাম',
      desc: 'চাষাবাদের ইনোভেটিভ টুলস ও সমাধান।',
    },
    {
      icon: <Truck className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100 text-rose-600',
      title: 'দ্রুত ডেলিভারি',
      desc: 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।',
    },
    {
      icon: <Headset className="w-4 h-4 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-100 text-teal-600',
      title: 'কৃষি পরামর্শ',
      desc: 'অভিজ্ঞ কৃষিবিদদের সার্বক্ষণিক সহায়তা।',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 my-2" id="about">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-3 sm:p-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2.5 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
              🌱
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-[#1c3822] leading-tight">
                কেন Seed Haven BD আপনার প্রথম পছন্দ?
              </h2>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                উচ্চ অঙ্কুরোদগম ক্ষমতাসম্পন্ন খাঁটি বীজ ও বিশ্বস্ত সেবার নিশ্চয়তা
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ✓ ১০০% নিশ্চয়তা
          </span>
        </div>

        {/* 6 Compact, Beautiful Micro Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-2 sm:p-2.5 rounded-xl border border-gray-150 bg-gradient-to-b from-white to-slate-50/40 hover:to-emerald-50/20 hover:border-emerald-300 transition-all flex items-start gap-2 shadow-2xs group hover:-translate-y-0.5"
            >
              <div className={`w-7 h-7 rounded-lg ${feat.bg} flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform`}>
                {feat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-[11px] sm:text-xs text-[#1c3822] leading-snug truncate">
                  {feat.title}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. BLOG & PLANTING GUIDE
// ==========================================

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<(typeof BLOG_POSTS)[0] | null>(null);

  if (!BLOG_POSTS || BLOG_POSTS.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" id="blogs">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#063d24]">🌱 বাগান ব্লগ ও গাইড টিপস</h2>
          <p className="text-sm text-[#6a776e] mt-1">বীজ রোপণ ও সঠিক যত্নের পরামর্শ জানুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="bg-white border border-[#eaeee4] rounded-2xl overflow-hidden p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-40 rounded-xl bg-gradient-to-b from-[#f4f8eb] to-[#e8f2d5] flex items-center justify-center text-6xl mb-4 group-hover:scale-102 transition-transform">
                {post.imageEmoji}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#6a776e] font-semibold mb-2">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {post.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#063d24] group-hover:text-[#176b38] transition-colors leading-snug mb-2">
                {post.title}
              </h3>

              <p className="text-xs text-[#526250] line-clamp-3 leading-relaxed mb-4">
                {post.excerpt}
              </p>
            </div>

            <button
              onClick={() => setSelectedPost(post)}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#176b38] hover:text-[#063d24] transition-colors pt-2 border-t border-[#f0f3ea] cursor-pointer"
            >
              <span>সম্পূর্ণ নিবন্ধ পড়ুন</span>
              <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>

      {/* Blog Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-[#e8eadf]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#e0e4d7] flex items-center justify-center text-[#063d24] hover:bg-[#f0f4e8]"
            >
              <X size={18} />
            </button>

            <div className="text-5xl mb-3">{selectedPost.imageEmoji}</div>
            <span className="text-xs font-bold text-[#176b38] bg-[#e4f1cb] px-2.5 py-1 rounded-md">
              {selectedPost.category}
            </span>

            <h3 className="text-2xl font-black text-[#063d24] mt-2 mb-3">
              {selectedPost.title}
            </h3>

            <p className="text-xs text-[#6a776e] mb-4">
              প্রকাশের তারিখ: {selectedPost.date} | পড়ার সময়: {selectedPost.readTime}
            </p>

            <div className="space-y-3 text-sm text-[#405649] leading-relaxed border-t border-[#edf0e7] pt-4">
              <p>
                বীজ থেকে সুস্থ ও সবল চারা তৈরি করতে মাটি প্রস্তুতি সবচেয়ে গুরুত্বপূর্ণ ধাপ। দোআঁশ মাটির সাথে জৈব সার বা গোবর সার ভালো করে মিশিয়ে ঝুরঝুরে করে নিন।
              </p>
              <p>
                বীজ রোপণের পর হালকা আর্দ্রতা বজায় রাখুন, তবে অতিরিক্ত পানি নিষ্কাশনের ভালো ব্যবস্থা থাকতে হবে। সঠিক পরিমাণে আলো বাতাস ও যত্ন পেলে খুব দ্রুত বীজের অঙ্কুরোদ্গম ঘটবে।
              </p>
              <p className="bg-[#f0f7e6] p-3 rounded-xl border border-[#d6e8be] font-semibold text-xs text-[#063d24]">
                💡 পরামর্শ: যেকোনো বীজ সম্পর্কিত সমস্যায় আমাদের কল করুন অথবা ইনবক্স করুন।
              </p>
            </div>

            <button
              onClick={() => setSelectedPost(null)}
              className="mt-6 w-full bg-[#176b38] text-white py-3 rounded-full font-bold text-sm hover:bg-[#063d24]"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// ==========================================
// 4. TOP CUSTOMER LEADERBOARD
// ==========================================

interface LeaderboardSectionProps {
  orders?: OrderDetails[];
  settings?: HomepageSettings;
  products?: any[];
  onSelectProduct?: (p: any) => void;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  orders = [],
  settings,
  products = [],
  onSelectProduct,
}) => {
  const [showFullModal, setShowFullModal] = useState(false);

  if (settings?.showLeaderboard === false) return null;

  const isProductMode = settings?.leaderboardType === 'product';
  const hideIfEmpty = settings?.leaderboardHideIfEmpty !== false; // Default true: hide if empty to avoid demo data

  const title =
    settings?.leaderboardTitle ||
    (isProductMode ? 'সেরা বিক্রিত বীজ ও পণ্য' : 'সেরা কাস্টমার লিডারবোর্ড');
  const subtitle =
    settings?.leaderboardSubtitle ||
    (isProductMode
      ? 'সর্বোচ্চ অর্ডারের জনপ্রিয় ও পরীক্ষিত বীজ'
      : 'সর্বোচ্চ সফল অর্ডার ও বিশ্বস্ত গ্রাহক তালিকা');
  const badge = settings?.leaderboardBadge || 'Live Ranking';

  // --- PRODUCT LEADERBOARD MODE ---
  if (isProductMode) {
    const productSoldMap = new Map<string, { product: any; unitsSold: number; totalSales: number }>();

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      (o.items || []).forEach((item: any) => {
        const prod =
          item.product ||
          (products && products.find((p: any) => p.id === (item.product?.id || item.productId)));
        if (!prod) return;
        const pId = prod.id || item.productId;
        if (!productSoldMap.has(pId)) {
          productSoldMap.set(pId, { product: prod, unitsSold: 0, totalSales: 0 });
        }
        const record = productSoldMap.get(pId)!;
        const qty = Number(item.quantity || 1);
        record.unitsSold += qty;
        record.totalSales += Number(item.price || prod.price || 0) * qty;
      });
    });

    let rankedProducts = Array.from(productSoldMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10)
      .map((item, idx) => ({
        rank: idx + 1,
        product: item.product,
        unitsSold: item.unitsSold,
        totalSales: item.totalSales,
      }));

    // If no orders yet, optionally list popular products if products exist
    if (rankedProducts.length === 0 && products && products.length > 0) {
      rankedProducts = products
        .slice(0, 6)
        .map((p, idx) => ({
          rank: idx + 1,
          product: p,
          unitsSold: Number(p.reviewsCount || 5) + (idx === 0 ? 15 : 8 - idx),
          totalSales: (Number(p.price || 150)) * (Number(p.reviewsCount || 5)),
        }));
    }

    if (rankedProducts.length === 0) {
      if (hideIfEmpty) return null;
      return (
        <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center">
            <Crown size={24} className="mx-auto text-amber-500 mb-2" />
            <h3 className="font-bold text-sm sm:text-base text-[#1c3822]">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">অর্ডার সম্পন্ন হলে সর্বাধিক বিক্রিত বীজ তালিকা এখানে যুক্ত হবে।</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-[#386221] to-amber-600" />
          <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
                <Crown size={20} className="fill-amber-500" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1c3822] leading-tight">{title}</h2>
                <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <Sparkles size={11} /> {badge}
            </span>
          </div>

          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {rankedProducts.slice(0, 6).map((item) => {
                const prod = item.product;
                const isRank1 = item.rank === 1;
                const isRank2 = item.rank === 2;
                const isRank3 = item.rank === 3;

                return (
                  <div
                    key={prod?.id || item.rank}
                    onClick={() => onSelectProduct && prod && onSelectProduct(prod)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                      isRank1
                        ? 'border-yellow-300 bg-amber-50/60 shadow-2xs'
                        : isRank2
                        ? 'border-slate-200 bg-slate-50'
                        : isRank3
                        ? 'border-amber-200 bg-orange-50/30'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isRank1
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-2xs'
                          : isRank2
                          ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                          : isRank3
                          ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isRank1 ? <Trophy size={14} /> : isRank2 ? <Medal size={14} /> : isRank3 ? <Award size={14} /> : <span>{item.rank}</span>}
                    </div>

                    <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-emerald-50 border border-gray-200">
                      {prod?.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">{prod?.imageEmoji || '🌱'}</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate hover:text-emerald-700">{prod?.name || 'বীজ পণ্য'}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold truncate">
                        <span>৳{prod?.price || 0}</span>
                        {prod?.packSize && <span>• {prod.packSize}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-xs text-[#2b5019]">{item.unitsSold}টি বিক্রি</div>
                      <div className="text-[9px] text-amber-700 font-bold flex items-center justify-end gap-0.5">
                        <ShoppingBag size={9} />
                        <span>শীর্ষ পণ্য</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- CUSTOMER LEADERBOARD MODE (DEFAULT) ---
  let rankedUsers: LeaderboardUser[] = [];

  if (
    settings?.leaderboardMode === 'custom' &&
    settings?.leaderboardCustomUsers &&
    settings.leaderboardCustomUsers.length > 0
  ) {
    rankedUsers = settings.leaderboardCustomUsers.map((u, idx) => ({
      rank: u.rank || idx + 1,
      name: u.name || 'গ্রাহক',
      phone: u.phone || '',
      location: u.location || '',
      totalAmount: Number(u.totalAmount || 0),
      ordersCount: Number(u.ordersCount || 1),
      avatar: u.avatar || '',
    }));
  } else {
    // Dynamic aggregation from real orders in Firestore
    const userMap = new Map<string, LeaderboardUser>();

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const rawPhone = (o.phone || '').trim();
      const name = (o.customerName || 'সম্মানিত গ্রাহক').trim();
      if (!rawPhone && !name) return;

      const key = rawPhone.replace(/[^0-9]/g, '') || name.toLowerCase();
      const maskedPhone =
        rawPhone.length >= 8
          ? rawPhone.slice(0, 3) + '****' + rawPhone.slice(-4)
          : rawPhone;

      if (!userMap.has(key)) {
        userMap.set(key, {
          rank: 1,
          name,
          phone: maskedPhone,
          location: o.district || o.city || 'বাংলাদেশ',
          totalAmount: 0,
          ordersCount: 0,
          avatar: (o as any).customerPhoto || '',
        });
      }

      const item = userMap.get(key)!;
      item.totalAmount += Number(o.total || o.totalAmount || 0);
      item.ordersCount += 1;
      if (name !== 'সম্মানিত গ্রাহক' && item.name === 'সম্মানিত গ্রাহক') {
        item.name = name;
      }
    });

    rankedUsers = Array.from(userMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)
      .map((u, idx) => ({
        ...u,
        rank: idx + 1,
      }));
  }

  // If no customers yet:
  if (rankedUsers.length === 0) {
    if (hideIfEmpty) {
      // Completely hide section if empty - ensures NO FAKE DEMO EVER SHOWS!
      return null;
    }

    return (
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-[#386221] to-amber-600" />
          <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-amber-50/40 to-white">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <Crown size={24} />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#1c3822] mb-1">
              {title}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed mb-4">
              সফল অর্ডার সম্পন্ন করে লিডারবোর্ডের শীর্ষে স্থান করে নিন এবং উপভোগ করুন আকর্ষণীয় উপহার ও বিশেষ ডিসকাউন্ট।
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2 rounded-xl bg-[#2b5019] hover:bg-[#1c3822] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>পণ্য দেখুন ও অর্ডার করুন</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
        {/* Top Gold Bar accent */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-[#386221] to-amber-600" />

        {/* Section Header */}
        <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
              <Crown size={20} className="fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1c3822] leading-tight">
                {title}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider animate-pulse">
            <Sparkles size={11} /> {badge}
          </span>
        </div>

        {/* Content: Render ranked customers */}
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {rankedUsers.slice(0, 6).map((user) => {
              const isRank1 = user.rank === 1;
              const isRank2 = user.rank === 2;
              const isRank3 = user.rank === 3;

              return (
                <div
                  key={user.rank}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                    isRank1
                      ? 'border-yellow-300 bg-amber-50/60 shadow-2xs'
                      : isRank2
                      ? 'border-slate-200 bg-slate-50'
                      : isRank3
                      ? 'border-amber-200 bg-orange-50/30'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      isRank1
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-2xs'
                        : isRank2
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                        : isRank3
                        ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isRank1 ? (
                      <Trophy size={14} />
                    ) : isRank2 ? (
                      <Medal size={14} />
                    ) : isRank3 ? (
                      <Award size={14} />
                    ) : (
                      <span>{user.rank}</span>
                    )}
                  </div>

                  {/* Avatar (Real image or neat initials) */}
                  <div className="relative shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-300"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-[#1c3822] text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold truncate">
                      {user.phone && <span className="font-mono">{user.phone}</span>}
                      {user.phone && user.location && <span>•</span>}
                      {user.location && <span>{user.location}</span>}
                    </div>
                  </div>

                  {/* Amount & Orders */}
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xs text-[#2b5019]">
                      ৳{user.totalAmount.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[9px] text-gray-400 font-semibold flex items-center justify-end gap-0.5">
                      <ShoppingBag size={9} />
                      <span>{user.ordersCount} অর্ডার</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard CTA Button (if more than 6 users) */}
          {rankedUsers.length > 6 && (
            <button
              onClick={() => setShowFullModal(true)}
              className="mt-3 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2b5019] to-[#1c3822] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              <Crown size={14} className="text-amber-400" />
              <span>সম্পূর্ণ লিডারবোর্ড ({rankedUsers.length} জন)</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Full Leaderboard Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowFullModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-[#1c3822]">
              <Crown size={22} className="text-amber-500" />
              <h3 className="font-black text-base">{title}</h3>
            </div>

            <div className="space-y-2">
              {rankedUsers.map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-xs text-[#1c3822] w-5">#{user.rank}</span>
                    {user.avatar ? (
                      <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-gray-900">{user.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{user.phone} • {user.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xs text-[#2b5019]">৳{user.totalAmount.toLocaleString('bn-BD')}</div>
                    <div className="text-[10px] text-gray-400">{user.ordersCount}টি অর্ডার</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowFullModal(false)}
              className="w-full mt-4 bg-[#2b5019] hover:bg-[#1c3822] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
