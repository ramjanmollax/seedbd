import React from 'react';
import { ShoppingCart, Repeat, Heart, Crown, Zap, ThumbsUp, Gift, Scale, Check, Flame, Sparkles } from 'lucide-react';
import { Product, OrderDetails } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  ordersList?: OrderDetails[];
  userRating?: number;
  onRateProduct?: (productId: string, rating: number) => void;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs flex flex-col h-full justify-between animate-pulse">
      <div className="relative aspect-square bg-gray-200" />
      <div className="p-3 md:p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
          <div className="w-full h-3 bg-gray-100 rounded" />
          <div className="w-1/2 h-3 bg-gray-100 rounded" />
        </div>
        <div className="pt-2 space-y-2">
          <div className="w-1/3 h-5 bg-gray-200 rounded" />
          <div className="w-full h-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};


export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onSelectProduct,
  onToggleCompare,
  isCompared,
  onToggleWishlist,
  isWishlisted,
  ordersList = [],
  userRating,
  onRateProduct,
}) => {
  const [showRatingDetails, setShowRatingDetails] = React.useState(false);
  const handleView = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  const orderCount = React.useMemo(() => {
    let count = 0;
    if (ordersList && ordersList.length > 0) {
      ordersList.forEach(order => {
        order.items?.forEach(item => {
          if (item.product?.id === product.id) {
            count += (item.quantity || 1);
          }
        });
      });
    }
    // Add baseline popularity if marked popular in product data
    return count + (product.popular || product.isPopular ? 3 : 0);
  }, [ordersList, product]);

  const isBestSeller = orderCount >= 3;
  const isPopular = orderCount > 0 && !isBestSeller;

  const handlePreload = () => {
    if (product.image) {
      const img = new Image();
      img.decoding = 'async';
      img.src = product.image;
    }
    if (product.images && product.images.length > 0) {
      product.images.slice(0, 3).forEach((src) => {
        if (src) {
          const img = new Image();
          img.decoding = 'async';
          img.src = src;
        }
      });
    }
  };

  return (
    <article
      onMouseEnter={handlePreload}
      onTouchStart={handlePreload}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-500 ease-out"
    >
      {/* Product Image */}
      <div
        onClick={handleView}
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-emerald-50">
            {product.imageEmoji}
          </div>
        )}

        {/* Wishlist Heart Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            title={isWishlisted ? 'উইশলিস্ট থেকে বাদ দিন' : 'উইশলিস্টে যোগ করুন'}
            className={`absolute top-2 right-11 p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-white' : ''} />
          </button>
        )}

        {/* Compare Button on Image Top-Right */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            title={isCompared ? 'তুলনা তালিকা থেকে বাদ দিন' : 'তুলনা করুন (Compare)'}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer z-10 ${
              isCompared
                ? 'bg-[#118137] text-white'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-[#118137]'
            }`}
          >
            {isCompared ? <Check size={14} strokeWidth={2.5} /> : <Scale size={14} />}
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
        <div>


          {/* Product Title */}
          <h3
            onClick={handleView}
            className="font-bold text-xs sm:text-sm text-[#1c3822] mb-1 line-clamp-1 hover:text-[#2b5019] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-0.5">
          {/* Price & Cashback */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="font-extrabold text-sm sm:text-base text-[#1c3822] whitespace-nowrap">
              ৳{product.price}
            </span>
            {Number(product.originalPrice) > 0 && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                ৳{product.originalPrice}
              </span>
            )}
            {Number(product.cashback) > 0 && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded-sm border border-amber-200 whitespace-nowrap">
                ৳{product.cashback} ক্যাশব্যাক
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(product)}
            className="relative flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold active:scale-95 transition-all cursor-pointer bg-[#2b5019] hover:bg-[#1c3822] text-white shadow-2xs"
          >
            <ShoppingCart size={15} />
            <span>কার্টে যুক্ত করুন</span>
          </button>
        </div>
      </div>
    </article>
  );
};



