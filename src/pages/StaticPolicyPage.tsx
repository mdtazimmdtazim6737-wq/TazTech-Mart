import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, ShieldCheck, Clock, Send, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { StaticPage } from '../types';

export const StaticPolicyPage: React.FC = () => {
  const { selectedPolicySlug, settings } = useStore();
  const [pageData, setPageData] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // FAQ Accordion states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        const data = await api.getPage(selectedPolicySlug);
        setPageData(data);
      } catch (err) {
        console.error('Failed to load static page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [selectedPolicySlug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMessage('');
  };

  const isContactPage = selectedPolicySlug === 'contact-us';
  const isFaqPage = selectedPolicySlug === 'faq';

  const defaultFaqs = [
    {
      q: 'How do I place an order for Cash on Delivery?',
      a: 'Simply choose the products you want, click "Add to Cart" or "Buy Now", fill in your delivery address in Bangladesh, and click "Confirm & Place Order". You only pay when the courier brings the parcel to your doorstep.'
    },
    {
      q: 'How much is the delivery charge and how long does it take?',
      a: 'Inside Dhaka delivery fee is ৳70 and delivered within 24 to 48 hours. Outside Dhaka across all 64 districts is ৳130 and takes 2 to 4 days via Steadfast, Pathao, or RedX. Orders of ৳3,000 or more enjoy FREE delivery!'
    },
    {
      q: 'Are all products on TazTech Mart genuine and original?',
      a: 'Yes, 100%. We directly source genuine products from official brand distributors including Anker, Baseus, Haylou, Remax, and Ugreen. All items come with manufacturer warranties.'
    },
    {
      q: 'What is your 7-Day Replacement Policy?',
      a: 'If any gadget has a factory defect or technical fault upon arrival, report it to our customer support within 7 days. We will pick up the defective unit and provide an immediate brand-new replacement.'
    },
    {
      q: 'Can I inspect the product before paying the courier rider?',
      a: 'Yes! You can check the physical parcel and external integrity in front of the courier before making cash payment.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
      
      {/* Page Title */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {pageData?.title || selectedPolicySlug.replace(/-/g, ' ').toUpperCase()}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Updated: {pageData ? new Date(pageData.updated_at).toLocaleDateString() : 'September 2026'} • Official {settings.website_name} Information
        </p>
      </div>

      {/* Main Content Render */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
        
        {/* Dynamic CMS Body */}
        {pageData?.content && (
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {pageData.content}
          </div>
        )}

        {/* Contact Us Form & Location Grid */}
        {isContactPage && (
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Contact Info Box */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm">Store & Customer Support</h3>
                
                <div className="flex items-start space-x-3 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-semibold">Store Address:</strong>
                    <span>{settings.contact_address}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-semibold">Hotline:</strong>
                    <span>{settings.contact_phone} (Available 10:00 AM - 8:30 PM, 7 days a week)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-semibold">Email:</strong>
                    <span>{settings.contact_email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Instant Messenger:</span>
                  {settings.whatsapp_number && (
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                    >
                      <span>Chat on WhatsApp ({settings.whatsapp_number})</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Message Form */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Send us an Inquiry</h3>
                
                {contactSent && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                    <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone (BD)</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Ask about a gadget or delivery status..."
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* FAQ Accordions */}
        {isFaqPage && (
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-base mb-4">Frequently Asked Questions</h3>
            {defaultFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors font-bold text-xs sm:text-sm text-slate-800"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
