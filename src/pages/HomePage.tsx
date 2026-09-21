import React, { useState, useEffect } from 'react';
import { 
  Zap, Clock, ArrowRight, ShieldCheck, Truck, RotateCcw, 
  Headphones, ChevronLeft, ChevronRight, Star, CheckCircle,
  Flame, Sparkles, TrendingUp
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Product, HeroBanner, HomepageSection, Review } from '../types';

export const HomePage: React.FC = () => {
  const { 
    categories, navigateToCategory, navigateToProduct, setActivePage,
    setSelectedCategorySlug
  } = useStore();

  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Countdown timer for Flash Deals (e.g. 18 hours 42 mins 10 secs)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cmsData, prods, reviews] = await Promise.all([
          api.getHomepageCMS(),
          api.getProducts(),
          api.getReviews({ status: 'approved' })
        ]);

        setBanners(cmsData.banners || []);
        setSections(cmsData.sections.sort((a, b) => a.order_index - b.order_index));
        
        setFeaturedProducts(prods.filter(p => p.is_featured).slice(0, 8));
        setFlashDeals(prods.filter(p => p.regular_price > p.sale_price).slice(0, 4));
        setBestSellers(prods.filter(p => p.is_best_seller).slice(0, 8));
        setNewArrivals(prods.filter(p => p.is_new_arrival).slice(0, 8));
        setFeaturedReviews(reviews.filter(r => r.is_featured).slice(0, 6));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="w-full pb-16">
      
      {/* 1. Hero Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {banners.length > 0 ? (
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 aspect-[16/8] sm:aspect-[21/9] min-h-[320px] sm:min-h-[420px] flex items-center">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Dark Overlay */}
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />

                {/* Banner Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 sm:px-12 lg:px-16 max-w-xl sm:max-w-2xl text-white space-y-3 sm:space-y-4">
                    {banner.badge_text && (
                      <span className="inline-flex items-center space-x-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{banner.badge_text}</span>
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-none text-white font-sans">
                      {banner.title}
                    </h1>
                    <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {banner.subtitle}
                    </p>
                    <div className="pt-2">
                      <button
                        id={`hero-cta-${banner.id}`}
                        onClick={() => {
                          const bannerLink = banner.button_link || banner.link_url || '';
                          if (bannerLink.startsWith('/product/')) {
                            const slug = bannerLink.replace('/product/', '');
                            navigateToProduct(slug);
                          } else if (bannerLink.startsWith('/category/')) {
                            const slug = bannerLink.replace('/category/', '');
                            navigateToCategory(slug);
                          } else {
                            setActivePage('shop');
                          }
                        }}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center space-x-2 group"
                      >
                        <span>{banner.button_text || 'Explore Collection'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBannerIndex((currentBannerIndex - 1 + banners.length) % banners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-xs text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-colors"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentBannerIndex((currentBannerIndex + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-xs text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-colors"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentBannerIndex ? 'w-8 bg-cyan-400' : 'w-2 bg-white/40 hover:bg-white/80'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        )}
      </section>

      {/* 2. Trust Badges Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Genuine</h4>
              <p className="text-[11px] text-slate-500">Official brand warranties</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-500">Fast 24-48h Dhaka shipping</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-500">Pay when order arrives</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">7-Day Replacement</h4>
              <p className="text-[11px] text-slate-500">Easy claim & tech support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Top Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500">Curated authentic gadgets by department</p>
          </div>
          <button
            onClick={() => setActivePage('categories')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigateToCategory(cat.slug)}
              className="group bg-white p-3 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-slate-100">
                <img 
                  src={cat.image || cat.image_url || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300'} 
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {cat.product_count || 0} Products
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Flash Deals Section with Countdown Timer */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <div className="bg-gradient-to-br from-rose-600 via-rose-500 to-amber-600 rounded-3xl p-5 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Limited Time Deal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  ⚡ Flash Sale Madness
                </h2>
                <p className="text-xs sm:text-sm text-rose-100">
                  Massive discounts on hot-selling audio, smartwatches & chargers.
                </p>
              </div>

              {/* Countdown Clocks */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider mr-1 text-rose-100">Ends in:</span>
                <div className="bg-slate-950 text-white font-mono font-bold text-sm sm:text-lg px-2.5 py-1.5 rounded-xl shadow-xs">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </div>
                <span className="font-bold">:</span>
                <div className="bg-slate-950 text-white font-mono font-bold text-sm sm:text-lg px-2.5 py-1.5 rounded-xl shadow-xs">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </div>
                <span className="font-bold">:</span>
                <div className="bg-slate-950 text-white font-mono font-bold text-sm sm:text-lg px-2.5 py-1.5 rounded-xl shadow-xs">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
            </div>

            {/* Flash Deals Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {flashDeals.map(prod => (
                <div key={prod.id} className="text-slate-900">
                  <ProductCard product={prod} badgeText="⚡ Flash" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Featured Gadgets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center space-x-1 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Staff Picks</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Featured Gadgets</h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategorySlug(null);
              setActivePage('shop');
            }}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featuredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Promotional Banner Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => {
              setSelectedCategorySlug('smart-audio');
              setActivePage('shop');
            }}
            className="group relative rounded-3xl overflow-hidden bg-slate-900 p-6 sm:p-8 cursor-pointer shadow-lg aspect-[16/7] flex items-center"
          >
            <img 
              src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" 
              alt="ANC Wireless Audio"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="relative z-10 text-white max-w-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md">
                Pure Sound
              </span>
              <h3 className="text-xl sm:text-2xl font-black">Active Noise Cancellation Earbuds</h3>
              <p className="text-xs text-slate-300">Experience true immersion with 45ms low-latency gaming modes.</p>
              <div className="pt-1 flex items-center text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                <span>Shop Audio Gear</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              setSelectedCategorySlug('power-charging');
              setActivePage('shop');
            }}
            className="group relative rounded-3xl overflow-hidden bg-slate-900 p-6 sm:p-8 cursor-pointer shadow-lg aspect-[16/7] flex items-center"
          >
            <img 
              src="https://images.unsplash.com/photo-1622445268462-337f16885820?w=800" 
              alt="Fast Chargers & Power"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="relative z-10 text-white max-w-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md">
                Fast Power
              </span>
              <h3 className="text-xl sm:text-2xl font-black">Next-Gen GaN Fast Chargers</h3>
              <p className="text-xs text-slate-300">Charge your phone & laptop at up to 65W with Anker and Baseus.</p>
              <div className="pt-1 flex items-center text-xs font-bold text-amber-300 group-hover:text-amber-200">
                <span>Explore Chargers</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Best Sellers & New Arrivals Tabbed or Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center space-x-1 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Best Selling Gadgets</h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategorySlug(null);
              setActivePage('shop');
            }}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {bestSellers.map(prod => (
            <ProductCard key={prod.id} product={prod} badgeText="Top Rated" />
          ))}
        </div>
      </section>

      {/* 8. Verified Buyer Reviews */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10">
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Real Customers, Genuine Feedback</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Trusted by Tech Enthusiasts Across Bangladesh
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredReviews.map(rev => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-amber-400 mb-2">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.customer_name}</h4>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-0.5" />
                        Verified Buyer (Dhaka)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
