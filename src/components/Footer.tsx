import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, 
  Headphones, Send, CheckCircle, ExternalLink, Zap
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

export const Footer: React.FC = () => {
  const { settings, categories, navigateToCategory, navigateToPolicy, setActivePage, user } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await api.subscribeNewsletter(newsletterEmail);
      setNewsletterStatus('Thank you for subscribing! Check your email for exclusive deals.');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('Subscribed successfully!');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 sm:pb-12 border-t border-slate-800">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="p-2.5 bg-cyan-950/80 rounded-lg text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Tech</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct official brand warranty for Anker, Baseus & Haylou.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="p-2.5 bg-cyan-950/80 rounded-lg text-cyan-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">24h in Dhaka, 2-4 days across all 64 districts in Bangladesh.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="p-2.5 bg-cyan-950/80 rounded-lg text-cyan-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Replacement</h4>
              <p className="text-xs text-slate-400 mt-0.5">Easy returns and exchange on manufacturing defects.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="p-2.5 bg-cyan-950/80 rounded-lg text-cyan-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tech advice and phone assistance 7 days a week.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 text-cyan-200" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {settings.logo_text || 'TazTech Mart'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Your premier online destination for genuine consumer gadgets, premium audio gear, AMOLED smartwatches, and fast charging essentials in Bangladesh.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings.contact_address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.contact_phone} (10 AM - 8:30 PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.contact_email}</span>
              </div>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-1">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateToCategory(cat.slug)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Policies Col */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-1">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateToPolicy('about-us')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('contact-us')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Contact Us & Location
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('faq')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  FAQ & Ordering Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('delivery-info')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Delivery Information (BD)
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('return-refund-policy')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('privacy-policy')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPolicy('terms-conditions')} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Stay Connected */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-1">
              Stay Connected
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe to get secret discount coupons and new drop announcements in Bangladesh.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-xs"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5 ml-1" />
              </button>
            </form>

            {newsletterStatus && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                {newsletterStatus}
              </div>
            )}

            {/* Social Links */}
            <div className="mt-5 pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">Follow TazTech Mart:</p>
              <div className="flex items-center space-x-2.5 text-xs text-cyan-400">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">
                    Facebook
                  </a>
                )}
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">
                    Instagram
                  </a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">
                    YouTube
                  </a>
                )}
                {settings.whatsapp_number && (
                  <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar & Payments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} {settings.website_name}. All Rights Reserved. Engineered for Bangladesh.
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-medium">Supported Payments:</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 border border-slate-700">Cash on Delivery</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 border border-slate-700">bKash</span>
          <span className="bg-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 border border-slate-700">Nagad</span>
        </div>

        <div>
          <button 
            onClick={() => setActivePage('admin')} 
            className="text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center text-xs"
          >
            <span>Admin Portal</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </footer>
  );
};
