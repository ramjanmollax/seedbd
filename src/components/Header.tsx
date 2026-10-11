import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Search,
  Heart,
  Scale,
  Truck,
  Phone,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';
import { StoreSettings, HomepageSettings } from '../lib/firestoreProducts';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu?: () => void;
  storeSettings?: StoreSettings;
  homepageSettings?: HomepageSettings;
  currentUser?: { name: string; phone: string; email?: string; photoUrl?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenTracker?: () => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenCompare?: () => void;
  compareCount?: number;
  onSelectCategory?: (id: string) => void;
  onOpenSearch?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  storeSettings,
  homepageSettings,
  currentUser,
  onOpenAuth,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenCompare,
  compareCount = 0,
  onSelectCategory,
  onOpenSearch,
  onOpenTracker,
  onNavigateHome,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    setLogoError(false);
  }, [storeSettings?.logo]);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-xs">
      {/* ========================================================= */}
      {/* 1. TOP ANNOUNCEMENT BAR (PC / TABLET) */}
      {/* ========================================================= */}
      {homepageSettings?.topBarEnabled !== false && (
        <div className="hidden md:block bg-[#07361a] text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Highlights */}
            <div className="flex items-center gap-4 text-emerald-100/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-yellow-400" />
                <span>
                  হেল্পলাইন:{' '}
                  <a
                    href={`tel:${homepageSettings?.topBarPhone || '01410136900'}`}
                    className="text-white font-bold hover:underline"
                  >
                    {homepageSettings?.topBarPhone || '01410136900'}
                  </a>{' '}
                  ({homepageSettings?.topBarHours || 'সকাল ৯টা - রাত ৮টা'})
                </span>
              </span>
              <span className="text-emerald-700">•</span>
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-emerald-400" />
                <span>{homepageSettings?.topBarDelivery || 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি'}</span>
              </span>
              <span className="text-emerald-700">•</span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                <Sparkles size={12} />
                <span>{homepageSettings?.topBarGuarantee || '১০০% খাঁটি ও অঙ্কুরোদগম গ্যারান্টি'}</span>
              </span>
            </div>

            {/* Right Brand Tagline */}
            <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>{homepageSettings?.topBarTagline || 'Seed Haven BD - বিশুদ্ধ বীজ ও গার্ডেন শপ'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN HEADER (RESPONSIVE: MOBILE & DESKTOP) */}
      {/* ========================================================= */}
      <header className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Left: Menu Toggle & Brand Logo with Store Name */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Menu Button (Mobile & Desktop) */}
          <button
            onClick={onOpenMenu}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-[#1c3822] transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-emerald-200"
            aria-label="Menu"
            title="মেনুবার খুলুন"
          >
            <Menu size={22} className="text-[#1c3822]" />
            <span className="hidden md:inline text-xs font-bold text-[#1c3822]">মেনু</span>
          </button>

          {/* Brand Logo & Store Name */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateHome) onNavigateHome();
            }}
            className="flex items-center gap-2 sm:gap-2.5 group select-none cursor-pointer min-w-0"
            title={storeSettings?.name || "Seed Haven BD"}
          >
            {storeSettings?.logo && !logoError ? (
              <>
                <img
                  src={storeSettings.logo}
                  alt={storeSettings?.name || "Seed Haven BD"}
                  onError={() => setLogoError(true)}
                  className="h-8 sm:h-9 md:h-10 w-auto max-w-[65px] sm:max-w-[110px] md:max-w-[150px] object-contain shrink-0 rounded-md"
                />
                <div className="flex flex-col justify-center leading-none min-w-0">
                  <div className="font-black text-base sm:text-lg md:text-xl tracking-tight text-[#16331b] truncate max-w-[115px] sm:max-w-[180px] md:max-w-[240px]">
                    {storeSettings?.name || "Seed Haven BD"}
                  </div>
                  <span className="hidden sm:block text-[9px] font-bold text-emerald-800/70 tracking-wider uppercase mt-0.5 truncate max-w-[180px]">
                    {homepageSettings?.topBarTagline || "বিশুদ্ধ বীজ ও গার্ডেন শপ"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#15803d] flex items-center justify-center text-white shadow-xs shrink-0 text-base sm:text-lg">
                  🌱
                </div>
                {/* Brand Short Form: SHBD */}
                <div className="flex flex-col justify-center leading-none min-w-0">
                  <div className="font-black text-xl sm:text-2xl tracking-tight flex items-center">
                    <span className="text-[#16331b]">SH</span>
                    <span className="text-[#15803d]">BD</span>
                  </div>
                  <span className="hidden sm:block text-[9px] font-bold text-emerald-800/70 tracking-wider uppercase mt-0.5">
                    {storeSettings?.name || "Seed Haven BD"}
                  </span>
                </div>
              </>
            )}
          </a>
        </div>

        {/* Center: Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center relative">
          <div className="relative w-full flex items-center">
            <Search size={18} className="absolute left-3.5 text-emerald-800 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                scrollToProducts();
              }}
              placeholder="বীজ, ক্যাটাগরি বা পণ্যের নাম দিয়ে সার্চ করুন..."
              className="w-full pl-10 pr-24 py-2.5 bg-[#f8faf5] hover:bg-white focus:bg-white border-2 border-emerald-600/40 focus:border-[#15803d] rounded-full text-xs sm:text-sm text-[#093d20] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-16 p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
                title="ক্লিয়ার করুন"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={scrollToProducts}
              className="absolute right-1.5 px-4 py-1.5 bg-[#15803d] hover:bg-[#0f602c] text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              খুঁজুন
            </button>
          </div>
        </div>

        {/* Right Actions: Mobile Search, Compare, Wishlist, User, Cart */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Search"
              title="পণ্য খুঁজুন"
            >
              <Search size={20} className="text-[#1c3822]" />
            </button>
          )}

          {/* Compare (Desktop only) */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="hidden lg:flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-emerald-800 transition-colors cursor-pointer text-xs font-bold relative"
              title="পণ্য তুলনা করুন"
            >
              <Scale size={18} className="text-gray-600" />
              <span className="hidden xl:inline">তুলনা</span>
              {compareCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-amber-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          {/* Wishlist (Desktop only) */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className="hidden lg:flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-rose-600 transition-colors cursor-pointer text-xs font-bold relative"
              title="উইশলিস্ট / পছন্দ"
            >
              <Heart size={18} className={wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-gray-600'} />
              <span className="hidden xl:inline">পছন্দ</span>
              {wishlistCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Auth */}
          {storeSettings?.loginEnabled !== false && (
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-[#093d20] transition-colors cursor-pointer text-xs font-bold"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name || 'আমার একাউন্ট'}</span>
                    <ChevronDown size={14} className="text-emerald-700 hidden sm:inline" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{currentUser.phone}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>লগআউট করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c3822] hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <User size={16} className="text-gray-600" />
                  <span>লগইন</span>
                </button>
              )}
            </div>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#15803d] hover:bg-[#0f602c] active:scale-95 text-white transition-all shadow-md shadow-emerald-800/20 cursor-pointer relative"
            aria-label="Cart"
          >
            <ShoppingCart
              size={20}
              className={`transition-transform ${isAnimating ? 'scale-125' : ''}`}
            />
            <span className="hidden sm:inline text-xs font-bold">কার্ট</span>
            <span
              className={`min-w-[20px] h-[20px] bg-yellow-400 text-slate-950 rounded-full text-[11px] font-black flex items-center justify-center px-1 transition-all duration-300 ${
                isAnimating ? 'scale-125 ring-4 ring-yellow-200' : ''
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </header>
    </div>
  );
};
