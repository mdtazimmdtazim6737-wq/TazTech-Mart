import React from 'react';
import { Heart, ShoppingBag, Star, Zap, Eye } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  badgeText?: string;
  badgeType?: 'sale' | 'featured' | 'bestseller' | 'hot';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  badgeText,
  badgeType = 'sale'
}) => {
  const { 
    isInWishlist, toggleWishlist, addToCart, navigateToProduct,
    settings 
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.regular_price > product.sale_price 
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    addToCart(product, defaultVariant, 1, false);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
    addToCart(product, defaultVariant, 1, true);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => navigateToProduct(product.slug)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-cyan-300 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Top Media Area */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {badgeText && (
            <span className="bg-slate-900 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {badgeText}
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            isFavorited 
              ? 'bg-rose-50 text-rose-500 shadow-sm' 
              : 'bg-white/80 backdrop-blur-xs text-slate-500 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Stock warning pill overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-cyan-700 tracking-wide uppercase">{product.brand}</span>
            {isLowStock && !isOutOfStock && (
              <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.2 rounded text-[10px]">
                Only {product.stock_quantity} left
              </span>
            )}
            {!isLowStock && !isOutOfStock && (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                In Stock
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-cyan-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center space-x-1.5 mt-1.5">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({product.reviews_count})</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ৳{product.sale_price.toLocaleString()}
            </span>
            {product.regular_price > product.sale_price && (
              <span className="text-xs text-slate-400 line-through">
                ৳{product.regular_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to cart & Buy now */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] sm:text-xs py-2 px-2 rounded-xl transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[11px] sm:text-xs py-2 px-2 rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-xs disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
