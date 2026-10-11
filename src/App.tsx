import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductCard, ProductCardSkeleton } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { QuickSearchModal } from './components/QuickSearchModal';
import { ContactModal } from './components/ContactModal';
import { PolicyModal } from './components/PolicyModal';
import { ClearanceBanner } from './components/ClearanceBanner';
import { NoticePopupModal } from './components/NoticePopupModal';
import { MenuDrawer } from './components/MenuDrawer';
import { OrderTrackerPage } from './components/OrderTrackerModal';
import { PromoSection, LeaderboardSection, BlogSection, TrustSection } from './components/MarketingSections';
import { MarqueeSection } from './components/MarqueeSection';
import { ProductCompareModal } from './components/ProductCompareModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { OrderMemoModal } from './components/OrderMemoModal';
import { Scale, CheckCircle2, X, ChevronLeft, MessageCircle } from 'lucide-react';
import { trackAddToCart, trackPurchase } from './lib/utils';
import { CartItem, OrderDetails, Product, Category, Banner, Coupon } from './types';
import { IntegrationsSettings, DEFAULT_INTEGRATIONS_SETTINGS } from './types/integrations';
import { applyClientIntegrations, trackUnifiedEvent, syncCanonicalUrl } from './lib/integrationsManager';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToFooterSettings,
  subscribeToHomepageSettings,
  subscribeToNoticeSettings,
  subscribeToContactSettings,
  subscribeToPolicySettings,
  subscribeToSeoSettings,
  subscribeToStoreSettings,
  subscribeToMenuSettings,
  subscribeToIntegrationsSettings,
  subscribeToBanners,
  subscribeToCoupons,

  FooterSettings,
  HomepageSettings,
  NoticeSettings,
  ContactSettings,
  PolicySettings,
  SeoSettings,
  StoreSettings,
  MenuSettings,
  DEFAULT_HOMEPAGE_SETTINGS,
  DEFAULT_NOTICE_SETTINGS,
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_POLICY_SETTINGS,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_MENU_SETTINGS,
  saveOrderFirebase,
  subscribeToOrders,
  recordVisitor,
  subscribeToProductRatings,
  saveProductRatingFirebase,
} from './lib/firestoreProducts';

const ToastNotification: React.FC<{
  message: string | null;
  onClose: () => void;
  duration?: number;
}> = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#063d24] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-[#49a845]/60 backdrop-blur-xs">
        <CheckCircle2 size={18} className="text-[#49a845] shrink-0" />
        <span className="text-xs sm:text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 p-0.5 text-gray-300 hover:text-white rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

function getCachedSettings<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`seedhaven_${key}`);
    if (saved) {
      return { ...defaultValue, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultValue;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pathname = location.pathname.toLowerCase();

  // Route matches
  const productMatch = location.pathname.match(/^\/(?:product|products)\/([^/]+)/i);
  const routeProductId = productMatch ? decodeURIComponent(productMatch[1]) : null;

  const categoryMatch = location.pathname.match(/^\/(?:category|categories)\/([^/]+)/i);
  const routeCategoryId = categoryMatch ? decodeURIComponent(categoryMatch[1]) : null;

  const isOrderTrackerRoute = pathname === '/track-order' || pathname === '/track';
  const isProductsRoute = pathname === '/products';

  // Modals & Panels derived from URL
  const isAboutRoute = pathname === '/about' || pathname === '/about-us';
  const isContactRoute = pathname === '/contact' || pathname === '/contact-us';
  const isPrivacyRoute = pathname === '/privacy' || pathname === '/privacy-policy';
  const isTermsRoute = pathname === '/terms' || pathname === '/terms-conditions';
  const isRefundRoute = pathname === '/refund' || pathname === '/refund-policy';
  const isShippingRoute = pathname === '/shipping' || pathname === '/shipping-policy';
  const isCartOpen = pathname === '/cart';
  const isWishlistModalOpen = pathname === '/wishlist';
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getCachedSettings('store', DEFAULT_STORE_SETTINGS));

  const isCompareModalOpen = pathname === '/compare';
  const isAuthModalOpen = (pathname === '/login' || pathname === '/auth' || pathname === '/account') && storeSettings?.loginEnabled !== false;
  const isSearchOpen = pathname === '/search';

  const isContactOpen = isAboutRoute || isContactRoute;
  const contactModalTab: 'about' | 'contact' = isAboutRoute ? 'about' : 'contact';

  const isPolicyOpen = isPrivacyRoute || isTermsRoute || isRefundRoute || isShippingRoute;
  const policyModalTab: 'privacy' | 'terms' | 'refund' | 'shipping' = isTermsRoute
    ? 'terms'
    : isRefundRoute
    ? 'refund'
    : isShippingRoute
    ? 'shipping'
    : 'privacy';

  // Products State (Real-time synced with Firebase Firestore)
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Active Product derived from route parameter
  const activeProduct = useMemo(() => {
    if (!routeProductId) return null;
    return (
      productsList.find((p) => p.id === routeProductId || (p as any).slug === routeProductId) ||
      null
    );
  }, [routeProductId, productsList]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [bannersList, setBannersList] = useState<Banner[]>([]);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(() => getCachedSettings('footer', {}));
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => getCachedSettings('homepage', DEFAULT_HOMEPAGE_SETTINGS));
  const [noticeSettings, setNoticeSettings] = useState<NoticeSettings>(() => getCachedSettings('notice', DEFAULT_NOTICE_SETTINGS));
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => getCachedSettings('contact', DEFAULT_CONTACT_SETTINGS));
  const [policySettings, setPolicySettings] = useState<PolicySettings>(() => getCachedSettings('policies', DEFAULT_POLICY_SETTINGS));
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(() => getCachedSettings('seo', DEFAULT_SEO_SETTINGS));
  const [menuSettings, setMenuSettings] = useState<MenuSettings>(() => getCachedSettings('menu', DEFAULT_MENU_SETTINGS));
  const [integrationsSettings, setIntegrationsSettings] = useState<IntegrationsSettings>(DEFAULT_INTEGRATIONS_SETTINGS);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [ordersList, setOrdersList] = useState<OrderDetails[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('seedhaven_user_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [memoOrder, setMemoOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('seedhaven_user_ratings', JSON.stringify(userRatings));
    } catch (e) {
      console.error('Failed to save user ratings', e);
    }
  }, [userRatings]);

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleRateProduct = async (productId: string, rating: number) => {
    setUserRatings((prev) => ({
      ...prev,
      [productId]: rating,
    }));
    await saveProductRatingFirebase(productId, rating);
  };

  const handleClearWishlist = () => {
    setWishlist([]);
  };

  useEffect(() => {
    const unsubscribe = subscribeToProductRatings((ratingsMap) => {
      setUserRatings((prev) => ({
        ...prev,
        ...ratingsMap,
      }));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= 3) {
          alert('সর্বোচ্চ ৩টি পণ্য একসাথে তুলনা করা যাবে।');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  // Subscribe to Firebase Firestore live products, categories, banners, homepage, footer, notice, contact, policy, SEO, store settings & orders
  useEffect(() => {
    recordVisitor();
    const unsubProd = subscribeToProducts((products) => {
      setProductsList(products || []);
      setIsLoadingProducts(false);
    });

    const unsubCat = subscribeToCategories((cats) => {
      setCategoriesList(cats || []);
      setIsLoadingCategories(false);
    });

    const unsubBanners = subscribeToBanners((bns) => {
      setBannersList(bns || []);
    });

    const unsubCoupons = subscribeToCoupons((coupons) => {
      setCouponsList(coupons || []);
    });

    const unsubOrders = subscribeToOrders((orders) => {
      setOrdersList(orders || []);
      setIsLoadingOrders(false);
    });

    const unsubFooter = subscribeToFooterSettings((settings) => {
      const val = settings || {};
      setFooterSettings(val);
      try { localStorage.setItem('seedhaven_footer', JSON.stringify(val)); } catch {}
    });

    const unsubHomepage = subscribeToHomepageSettings((settings) => {
      const val = settings || DEFAULT_HOMEPAGE_SETTINGS;
      setHomepageSettings(val);
      try { localStorage.setItem('seedhaven_homepage', JSON.stringify(val)); } catch {}
    });

    const unsubNotice = subscribeToNoticeSettings((settings) => {
      const val = settings || DEFAULT_NOTICE_SETTINGS;
      setNoticeSettings(val);
      try { localStorage.setItem('seedhaven_notice', JSON.stringify(val)); } catch {}
    });

    const unsubContact = subscribeToContactSettings((settings) => {
      const val = settings || DEFAULT_CONTACT_SETTINGS;
      setContactSettings(val);
      try { localStorage.setItem('seedhaven_contact', JSON.stringify(val)); } catch {}
    });

    const unsubPolicy = subscribeToPolicySettings((settings) => {
      const val = settings || DEFAULT_POLICY_SETTINGS;
      setPolicySettings(val);
      try { localStorage.setItem('seedhaven_policies', JSON.stringify(val)); } catch {}
    });

    const unsubSeo = subscribeToSeoSettings((settings) => {
      const val = settings || DEFAULT_SEO_SETTINGS;
      setSeoSettings(val);
      try { localStorage.setItem('seedhaven_seo', JSON.stringify(val)); } catch {}
    });

    const unsubStore = subscribeToStoreSettings((settings) => {
      const val = settings || DEFAULT_STORE_SETTINGS;
      setStoreSettings(val);
      try { localStorage.setItem('seedhaven_store', JSON.stringify(val)); } catch {}
    });

    const unsubMenu = subscribeToMenuSettings((settings) => {
      const val = settings || DEFAULT_MENU_SETTINGS;
      setMenuSettings(val);
      try { localStorage.setItem('seedhaven_menu', JSON.stringify(val)); } catch {}
    });

    const unsubIntegrations = subscribeToIntegrationsSettings((settings) => {
      if (settings) {
        setIntegrationsSettings(settings);
      }
    });

    return () => {
      unsubProd();
      unsubCat();
      unsubBanners();
      unsubCoupons();
      unsubOrders();
      unsubFooter();
      unsubHomepage();
      unsubNotice();
      unsubContact();
      unsubPolicy();
      unsubSeo();
      unsubStore();
      unsubMenu();
      unsubIntegrations();
    };
  }, []);

  // Dynamic document head & SEO updates based on route
  useEffect(() => {
    let pageTitle = seoSettings.siteTitle || 'Seed Haven BD - মানসম্মত বীজের নির্ভরযোগ্য শপ';

    if (routeProductId) {
      if (activeProduct) {
        pageTitle = `${activeProduct.name} | ${storeSettings.name || 'Seed Haven BD'}`;
      } else {
        pageTitle = `পণ্য বিবরণী | ${storeSettings.name || 'Seed Haven BD'}`;
      }
    } else if (isOrderTrackerRoute) {
      pageTitle = `অর্ডার ট্র্যাক | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isAboutRoute) {
      pageTitle = `আমাদের সম্পর্কে | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isContactRoute) {
      pageTitle = `যোগাযোগ ও হেল্পলাইন | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isPrivacyRoute) {
      pageTitle = `গোপনীয়তা নীতি | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isTermsRoute) {
      pageTitle = `শর্তাবলী | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isRefundRoute) {
      pageTitle = `রিটার্ন ও রিফান্ড নীতি | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isShippingRoute) {
      pageTitle = `শিপিং ও ডেলিভারি | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isCartOpen) {
      pageTitle = `শপিং কার্ট | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isWishlistModalOpen) {
      pageTitle = `পছন্দের তালিকা | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isCompareModalOpen) {
      pageTitle = `পণ্য তুলনা | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isAuthModalOpen) {
      pageTitle = `লগইন | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (isProductsRoute) {
      pageTitle = `সকল বীজ ও কৃষি পণ্য | ${storeSettings.name || 'Seed Haven BD'}`;
    } else if (routeCategoryId) {
      const catObj = categoriesList.find((c) => c.id === routeCategoryId);
      pageTitle = `${catObj ? catObj.name : 'ক্যাটাগরি'} | ${storeSettings.name || 'Seed Haven BD'}`;
    }

    document.title = pageTitle;

    // Helper to set or create meta tag
    const setMetaTag = (nameAttr: string, attrVal: string, contentVal?: string) => {
      if (!contentVal) return;
      let el = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    setMetaTag('name', 'description', activeProduct?.description || seoSettings.description);
    setMetaTag('name', 'keywords', seoSettings.keywords);
    setMetaTag('name', 'google-site-verification', seoSettings.googleVerification);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', activeProduct?.description || seoSettings.description);
    setMetaTag('property', 'og:image', activeProduct?.image || seoSettings.ogImage);

    // Favicon update
    if (storeSettings.favicon) {
      let iconEl = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconEl) {
        iconEl = document.createElement('link');
        iconEl.rel = 'shortcut icon';
        document.head.appendChild(iconEl);
      }
      iconEl.href = storeSettings.favicon;
    }

    // Apply Client Integrations (Pixel, GA4, GTM, Clarity, TikTok, Pinterest, Meta Verification, Schemas)
    applyClientIntegrations(integrationsSettings);

    // Sync Canonical URL
    const canonicalBase = integrationsSettings?.seo?.canonicalBaseUrl || 'https://seedhavenbd.com';
    syncCanonicalUrl(canonicalBase, location.pathname);

    // Track PageView on route change across active platforms
    trackUnifiedEvent('PageView', {
      page_path: location.pathname,
      page_title: pageTitle,
    }, integrationsSettings);
  }, [
    seoSettings,
    storeSettings,
    integrationsSettings,
    location.pathname,
    routeProductId,
    activeProduct,
    isOrderTrackerRoute,
    isAboutRoute,
    isContactRoute,
    isPrivacyRoute,
    isTermsRoute,
    isRefundRoute,
    isShippingRoute,
    isCartOpen,
    isWishlistModalOpen,
    isCompareModalOpen,
    isAuthModalOpen,
    isProductsRoute,
    routeCategoryId,
    categoriesList,
  ]);

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string; email?: string; photoUrl?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('seedhaven_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleOpenAuth = () => {
    if (storeSettings?.loginEnabled === false) return;
    navigate('/login');
  };

  // Per-user storage keys
  const userCartKey = currentUser ? `seedhaven_cart_${currentUser.phone}` : 'seedhaven_cart_guest';
  const userWishlistKey = currentUser ? `seedhaven_wishlist_${currentUser.phone}` : 'seedhaven_wishlist_guest';

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(userCartKey) || localStorage.getItem('seedhaven_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(userWishlistKey) || localStorage.getItem('seedhaven_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart and wishlist whenever user or items change
  useEffect(() => {
    try {
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
      localStorage.setItem('seedhaven_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cartItems, userCartKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
      localStorage.setItem('seedhaven_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist, userWishlistKey]);

  // When user logs in, load their specific cart & wishlist if available
  const handleLoginSuccess = (user: { name: string; phone: string; email?: string; photoUrl?: string }) => {
    setCurrentUser(user);
    try {
      const savedCart = localStorage.getItem(`seedhaven_cart_${user.phone}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem(`seedhaven_wishlist_${user.phone}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('seedhaven_current_user');
    setCartItems([]);
    setWishlist([]);
  };

  // Menu Drawer State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync category or search parameters from URL
  useEffect(() => {
    if (routeCategoryId) {
      setSelectedCategory(routeCategoryId);
    } else {
      const catParam = searchParams.get('category') || searchParams.get('cat');
      if (catParam) {
        setSelectedCategory(catParam);
      }
    }

    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== undefined) {
      setSearchQuery(qParam);
    }
  }, [routeCategoryId, searchParams]);

  // Scroll on page route change
  useEffect(() => {
    const isModalRoute =
      isCartOpen ||
      isWishlistModalOpen ||
      isCompareModalOpen ||
      isAuthModalOpen ||
      isSearchOpen ||
      isContactOpen ||
      isPolicyOpen;

    if (!isModalRoute) {
      if (isProductsRoute || routeCategoryId) {
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (!routeProductId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [location.pathname]);

  // Session navigation counter to track internal SPA history depth
  const [sessionNavCount, setSessionNavCount] = useState<number>(0);
  const isInitialLocation = useRef(true);

  // Setup base home in history stack if landing directly on a subroute (e.g. from social media or direct link)
  useEffect(() => {
    if (isInitialLocation.current) {
      isInitialLocation.current = false;
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        try {
          window.history.replaceState({ page: 'home' }, '', '/');
          window.history.pushState({ page: 'subroute' }, '', currentUrl);
          setSessionNavCount(1);
        } catch (e) {
          console.error('Failed to initialize base history:', e);
        }
      }
      return;
    }
    setSessionNavCount((prev) => prev + 1);
  }, [location.pathname]);

  // Sync Menu Drawer with browser history so pressing phone/browser Back button closes the drawer
  useEffect(() => {
    if (isMenuOpen) {
      window.history.pushState({ modal: 'menu' }, '');
      const handlePopState = () => {
        setIsMenuOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isMenuOpen]);

  // Navigation handlers
  const handleSelectProduct = (product: Product | null) => {
    if (product) {
      trackUnifiedEvent('ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
      }, integrationsSettings);
      navigate(`/product/${product.id}`);
    } else {
      navigate('/products');
    }
  };

  const handleOpenOrderTracker = (open: boolean) => {
    if (open) {
      navigate('/track-order');
    } else {
      handleCloseModal();
    }
  };

  const handleOpenCart = (open: boolean) => {
    if (open) {
      navigate('/cart');
    } else {
      handleCloseModal();
    }
  };

  const handleOpenMenu = (open: boolean) => {
    setIsMenuOpen(open);
  };

  const handleOpenSearch = (open: boolean) => {
    if (open) {
      navigate('/search');
    } else {
      handleCloseModal();
    }
  };

  const handleOpenContact = (open: boolean, tab: 'about' | 'contact' = 'contact') => {
    if (open) {
      navigate(tab === 'about' ? '/about' : '/contact');
    } else {
      handleCloseModal();
    }
  };

  const handleOpenPolicy = (open: boolean, tab: 'privacy' | 'terms' | 'refund' | 'shipping' = 'privacy') => {
    if (open) {
      navigate(`/${tab || 'privacy'}`);
    } else {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    if (sessionNavCount > 0 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleBackFromProduct = () => {
    if (sessionNavCount > 0 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleBackFromTracker = () => {
    if (sessionNavCount > 0 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  // Lock body scroll when drawer/modal is open
  const isAnyModalOpen =
    isMenuOpen ||
    isCartOpen ||
    isSearchOpen ||
    isContactOpen ||
    isPolicyOpen ||
    isWishlistModalOpen ||
    isCompareModalOpen ||
    isAuthModalOpen;

  // Lock body scroll when drawer/modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isAnyModalOpen]);

  // Cart Functions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });

    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    }, quantity);

    trackUnifiedEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT',
      num_items: quantity,
    }, integrationsSettings);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const handlePlaceOrder = async (orderDetails: OrderDetails) => {
    // Save order to Firebase Firestore
    await saveOrderFirebase(orderDetails);

    // Sync order to backend API for local persistence & Steadfast courier auto-dispatch
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      }).catch((e) => console.warn('API order dispatch warning:', e));
    } catch {
      // Ignore background sync errors
    }

    trackPurchase(orderDetails.orderId, orderDetails.total, orderDetails.items);

    trackUnifiedEvent('Purchase', {
      order_id: orderDetails.orderId,
      value: orderDetails.total,
      currency: 'BDT',
      num_items: orderDetails.items?.reduce((s, it) => s + it.quantity, 0) || 1,
      content_ids: orderDetails.items?.map((it) => it.product?.id || (it as any).id) || [],
    }, integrationsSettings);

    // Save profile to localStorage for profile tracking
    const existingProfile = localStorage.getItem('seed_haven_customer_profile');
    let parsedProfile = existingProfile ? JSON.parse(existingProfile) : {};
    const updatedProfile = {
      ...parsedProfile,
      name: orderDetails.customerName || parsedProfile.name || '',
      phone: orderDetails.phone || parsedProfile.phone || '',
      address: orderDetails.address || parsedProfile.address || '',
      district: orderDetails.district || parsedProfile.district || '',
    };
    localStorage.setItem('seed_haven_customer_profile', JSON.stringify(updatedProfile));

    // Save order ID to local storage my order IDs
    if (orderDetails.orderId) {
      const existingIds = JSON.parse(localStorage.getItem('seed_haven_my_order_ids') || '[]');
      if (!existingIds.includes(orderDetails.orderId)) {
        existingIds.push(orderDetails.orderId);
        localStorage.setItem('seed_haven_my_order_ids', JSON.stringify(existingIds));
      }
    }

    setCartItems([]);
    navigate('/cart');
  };

  // Category & Quick Search Filtering Logic
  const filteredProducts = productsList.filter((p) => {
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const cat = (p.category || '').toLowerCase();
      const target = selectedCategory.toLowerCase();
      if (cat === target) matchesCategory = true;
      else if (target === 'veg' && (cat.includes('veg') || cat.includes('সবজি'))) matchesCategory = true;
      else if (target === 'fruit' && (cat.includes('fruit') || cat.includes('fol') || cat.includes('ফল'))) matchesCategory = true;
      else if (target === 'ful' && (cat.includes('flow') || cat.includes('ful') || cat.includes('ফুল'))) matchesCategory = true;
      else if (target === 'offers' || target === 'offer' || target.includes('অফার')) {
        matchesCategory =
          cat.includes('offer') ||
          cat.includes('অফার') ||
          cat.includes('discount') ||
          cat.includes('ছাড়') ||
          (p.originalPrice !== undefined && p.originalPrice > p.price) ||
          Boolean(p.cashback);
      } else matchesCategory = false;
    }

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#16331f] flex flex-col justify-between selection:bg-[#49a845]/20 selection:text-[#063d24]">
      {/* Full Responsive Container for Mobile, Tablet & PC */}
      <div className="w-full min-h-screen flex flex-col justify-between bg-white">
        {/* Scroll Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-[#118137] transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div>
          {/* Main Header (Shown only when not on dedicated product details view) */}
          {!routeProductId && (
            <Header
              cartCount={totalCartCount}
              onOpenCart={() => handleOpenCart(true)}
              onOpenMenu={() => handleOpenMenu(true)}
              storeSettings={storeSettings}
              homepageSettings={homepageSettings}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onLogout={handleLogout}
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                setSearchQuery(query);
                if (query) {
                  setSelectedCategory('all');
                  navigate(`/products?q=${encodeURIComponent(query)}`);
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onOpenTracker={() => handleOpenOrderTracker(true)}
              onOpenWishlist={() => navigate('/wishlist')}
              wishlistCount={wishlist.length}
              onOpenCompare={() => navigate('/compare')}
              compareCount={compareProducts.length}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                navigate(`/category/${catId}`);
                const el = document.getElementById('products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenSearch={() => handleOpenSearch(true)}
              onNavigateHome={() => navigate('/')}
            />
          )}

          {/* Dedicated Product Details Page OR Order Tracker Page OR Homepage Content */}
          {routeProductId ? (
            activeProduct ? (
              <ProductDetailPage
                product={activeProduct}
                allProducts={productsList}
                categoriesList={categoriesList}
                cartCount={totalCartCount}
                userRating={userRatings[activeProduct.id]}
                onRateProduct={handleRateProduct}
                reviewEnabled={storeSettings?.reviewEnabled !== false}
                onBack={handleBackFromProduct}
                onOpenCart={() => handleOpenCart(true)}
                onAddToCart={handleAddToCart}
                onDirectCheckout={(p, q) => {
                  handleAddToCart(p, q);
                  handleOpenCart(true);
                }}
                onSelectProduct={(p) => handleSelectProduct(p)}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                  navigate(`/category/${catId}`);
                }}
                currentUser={currentUser}
                onOpenAuth={handleOpenAuth}
                loginEnabled={storeSettings?.loginEnabled !== false}
              />
            ) : isLoadingProducts ? (
              <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handleBackFromProduct}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#15803d] hover:text-[#0f602c] cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                    <span>পণ্য তালিকায় ফিরে যান</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-3xl" />
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
                    <div className="h-24 bg-gray-100 rounded-2xl" />
                    <div className="h-12 bg-gray-200 rounded-xl w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-xl mx-auto py-20 px-4 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1c3822] mb-2">
                  পণ্যটি খুঁজে পাওয়া যায়নি
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  সম্ভবত পণ্যটি সরানো হয়েছে বা লিঙ্কটি সঠিক নয়। অনুগ্রহ করে আমাদের শপ থেকে পছন্দমতো বীজ বেছে নিন।
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-2.5 bg-[#15803d] hover:bg-[#0f602c] text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  সকল পণ্য দেখুন
                </button>
              </div>
            )
          ) : isOrderTrackerRoute ? (
            <OrderTrackerPage
              onBack={handleBackFromTracker}
              ordersList={ordersList}
              onOpenCart={() => handleOpenCart(true)}
              cartCount={totalCartCount}
              isLoading={isLoadingOrders}
              onOpenMemo={(ord) => setMemoOrder(ord)}
            />
          ) : (
            <>
              {/* Notice / Popup Offer Modal */}
              <NoticePopupModal settings={noticeSettings} />

              {/* Notice / Clearance Banner */}
              {noticeSettings.noticeEnabled === true && (
                <ClearanceBanner
                  noticeText={noticeSettings.noticeText}
                  noticeLink={noticeSettings.noticeLink}
                  onViewOffer={() => {
                    const el = document.getElementById('products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}

              {/* Hero Banner Section (Only displays when active banners exist in panel) */}
              <Hero banners={bannersList} onNavigate={(path) => navigate(path)} />

              {/* Category Strip */}
              {homepageSettings.showCategories !== false && (
                <Categories
                  categories={categoriesList}
                  selectedCategory={selectedCategory}
                  isLoading={isLoadingCategories}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    navigate(`/category/${id}`);
                    const el = document.getElementById('products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}

              {/* Promo Banner Section */}
              {homepageSettings.showPromoBanner === true && (
                <PromoSection
                  title={homepageSettings.promoTitle}
                  subtext={homepageSettings.promoSubtext}
                  buttonText={homepageSettings.promoButtonText}
                  couponCode={couponsList.length > 0 ? couponsList[0].code : (homepageSettings.promoCouponCode || '')}
                />
              )}

              {/* Product Catalog Section */}
              <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8" id="products">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex flex-col gap-0.5">
                    {/* Main Section Breadcrumb Trail */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-500 mb-1 select-none">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          navigate('/');
                        }}
                        className="hover:text-[#1c3822] transition-colors cursor-pointer"
                      >
                        হোম
                      </button>
                      <span className="text-gray-400">›</span>
                      <span className="text-[#2b5019] font-bold">
                        {selectedCategory === 'all'
                          ? 'সকল পণ্য'
                          : categoriesList.find((c) => c.id === selectedCategory)?.name ||
                            'পণ্য তালিকা'}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#153a1a] flex items-center gap-2">
                      {searchQuery ? (
                        <span className="truncate max-w-[200px] sm:max-w-[400px]">🔍 "{searchQuery}" এর ফলাফল</span>
                      ) : selectedCategory === 'all' ? (
                        '🔥 সেরা বীজ কালেকশন'
                      ) : (
                        '🌱 বাছাইকৃত পণ্যসমূহ'
                      )}
                    </h2>
                  </div>

                  {/* Reset Filter Button if Active */}
                  {(selectedCategory !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                        navigate('/products');
                      }}
                      className="text-xs sm:text-sm font-bold text-[#35682d] bg-[#f0f9f1] px-3 py-1.5 rounded-xl border border-[#3e7235]/30 hover:bg-[#3d7034] hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      সব দেখুন
                    </button>
                  )}
                </div>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 py-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <ProductCardSkeleton key={n} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-16 text-center bg-[#f8faf8] rounded-3xl border border-dashed border-[#a6d1a3] p-8 max-w-xl mx-auto my-6">
                    <div className="text-5xl mb-3">🌱</div>
                    <p className="text-base font-bold text-[#1a3821]">
                      {searchQuery ? `"${searchQuery}" নামে কোনো বীজ পাওয়া যায়নি` : 'এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-5">
                      {searchQuery ? 'অন্য কোনো নাম দিয়ে অনুসন্ধান অথবা সম্পূর্ণ তালিকা দেখুন' : 'অনুগ্রহ করে অন্য কোনো ক্যাটাগরি অথবা সম্পূর্ণ তালিকা চেক করুন'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                        navigate('/products');
                      }}
                      className="px-5 py-2.5 bg-[#2c5828] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-[#1b3d18] transition-colors cursor-pointer"
                    >
                      সকল পণ্য দেখুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        onQuickView={(p) => handleSelectProduct(p)}
                        onSelectProduct={(p) => handleSelectProduct(p)}
                        onToggleCompare={handleToggleCompare}
                        isCompared={compareProducts.some((p) => p.id === product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.some((p) => p.id === product.id)}
                        ordersList={ordersList}
                        userRating={userRatings[product.id]}
                        onRateProduct={handleRateProduct}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Leaderboard Section */}
              {homepageSettings.showLeaderboard !== false && (
                <LeaderboardSection
                  orders={ordersList}
                  settings={homepageSettings}
                  products={productsList}
                  onSelectProduct={(p) => handleSelectProduct(p)}
                />
              )}

              {/* Marquee Ticker Section (Right below Leaderboard) */}
              {homepageSettings.marqueeEnabled !== false && (
                <MarqueeSection settings={homepageSettings} />
              )}

              {/* Blog & Gardening Tips Section */}
              {homepageSettings.showBlogTips === true && <BlogSection />}

              {/* Trust Section */}
              {homepageSettings.showTrustSection !== false && <TrustSection />}
            </>
          )}

          {/* Footer Section */}
          {
            <Footer
              settings={footerSettings}
              contactSettings={contactSettings}
              onNavigateHome={() => navigate('/')}
              onSelectCategory={(catId) => {
                if (catId === 'all') {
                  navigate('/products');
                } else {
                  navigate(`/category/${catId}`);
                }
              }}
              onOpenContact={(tab) => handleOpenContact(true, tab || 'contact')}
              onOpenPolicy={(tab) => handleOpenPolicy(true, tab || 'privacy')}
              onOpenCart={() => handleOpenCart(true)}
            />
          }
        </div>

        {/* Side Menu Drawer */}
        <MenuDrawer
          isOpen={isMenuOpen}
          onClose={() => handleOpenMenu(false)}
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => {
            handleOpenMenu(false);
            handleOpenCart(true);
          }}
          wishlistCount={wishlist.length}
          onOpenWishlist={() => {
            handleOpenMenu(false);
            navigate('/wishlist');
          }}
          onSelectCategory={(catId) => {
            handleOpenMenu(false);
            if (catId === 'all') {
              navigate('/products');
            } else {
              navigate(`/category/${catId}`);
            }
          }}
          onOpenContact={(tab) => {
            handleOpenMenu(false);
            handleOpenContact(true, tab || 'contact');
          }}
          onOpenPolicy={(tab) => {
            handleOpenMenu(false);
            handleOpenPolicy(true, tab || 'privacy');
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            handleOpenMenu(false);
            handleOpenAuth();
          }}
          onLogout={handleLogout}
          loginEnabled={storeSettings?.loginEnabled !== false}
          onOpenTracker={() => {
            handleOpenMenu(false);
            handleOpenOrderTracker(true);
          }}
          onOpenSearch={() => {
            handleOpenMenu(false);
            handleOpenSearch(true);
          }}
          storeSettings={storeSettings}
          menuSettings={menuSettings}
          onOpenCompare={() => {
            handleOpenMenu(false);
            navigate('/compare');
          }}
          compareCount={compareProducts.length}
        />

        {/* Wishlist Modal */}
        <WishlistModal
          isOpen={isWishlistModalOpen}
          onClose={handleCloseModal}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onSelectProduct={(p) => {
            handleCloseModal();
            handleSelectProduct(p);
          }}
          onClearWishlist={handleClearWishlist}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseModal}
          onLoginSuccess={(user) => {
            handleLoginSuccess(user);
            handleCloseModal();
          }}
        />

        {/* Cart Side Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={handleCloseModal}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onPlaceOrder={handlePlaceOrder}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          loginEnabled={storeSettings?.loginEnabled !== false}
          onOpenMemo={(ord) => setMemoOrder(ord)}
        />

        {/* Customer Order Cash Memo Printable Modal */}
        <OrderMemoModal
          isOpen={Boolean(memoOrder)}
          onClose={() => setMemoOrder(null)}
          order={memoOrder}
          storeSettings={storeSettings}
          contactSettings={contactSettings}
        />

        {/* Quick Search Modal */}
        <QuickSearchModal
          isOpen={isSearchOpen}
          onClose={handleCloseModal}
          products={productsList}
          onSelectProduct={(p) => {
            handleCloseModal();
            handleSelectProduct(p);
          }}
        />

        {/* Contact & About Us Modal */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={handleCloseModal}
          settings={contactSettings}
          initialTab={contactModalTab}
        />

        {/* Policy Pages Modal */}
        <PolicyModal
          isOpen={isPolicyOpen}
          onClose={handleCloseModal}
          settings={policySettings}
          initialTab={policyModalTab}
        />

        {/* Product Comparison Modal */}
        <ProductCompareModal
          isOpen={isCompareModalOpen}
          onClose={handleCloseModal}
          comparedProducts={compareProducts}
          onRemoveFromCompare={(id) => setCompareProducts((prev) => prev.filter((p) => p.id !== id))}
          onAddToCart={(p) => handleAddToCart(p, 1)}
        />

        {/* Floating Compare Bar */}
        {compareProducts.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#1c3822] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-6 border border-emerald-700/50 animate-bounce-short">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-700 rounded-lg text-white">
                <Scale size={16} />
              </span>
              <span className="text-xs sm:text-sm font-bold">
                তুলনা তালিকা ({compareProducts.length}/3)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/compare')}
                className="px-3.5 py-1.5 bg-[#118137] hover:bg-[#0d6b2c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                তুলনা করুন
              </button>
              <button
                onClick={() => setCompareProducts([])}
                className="text-xs text-emerald-200 hover:text-white underline cursor-pointer"
              >
                সব মুছুন
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Business Floating Chat Button */}
        {storeSettings?.whatsappFloatEnabled !== false &&
          integrationsSettings?.communication?.whatsappEnabled !== false &&
          integrationsSettings?.communication?.whatsappChatButton !== false && (
            <div
              className={`fixed z-40 transition-all duration-300 ${
                integrationsSettings?.communication?.whatsappPosition === 'bottom-left'
                  ? 'bottom-6 left-5'
                  : 'bottom-6 right-5'
              }`}
            >
              <a
                href={`https://wa.me/88${(
                  integrationsSettings?.communication?.whatsappNumber || '01410136900'
                ).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  integrationsSettings?.communication?.whatsappDefaultMessage ||
                    'আসসালামু আলাইকুম! Seed Haven BD থেকে বীজ অর্ডার করতে চাই।'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackUnifiedEvent('Lead', {
                    channel: 'whatsapp',
                    value: 0,
                    currency: 'BDT',
                  }, integrationsSettings);
                }}
                className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-emerald-600/40 transition-all duration-300 hover:scale-105 select-none"
                title="WhatsApp এ সরাসরি কথা বলুন"
              >
                <MessageCircle size={24} className="fill-white/20 shrink-0" />
                <span className="hidden sm:inline font-bold text-xs sm:text-sm tracking-wide">
                  হোয়াটসঅ্যাপ সাপোর্ট
                </span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
              </a>
            </div>
          )}

        {/* Customer Profile Page rendered conditionally above */}



      </div>
    </div>
  );
}
