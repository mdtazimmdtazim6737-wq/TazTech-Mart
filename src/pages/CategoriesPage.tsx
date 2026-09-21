import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategoriesPage: React.FC = () => {
  const { categories, navigateToCategory } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-600 uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-full mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Product Taxonomy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Browse All Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore genuine tech accessories, power solutions, smart audio, and wearables available for delivery all over Bangladesh.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => navigateToCategory(cat.slug)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-cyan-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={cat.image || cat.image_url || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded">
                  {cat.product_count || 0} Products
                </span>
                <h3 className="text-lg font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {cat.description || 'Authentic gadgets and premium electronics with official warranty.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600 group-hover:text-cyan-700">
                <span>View Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
