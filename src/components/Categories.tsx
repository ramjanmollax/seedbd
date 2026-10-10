import React from 'react';
import { Category } from '../types';

interface CategoriesProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isLoading?: boolean;
}

export const CategoriesSkeleton: React.FC = () => {
  return (
    <section className="w-full mx-auto px-2 sm:px-4 py-0.5" id="categories">
      <div className="w-fit max-w-full mx-auto bg-white rounded-xl sm:rounded-2xl border border-gray-200/70 shadow-2xs py-1 px-2 animate-pulse flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center py-0.5 px-1.5 space-y-0.5 min-w-[50px] sm:min-w-[62px]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg" />
            <div className="w-8 h-2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
};

export const Categories: React.FC<CategoriesProps> = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) => {
  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  const list = categories || [];
  if (list.length === 0) {
    return null;
  }

  return (
    <section className="w-full mx-auto px-2 sm:px-4 py-0.5 sm:py-1" id="categories">
      <div className="w-fit max-w-full mx-auto bg-white/95 backdrop-blur-xs rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs p-1 sm:p-1.5">
        <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {list.map((cat: Category) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 sm:py-1 sm:px-2.5 rounded-lg sm:rounded-xl transition-all cursor-pointer group border shrink-0 min-w-[52px] sm:min-w-[64px] max-w-[76px] ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs ring-1 ring-emerald-500/20'
                    : 'bg-transparent hover:bg-slate-50 border-transparent hover:border-gray-200 text-gray-700'
                }`}
              >
                {/* Flat Vector Icon / Image / Emoji */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span
                    className="text-lg sm:text-xl leading-none"
                    style={{ display: cat.image ? 'none' : 'block' }}
                  >
                    {cat.iconEmoji || '🌱'}
                  </span>
                </div>

                {/* Text Label (Compact, crisp, no empty margins) */}
                <span className="text-[10px] sm:text-[11px] font-semibold text-center leading-tight text-gray-800 line-clamp-1 w-full truncate mt-0.5">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
