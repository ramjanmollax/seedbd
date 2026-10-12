import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ShoppingBag,
  Star,
  Sprout,
  Share2,
  Heart,
  Truck,
  ShieldCheck,
  Package,
  Leaf,
  Store,
  MessageSquarePlus,
  CheckCircle2,
  Maximize2,
  X,
  ZoomIn,
  MessageSquare,
  ThumbsUp,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Review } from '../types';
import { subscribeToReviews, submitCustomerReview } from '../lib/firestoreProducts';
import { compressImageFile, preloadImage, trackViewContent } from '../lib/utils';


// Expandable Description Component
function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || !text.trim()) return null;
  const lines = text.split('\n').filter(Boolean);
  const isLong = lines.length > 4 || text.length > 300;
  const visibleLines = isLong && !expanded ? lines.slice(0, 4) : lines;
  return (
    <div className="mt-3 px-1">
      <div className="relative">
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5">
          {visibleLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="mt-2 text-xs font-bold text-[#118137] hover:underline flex items-center gap-1"
        >
          {expanded ? '▲ কম দেখুন' : '▼ আরো দেখুন'}
        </button>
      )}
    </div>
  );
}

// Cultivation Guide Component
function CultivationGuide({ text }: { text: string }) {
  if (!text || !text.trim()) return null;

  let stepNum = 0;
  const blocks: { type: string; title?: string; body?: string; text?: string }[] = [];
  const rawLines = text.split('\n');

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i].trim();
    if (!line) { i++; continue; }
    const stepMatch = line.match(/^(ধাপ|step)\s*(\d+)?[\s\-—:：]*(.*)/i);
    if (stepMatch) {
      stepNum++;
      const title = stepMatch[3] || '';
      // next non-empty line as body
      let body = '';
      let j = i + 1;
      while (j < rawLines.length) {
        const next = rawLines[j].trim();
        if (!next) { j++; continue; }
        const isNext = /^(ধাপ|step|⚠️|❗|🚫|💡|✅|🌿|🌱)/i.test(next);
        if (isNext) break;
        body = next; i = j; break;
      }
      blocks.push({ type: 'step', title, body, text: String(stepNum) });
    } else if (/^[⚠️❗🚫]/.test(line) || /সতর্ক|warning|সাবধান/i.test(line)) {
      blocks.push({ type: 'warning', text: line.replace(/^[⚠️❗🚫]\s*/, '') });
    } else if (/^[💡✅🌿🌱]/.test(line) || /^টিপ|^tip/i.test(line)) {
      blocks.push({ type: 'tip', text: line.replace(/^[💡✅🌿🌱]\s*/, '') });
    } else {
      blocks.push({ type: 'text', text: line });
    }
    i++;
  }

  return (
    <section className="rounded-2xl border border-emerald-200 shadow-sm mt-3 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#118137] text-white">
        <Sprout className="w-4 h-4 shrink-0" />
        <h3 className="text-sm font-black tracking-wide">চাষ পদ্ধতি</h3>
      </div>
      <div className="bg-white p-4 space-y-4">
        {blocks.map((b, idx) => {
          if (b.type === 'step') return (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#118137] text-white text-xs font-black flex items-center justify-center shadow-sm">{b.text}</div>
              <div className="flex-1 pt-0.5">
                {b.title && <p className="text-sm font-bold text-slate-800 leading-snug">{b.title}</p>}
                {b.body && <p className="text-xs text-slate-600 leading-relaxed mt-1">{b.body}</p>}
              </div>
            </div>
          );
          if (b.type === 'warning') return (
            <div key={idx} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">{b.text}</p>
            </div>
          );
          if (b.type === 'tip') return (
            <div key={idx} className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">{b.text}</p>
            </div>
          );
          return <p key={idx} className="text-xs text-slate-600 leading-relaxed">{b.text}</p>;
        })}
      </div>
    </section>
  );
}


interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectCheckout?: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (catId: string) => void;
  allProducts?: Product[];
  cartCount?: number;
  onOpenCart?: () => void;
  userRating?: number;
  onRateProduct?: (productId: string, rating: number) => void;
  reviewEnabled?: boolean;
  currentUser?: { name: string; phone: string } | null;
  onOpenAuth: () => void;
  loginEnabled?: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onDirectCheckout,
  onSelectProduct,
  onSelectCategory,
  allProducts = [],
  cartCount = 0,
  onOpenCart,
  userRating,
  onRateProduct,
  reviewEnabled = true,
  currentUser,
  onOpenAuth,
  loginEnabled = true,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [product.id]);

  // Review states
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isUploadingDrive, setIsUploadingDrive] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (userRating) {
      setNewRating(userRating);
    }
  }, [userRating]);

  useEffect(() => {
    const unsub = subscribeToReviews((allReviews) => {
      const filtered = allReviews.filter(
        (r) =>
          String(r.productId || '') === String(product.id || '') ||
          (r.productName && product.name && r.productName.trim().toLowerCase() === product.name.trim().toLowerCase())
      );
      setReviewsList(filtered);
    }, false);

    return () => {
      unsub();
    };
  }, [product.id, product.name]);

  const averageRating = useMemo(() => {
    if (reviewsList.length === 0) return product.rating || 5.0;
    const approvedReviews = reviewsList.filter(r => r.status === 'approved' || !r.status);
    if (approvedReviews.length === 0) return product.rating || 5.0;
    const sum = approvedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return Number((sum / approvedReviews.length).toFixed(1));
  }, [reviewsList, product.rating]);

  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewErrorMsg(null);

    if (!currentUser) {
      setReviewErrorMsg('রিভিউ বা রেটিং দেওয়ার জন্য প্রথমে আপনাকে লগইন বা সাইন আপ করতে হবে।');
      onOpenAuth();
      return;
    }

    if (!newComment.trim()) {
      setReviewErrorMsg('দয়া করে আপনার মন্তব্য বা রিভিউ লিখুন।');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitCustomerReview({
        customerName: currentUser.name || 'গ্রাহক',
        customerPhoto: currentUser.photoUrl || '',
        productName: product.name,
        productId: product.id,
        rating: Number(newRating),
        comment: newComment.trim(),
        imageUrl: newImageUrl.trim(),
      });
      setNewComment('');
      setNewImageUrl('');
      setNewRating(5);
      setReviewSuccessMsg('আপনার রিভিউ ও ছবি সফলভাবে জমা হয়েছে!');
      setTimeout(() => setReviewSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewErrorMsg('রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const galleryList = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product.images, product.image]);

  // Preload all gallery images in browser cache for zero-delay instant switching
  useEffect(() => {
    if (galleryList.length > 0) {
      galleryList.forEach((url) => {
        if (url) preloadImage(url);
      });
    }
  }, [galleryList]);

  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setSelectedImageIndex(0);
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    });
  }, [product.id]);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('seedhaven_recently_viewed');
      let viewed: Product[] = stored ? JSON.parse(stored) : [];
      viewed = viewed.filter((p) => p.id !== product.id);
      viewed.unshift(product);
      viewed = viewed.slice(0, 5);
      sessionStorage.setItem('seedhaven_recently_viewed', JSON.stringify(viewed));
      setRecentlyViewed(viewed.filter((p) => p.id !== product.id));
    } catch (e) {
      console.error('Failed to update recently viewed:', e);
    }
  }, [product.id]);

  const categoryName = product.category || 'পণ্য কালেকশন';

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `${product.name} - Seed Haven BD`,
          url: window.location.href,
        })
        .catch(() => {});
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeImage = galleryList[selectedImageIndex] || galleryList[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafbfa] text-slate-800 pb-28 animate-pulse">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 h-16 border-b border-slate-100 flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-24 h-5 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </header>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <div className="w-full h-80 bg-gray-200 rounded-3xl"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-3/4 h-7 bg-gray-200 rounded-lg"></div>
            <div className="w-1/2 h-5 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-20 bg-gray-100 rounded-2xl"></div>
            <div className="h-20 bg-gray-100 rounded-2xl"></div>
          </div>
          <div className="h-14 bg-gray-200 rounded-2xl w-full mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfa] text-slate-800 pb-28">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 h-16 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-slate-200/80 bg-white shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="পিছনে যান"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        <h1 className="text-lg font-black text-[#118137] tracking-tight">
          পণ্য বিবরণ
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLiked((v) => !v)}
            className={`w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center transition-colors cursor-pointer ${
              isLiked ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-700 hover:text-rose-600'
            }`}
            aria-label="পছন্দের তালিকায় রাখুন"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onOpenCart || (() => onAddToCart(product, 0))}
            className="relative w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 hover:text-[#118137] transition-colors cursor-pointer"
            aria-label="কার্ট দেখুন"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#118137] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-8">
        {/* Desktop Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 select-none pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-[#118137] hover:text-[#0a5c26] flex items-center gap-1 font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>হোমপেজে ফিরুন</span>
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() => {
                onSelectCategory(product.category);
                onBack();
              }}
              className="hover:text-[#118137] transition-colors cursor-pointer"
            >
              {categoryName}
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Grid on Desktop / PC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Image Gallery & Thumbnails (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Main Image Showcase Card */}
            <section
              onClick={() => {
                setIsZoomedIn(false);
                setIsZoomModalOpen(true);
              }}
              className="relative w-full aspect-square rounded-[22px] overflow-hidden border border-slate-200/80 bg-[#f3f6f1] shadow-2xs flex items-center justify-center cursor-zoom-in group"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-[#f0f4ed]">
                  {product.imageEmoji || '🌱'}
                </div>
              )}

              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#118137] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs z-10">
                  -{discountPercent}%
                </div>
              )}

              {/* Zoom In Badge Overlay */}
              <div className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition-all shadow-md z-10 flex items-center gap-1 text-[11px] font-semibold px-2.5">
                <Maximize2 size={14} />
                <span className="hidden sm:inline">বড় করে দেখুন</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/40 text-white font-semibold text-xs px-2.5 py-1 rounded-full backdrop-blur-xs">
                {galleryList.length > 0 ? selectedImageIndex + 1 : 1}/
                {Math.max(galleryList.length, 1)}
              </div>
            </section>

            {/* Thumbnails Row */}
            {galleryList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#118137] ring-2 ring-[#118137]/20 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Ratings, Price, Specs, CTA (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title & Ratings */}
            <section className="pt-1">
              <span className="inline-block bg-emerald-100/70 text-[#118137] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-2">
                {categoryName}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mt-2 text-sm">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-extrabold text-[#118137] text-xs sm:text-sm">
                  {averageRating} ({reviewsList.length > 0 ? reviewsList.length : product.reviewsCount || 128} রিভিউ)
                </span>
              </div>

              {/* Price & Share */}
              <div className="flex items-center justify-between mt-3 pb-3 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#118137]">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base font-bold text-gray-400 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleShare}
                  className="relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#118137] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার</span>
                  {copied && (
                    <span className="absolute right-0 -top-8 whitespace-nowrap rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-white shadow-md">
                      লিঙ্ক কপি হয়েছে
                    </span>
                  )}
                </button>
              </div>
            </section>

              {/* Description */}
              <ExpandableDescription text={product.description || ''} />

            {/* Specifications Box - only show filled fields */}
            {(() => {
              const specs = [
                product.seedType ? { icon: 'leaf', label: 'বীজের ধরন', value: product.seedType } : null,
                (product.germinationDays || product.sproutDays) ? { icon: 'sprout', label: 'ফলন সময়', value: product.germinationDays || product.sproutDays } : null,
                (product.packSize || product.unit) ? { icon: 'package', label: 'পরিমাণ', value: product.packSize || product.unit } : null,
                product.germinationRate ? { icon: 'shield', label: 'অঙ্কুরোদগম হার', value: product.germinationRate } : null,
              ].filter(Boolean);
              if (specs.length === 0) return null;
              return (
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden mt-3">
                  <div className="grid grid-cols-2 text-xs sm:text-sm">
                    {(specs as any[]).map((spec, i) => (
                      <div key={i} className={`p-3.5 flex items-start gap-2.5 min-w-0 ${i % 2 === 0 ? "border-r" : ""} ${i < specs.length - 2 ? "border-b" : ""} border-slate-100`}>
                        {spec.icon === "leaf" && <Leaf className="w-5 h-5 text-[#118137] mt-0.5 shrink-0" />}
                        {spec.icon === "sprout" && <Sprout className="w-5 h-5 text-[#118137] mt-0.5 shrink-0" />}
                        {spec.icon === "package" && <Package className="w-5 h-5 text-[#118137] mt-0.5 shrink-0" />}
                        {spec.icon === "shield" && <ShieldCheck className="w-5 h-5 text-[#118137] mt-0.5 shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-400 text-[11px] font-medium">{spec.label}</p>
                          <p className="font-bold text-slate-800 mt-0.5 text-xs sm:text-sm break-words">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Cultivation Guide Box */}
            {product.cultivationGuide && <CultivationGuide text={product.cultivationGuide} />}

            {/* Delivery Box */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-3.5 flex items-center gap-2.5 shadow-2xs text-xs sm:text-sm font-semibold text-slate-700">
              <Truck className="w-5 h-5 text-[#118137] shrink-0" />
              <p className="leading-snug">
                ডেলিভারি সময়:{' '}
                <span className="text-[#118137] font-bold">২-৩ দিন (সারা বাংলাদেশ)</span>
              </p>
            </section>

            {/* Quantity Box */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-3 flex items-center justify-between shadow-2xs text-xs sm:text-sm font-bold text-slate-700">
              <span>পরিমাণ (প্যাকেট)</span>
              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  −
                </button>
                <span className="w-9 text-center font-black text-slate-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </section>

            {/* Desktop & Tablet Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 h-12 rounded-2xl border-2 border-[#118137] bg-emerald-50/60 hover:bg-emerald-100 text-[#118137] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>কার্টে যোগ করুন</span>
              </button>
              <button
                onClick={() =>
                  onDirectCheckout
                    ? onDirectCheckout(product, quantity)
                    : onAddToCart(product, quantity)
                }
                className="flex-1 h-12 rounded-2xl bg-[#118137] hover:bg-[#0d6b2c] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-800/20 transition-all cursor-pointer active:scale-98"
              >
                <span>এখনই কিনুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-3 pb-3 space-y-3">
            <h3 className="text-base font-bold text-slate-900">আরও কিছু প্রয়োজনীয় বীজ</h3>
            <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-none snap-x">
              {relatedProducts.map((relProduct) => (
                <button
                  key={relProduct.id}
                  onClick={() => onSelectProduct(relProduct)}
                  className="w-40 sm:w-44 shrink-0 snap-start bg-white rounded-2xl border border-slate-200/80 p-2.5 text-left hover:border-emerald-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2">
                      {relProduct.image ? (
                        <img
                          src={relProduct.image}
                          alt={relProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {relProduct.imageEmoji || '🌱'}
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {relProduct.name}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xs font-extrabold text-[#118137]">
                      ৳{relProduct.price}
                    </span>
                    {relProduct.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ৳{relProduct.originalPrice}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        {reviewEnabled !== false && !product.disableReviews && (
          <section className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl border border-emerald-100/80 p-4 sm:p-5 shadow-sm space-y-5 mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 border-b border-emerald-100/60 pb-3">
              <MessageSquare className="w-5 h-5 text-[#118137]" />
              <h3 className="text-base sm:text-lg font-black text-[#1c3822]">
                গ্রাহকদের রিভিউ ও রেটিং
              </h3>
            </div>





          {/* Reviews Header & Sort Filter */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="font-bold text-slate-800 text-sm">গ্রাহকদের মতামত</h4>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#118137]" />
              <span>সাম্প্রতিক আগে</span>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviewsList.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-white border border-dashed border-emerald-200 text-slate-500 text-xs space-y-1">
                <p className="font-semibold text-slate-700">এই পণ্যের জন্য এখনও কোনো রিভিউ জমা হয়নি।</p>
                <p className="text-[11px] text-slate-400">নিচের ফর্ম পূরণ করে প্রথম রিভিউটি প্রদান করুন!</p>
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3 text-xs transition-all hover:border-emerald-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#118137] font-black flex items-center justify-center text-sm shadow-2xs">
                        {(rev.customerName || 'ক')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{rev.customerName || 'কাস্টমার'}</span>
                          <span className="bg-[#f0f8f1] text-[#118137] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-0.5">
                            🌱 VERIFIED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.floor(rev.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-extrabold text-slate-700">{rev.rating || 5}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">সদ্য প্রকাশিত</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <p className="text-slate-700 leading-relaxed font-medium flex-1">
                      {rev.comment}
                    </p>
                    {rev.imageUrl && (
                      <div className="relative group shrink-0">
                        <img
                          src={rev.imageUrl}
                          alt="Review attachment"
                          loading="eager"
                          decoding="async"
                          className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs cursor-zoom-in group-hover:scale-105 transition-transform"
                          onClick={() => setSelectedReviewImage(rev.imageUrl)}
                        />
                        <div
                          className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-zoom-in pointer-events-none"
                        >
                          <Maximize2 size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View More Reviews Button */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-between px-4">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#118137]" />
              <span>সকল অনুমোদিত রিভিউ লোড করা আছে</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">১০০% জেনুইন</span>
          </div>

          {/* Write Review Button / Form */}
          {(loginEnabled !== false && !currentUser) ? (
            <div className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#118137] flex items-center justify-center mx-auto">
                <MessageSquarePlus size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">রিভিউ বা রেটিং দিতে চান?</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  আপনার মতামত জানাতে প্রথমে আপনার অ্যাকাউন্ট দিয়ে লগইন করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full h-10 rounded-xl bg-[#118137] hover:bg-[#0d6b2c] text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>লগইন বা সাইন আপ করুন</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-emerald-100/80 space-y-3.5 bg-white p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#118137] text-white flex items-center justify-center">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">আপনার রিভিউ লিখুন</h4>
                  <p className="text-[10px] text-slate-500">আপনার অভিজ্ঞতা শেয়ার করুন</p>
                </div>
              </div>

              {userRating && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-900">আপনার দেওয়া রেটিং: {userRating} স্টার</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/60 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                    সংরক্ষিত আছে
                  </span>
                </div>
              )}

              {reviewSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#118137] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              {reviewErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{reviewErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">রেটিং নির্বাচন করুন</label>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-hidden cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || newRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {newRating} / ৫ স্টার
                  </span>
                </div>
              </div>



              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">আপনার মন্তব্য (সংক্ষিপ্ত) *</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="বীজের মান ও ফলন সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                  rows={2.5}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#118137] focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  গ্যালারি / ডিভাইস থেকে ছবি যুক্ত করুন (ঐচ্ছিক)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isOptimizingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setIsOptimizingImage(true);
                          const res = await compressImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.82 });
                          setNewImageUrl(res.dataUrl);
                          setReviewSuccessMsg(`ছবি সফলভাবে অপ্টিমাইজ হয়েছে (${res.compressedSizeKb} KB)!`);
                        } catch (err: any) {
                          setReviewSuccessMsg('ছবি লোড করা যায়নি: ' + (err.message || 'Error'));
                        } finally {
                          setIsOptimizingImage(false);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#118137] hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {isOptimizingImage && (
                    <span className="text-xs text-emerald-600 font-bold animate-pulse whitespace-nowrap">
                      অপ্টিমাইজ হচ্ছে...
                    </span>
                  )}
                </div>
                {newImageUrl && (
                  <div className="mt-2.5 flex items-center gap-3 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                    <img src={newImageUrl} alt="Review Preview" className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shadow-xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-emerald-800">ছবি প্রস্তুত (সুপার ফাস্ট লোডিং)</p>
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="text-[10px] text-rose-600 font-bold hover:underline mt-0.5 cursor-pointer"
                      >
                        ছবি মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full h-11 rounded-xl bg-[#2c5828] hover:bg-[#1b3d18] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{isSubmittingReview ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}</span>
              </button>
            </form>
          )}
        </section>
        )}


      </main>

      {/* Sticky Bottom Bar on mobile screens */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 px-3 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] flex items-center gap-2.5">
        <button
          onClick={() => {
            onSelectCategory('all');
            onBack();
          }}
          className="w-14 h-11 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
        >
          <Store className="w-4 h-4 text-[#118137]" />
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">দোকান</span>
        </button>

        <button
          onClick={() => onAddToCart(product, quantity)}
          className="flex-1 h-11 rounded-xl border-2 border-[#118137] bg-white text-[#118137] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>কার্টে যোগ করুন</span>
        </button>

        <button
          onClick={() =>
            onDirectCheckout
              ? onDirectCheckout(product, quantity)
              : onAddToCart(product, quantity)
          }
          className="flex-1 h-11 rounded-xl bg-[#118137] hover:bg-[#0d6b2c] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-800/20 active:scale-98 transition-all cursor-pointer"
        >
          <span>এখনই কিনুন</span>
        </button>
      </div>

      {/* Image Zoom / Expand Modal Lightbox */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                {product.name} ({selectedImageIndex + 1}/{Math.max(galleryList.length, 1)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomedIn(!isZoomedIn)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ZoomIn size={14} />
                <span>{isZoomedIn ? 'কম্প্যাক্ট' : 'জুম (2x)'}</span>
              </button>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close zoom"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Zoomable Image Container */}
          <div
            className="relative w-full max-w-3xl max-h-[75vh] flex items-center justify-center overflow-auto p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
          >
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className={`max-h-[70vh] object-contain rounded-2xl transition-transform duration-300 cursor-zoom-in ${
                  isZoomedIn ? 'scale-175 cursor-zoom-out' : 'scale-100'
                }`}
              />
            ) : (
              <div className="text-9xl bg-white/10 p-12 rounded-3xl">
                {product.imageEmoji || '🌱'}
              </div>
            )}
          </div>

          <p className="text-white/60 text-xs mt-3 text-center">
            {isZoomedIn ? 'ছবির ওপর ক্লিক করে স্বাভাবিক আকারে আনুন' : 'ছবির ওপর ক্লিক করে বড় (Zoom) করুন বা ওপরের জুম বাটনে ক্লিক করুন'}
          </p>

          {/* Modal Thumbnails */}
          {galleryList.length > 1 && (
            <div
              className="absolute bottom-6 flex items-center gap-2 bg-black/60 p-2 rounded-2xl backdrop-blur-md border border-white/10 z-20 max-w-full overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryList.map((imgUrl, idx) => (
                <button
                  key={`zoom-thumb-${idx}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Image Preview Lightbox */}
      {selectedReviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReviewImage(null)}
        >
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              কাস্টমার রিভিউ ছবি
            </span>
            <button
              onClick={() => setSelectedReviewImage(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div
            className="relative max-w-3xl max-h-[85vh] p-2 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedReviewImage}
              alt="Customer Review"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
};
