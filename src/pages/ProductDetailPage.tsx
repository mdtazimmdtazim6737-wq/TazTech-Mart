import React, { useState, useEffect } from 'react';
import { 
  Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, 
  Zap, Check, ArrowLeft, Share2, Plus, Minus, MessageSquare,
  Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Product, ProductVariant, Review } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProductSlug, addToCart, isInWishlist, toggleWishlist,
    setActivePage, addRecentlyViewed, settings, user 
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'delivery'>('desc');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Review submission modal / form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Delivery calculator test
  const [selectedCalcZone, setSelectedCalcZone] = useState<'inside' | 'outside'>('inside');

  useEffect(() => {
    if (!selectedProductSlug) return;
    async function loadProduct() {
      try {
        setLoading(true);
        const prod = await api.getProduct(selectedProductSlug!);
        setProduct(prod);
        setSelectedImage(prod.images[0] || '');
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        } else {
          setSelectedVariant(undefined);
        }
        addRecentlyViewed(prod);

        // Load reviews and related products
        const [revs, allProds] = await Promise.all([
          api.getReviews({ productId: prod.id, status: 'approved' }),
          api.getProducts({ category: prod.category_id })
        ]);
        setReviews(revs);
        setRelatedProducts(allProds.filter(p => p.id !== prod.id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [selectedProductSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-200 aspect-square rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
            <div className="h-10 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <button 
          onClick={() => setActivePage('shop')}
          className="mt-4 bg-cyan-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.sale_price;
  const discountAmount = product.regular_price - currentPrice;
  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await api.createReview({
        product_id: product.id,
        customer_name: reviewName.trim() || 'Anonymous Buyer',
        customer_email: user?.email || 'customer@example.com',
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      
      {/* Breadcrumb & Back */}
      <div className="mb-5 flex items-center space-x-2 text-xs text-slate-500">
        <button 
          onClick={() => setActivePage('shop')} 
          className="hover:text-cyan-600 flex items-center font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Products
        </button>
        <span>/</span>
        <span className="text-slate-400 capitalize">{product.category_name || 'Gadget'}</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Two Column Gallery + Buy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
            <img 
              src={selectedImage || product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            />
            {discountAmount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                SAVE ৳{discountAmount.toLocaleString()}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isFavorited ? 'bg-rose-50 text-rose-500 shadow-md' : 'bg-white/90 text-slate-500 hover:text-rose-500 shadow-sm'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img ? 'border-cyan-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Brand & Stock */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">
                {product.brand}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock_quantity} available)`}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-1">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-slate-800 text-sm">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.reviews_count} reviews)</span>
              </div>
              <span>•</span>
              <span>SKU: <strong className="text-slate-700 font-mono">{product.sku}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Warranty: {product.warranty || '6 Months Official'}</span>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.regular_price > currentPrice && (
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  ৳{product.regular_price.toLocaleString()}
                </span>
              )}
              {discountAmount > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Save ৳{discountAmount.toLocaleString()}
                </span>
              )}
            </div>

            {/* Variants Selector (Color / Model / Storage) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Variant: <span className="text-cyan-700">{selectedVariant?.title}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`text-xs py-2 px-3.5 rounded-xl font-semibold border transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-800 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{variant.title}</span>
                      {variant.price !== product.sale_price && (
                        <span className="ml-1 text-[11px] text-slate-500">
                          (৳{variant.price.toLocaleString()})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 pt-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantity:</label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="product-detail-add-to-cart-btn"
                onClick={() => addToCart(product, selectedVariant, quantity, false)}
                disabled={isOutOfStock}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Add to Cart</span>
              </button>

              <button
                id="product-detail-buy-now-btn"
                onClick={() => addToCart(product, selectedVariant, quantity, true)}
                disabled={isOutOfStock}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Order Now (Cash on Delivery)</span>
              </button>
            </div>

            {/* Bangladesh Delivery Calculator & Info */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center">
                  <Truck className="w-4 h-4 mr-1.5 text-cyan-600" />
                  Estimated Delivery in Bangladesh:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCalcZone('inside')}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    selectedCalcZone === 'inside' ? 'bg-white border-cyan-500 shadow-xs' : 'border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-800">Inside Dhaka (৳{settings.delivery_inside_dhaka})</p>
                  <p className="text-[10px] text-slate-500">Delivered within 24-48 Hours</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCalcZone('outside')}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    selectedCalcZone === 'outside' ? 'bg-white border-cyan-500 shadow-xs' : 'border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-800">Outside Dhaka (৳{settings.delivery_outside_dhaka})</p>
                  <p className="text-[10px] text-slate-500">Delivered within 2-4 Days</p>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Cash on delivery available in all 64 districts. Free delivery on orders over ৳{settings.free_delivery_threshold.toLocaleString()}.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Tabs Section: Description, Specs, Reviews, Warranty */}
      <div className="mt-10 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
        <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto text-xs sm:text-sm font-bold pb-2">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'desc' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'specs' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'reviews' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'delivery' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Warranty & Returns
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>{product.full_description || product.description || product.short_description}</p>
              {product.short_description && product.full_description && (
                <div className="p-4 bg-cyan-50/60 rounded-xl border border-cyan-100 mt-4 text-cyan-950 font-medium">
                  {product.short_description}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-w-2xl">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div key={idx} className="grid grid-cols-2 p-3 text-xs">
                      <span className="font-bold text-slate-900 bg-slate-50/80 -m-3 p-3">{key}</span>
                      <span className="text-slate-600 pl-4">{String(val)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Specifications not listed for this gadget.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Verified Customer Reviews</h4>
                  <p className="text-xs text-slate-500">Real feedback from buyers across Bangladesh.</p>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              </div>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Thank you! Your review has been submitted and will appear after moderation.</span>
                </div>
              )}

              {/* Review Input Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs uppercase">Submit Product Review</h5>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Asif Mahmud"
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Review Comments</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How was the build quality, sound, or battery life?"
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-xs">No reviews yet for this product. Be the first to review!</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs">{rev.customer_name}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                            Verified Purchase
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-amber-400 mb-2">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">7-Day Replacement Guarantee</h4>
              <p>
                If your product arrives with any manufacturing defect, TazTech Mart will replace the unit within 7 days of delivery. Please retain all original packaging and accessories.
              </p>
              <h4 className="font-bold text-slate-900 pt-2">Official Warranty Policy</h4>
              <p>
                This product comes with {product.warranty || '6 Months Official Brand Warranty'}. For any technical support or warranty inquiries, contact our Elephant Road hotline at {settings.contact_phone}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-5">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
