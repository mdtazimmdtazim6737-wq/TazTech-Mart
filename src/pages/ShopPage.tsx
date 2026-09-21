import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, SlidersHorizontal, X, Search, ChevronDown, Check,
  Grid, List, Sparkles, AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Product } from '../types';

export const ShopPage: React.FC = () => {
  const { 
    categories, selectedCategorySlug, setSelectedCategorySlug,
    searchQuery, setSearchQuery 
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<number>(20000);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['all', ...list];
  }, [products]);

  // Filter & Sort computation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategorySlug && selectedCategorySlug !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategorySlug);
        if (cat && p.category_id !== cat.id) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.short_description?.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchDesc) return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }
      // In stock
      if (inStockOnly && p.stock_quantity <= 0) {
        return false;
      }
      // Price
      if (p.sale_price > priceRange) {
        return false;
      }
      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.sale_price - b.sale_price;
      if (sortBy === 'price-high') return b.sale_price - a.sale_price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategorySlug, categories, searchQuery, selectedBrand, inStockOnly, priceRange, minRating, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategorySlug(null);
    setSelectedBrand('all');
    setSearchQuery('');
    setInStockOnly(false);
    setPriceRange(20000);
    setMinRating(0);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategorySlug || selectedBrand !== 'all' || searchQuery || inStockOnly || priceRange < 20000 || minRating > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header & Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {selectedCategorySlug 
              ? (categories.find(c => c.slug === selectedCategorySlug)?.name || 'Category Products')
              : 'All Genuine Gadgets'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> authentic products with official Bangladesh warranty.
          </p>
        </div>

        {/* Sort & Mobile Filter Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-cyan-600' : 'text-slate-400 hover:text-slate-700'}`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-cyan-600' : 'text-slate-400 hover:text-slate-700'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
              <span>Refine Search</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategorySlug(null)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                  !selectedCategorySlug ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedCategorySlug === cat.slug ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] text-slate-400">({cat.product_count || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Max Price (BDT)
              </h4>
              <span className="text-xs font-black text-cyan-700">৳{priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>৳500</span>
              <span>৳25,000+</span>
            </div>
          </div>

          {/* Brands */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Brand
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedBrand === brand ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">{brand === 'all' ? 'All Brands' : brand}</span>
                  {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products matched your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range or resetting the category and brand selections.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Mobile Category Select */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategorySlug(null); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left text-xs p-2 rounded-lg ${!selectedCategorySlug ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategorySlug(cat.slug); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left text-xs p-2 rounded-lg ${selectedCategorySlug === cat.slug ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Brand Select */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Brand</h4>
              <div className="space-y-1">
                {brands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => { setSelectedBrand(brand); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left text-xs p-2 rounded-lg ${selectedBrand === brand ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-600'}`}
                  >
                    <span className="capitalize">{brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-4 bg-cyan-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
