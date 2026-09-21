import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Simple token / session simulation (stateless bearer token with userId:role encoding)
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, role] = decoded.split(':');
        const user = db.findUserById(userId);
        if (user) {
          (req as any).user = user;
        }
      } catch (e) {
        // invalid token format
      }
    }
    next();
  };

  app.use(authenticate);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', store: 'TazTech Mart', time: new Date().toISOString() });
  });

  // --- Site Settings ---
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // --- Categories ---
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const cat = db.createCategory(req.body);
    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const cat = db.updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const success = db.deleteCategory(req.params.id);
    res.json({ success });
  });

  // --- Products ---
  app.get('/api/products', (req, res) => {
    const { category, search, brand, minPrice, maxPrice, inStockOnly, isFeatured, isNewArrival, isBestSeller, sort } = req.query;
    const products = db.getProducts({
      category: category as string,
      search: search as string,
      brand: brand as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      isNewArrival: isNewArrival === 'true' ? true : isNewArrival === 'false' ? false : undefined,
      isBestSeller: isBestSeller === 'true' ? true : isBestSeller === 'false' ? false : undefined,
      sort: sort as any
    });
    res.json(products);
  });

  app.get('/api/products/:slugOrId', (req, res) => {
    const prod = db.getProductByIdOrSlug(req.params.slugOrId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  app.post('/api/products', (req, res) => {
    const prod = db.createProduct(req.body);
    res.status(201).json(prod);
  });

  app.put('/api/products/:id', (req, res) => {
    const prod = db.updateProduct(req.params.id, req.body);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    res.json({ success });
  });

  app.post('/api/products/:id/duplicate', (req, res) => {
    const cloned = db.duplicateProduct(req.params.id);
    if (!cloned) return res.status(404).json({ error: 'Product not found' });
    res.status(201).json(cloned);
  });

  // --- Orders ---
  app.get('/api/orders', (req, res) => {
    const { search, status, email } = req.query;
    const orders = db.getOrders({
      search: search as string,
      status: status as string,
      customerEmail: email as string
    });
    res.json(orders);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to place order' });
    }
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { status, tracking_number, courier_name, internal_notes } = req.body;
    const order = db.updateOrderStatus(req.params.id, status, tracking_number, courier_name, internal_notes);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  // --- Coupons ---
  app.get('/api/coupons', (req, res) => {
    res.json(db.getCoupons());
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    const result = db.validateCoupon(code, subtotal);
    res.json(result);
  });

  app.post('/api/coupons', (req, res) => {
    const coupon = db.createCoupon(req.body);
    res.status(201).json(coupon);
  });

  app.put('/api/coupons/:id', (req, res) => {
    const coupon = db.updateCoupon(req.params.id, req.body);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  });

  app.delete('/api/coupons/:id', (req, res) => {
    const success = db.deleteCoupon(req.params.id);
    res.json({ success });
  });

  // --- Reviews ---
  app.get('/api/reviews', (req, res) => {
    const { productId, status } = req.query;
    res.json(db.getReviews({ productId: productId as string, status: status as string }));
  });

  app.post('/api/reviews', (req, res) => {
    const review = db.createReview(req.body);
    res.status(201).json(review);
  });

  app.put('/api/reviews/:id/status', (req, res) => {
    const { status, is_featured } = req.body;
    const updated = db.updateReviewStatus(req.params.id, status, is_featured);
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json(updated);
  });

  app.delete('/api/reviews/:id', (req, res) => {
    const success = db.deleteReview(req.params.id);
    res.json({ success });
  });

  // --- CMS Homepage Sections & Banners ---
  app.get('/api/cms/homepage', (req, res) => {
    res.json({
      sections: db.getHomepageSections(),
      banners: db.getBanners()
    });
  });

  app.put('/api/cms/sections', (req, res) => {
    const sections = db.updateHomepageSections(req.body);
    res.json(sections);
  });

  app.post('/api/cms/banners', (req, res) => {
    const banner = db.createBanner(req.body);
    res.status(201).json(banner);
  });

  app.put('/api/cms/banners/:id', (req, res) => {
    const banner = db.updateBanner(req.params.id, req.body);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  });

  app.delete('/api/cms/banners/:id', (req, res) => {
    const success = db.deleteBanner(req.params.id);
    res.json({ success });
  });

  // --- Static Pages ---
  app.get('/api/pages', (req, res) => {
    res.json(db.getPages());
  });

  app.get('/api/pages/:slug', (req, res) => {
    const page = db.getPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  });

  app.put('/api/pages/:slug', (req, res) => {
    const page = db.updatePage(req.params.slug, req.body);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  });

  // --- Auth ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const user = db.createUser(req.body);
      const token = Buffer.from(`${user.id}:${user.role}`).toString('base64');
      res.status(201).json({ user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const userWithHash = db.findUserByEmail(email);
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = bcrypt.compareSync(password, userWithHash.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { password_hash, ...safeUser } = userWithHash;
    const token = Buffer.from(`${safeUser.id}:${safeUser.role}`).toString('base64');
    res.json({ user: safeUser, token });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const customer = db.getCustomerById(user.id);
    res.json({ user, customer });
  });

  app.put('/api/auth/profile', (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const updated = db.updateUserProfile(user.id, req.body);
    const customer = db.getCustomerById(user.id);
    res.json({ user: updated, customer });
  });

  // --- Customers Directory & Segments ---
  app.get('/api/admin/customers', (req, res) => {
    res.json(db.getCustomers());
  });

  app.get('/api/admin/customers/:id', (req, res) => {
    const cust = db.getCustomerById(req.params.id);
    if (!cust) return res.status(404).json({ error: 'Customer not found' });
    const orders = db.getOrders({ customerEmail: cust.email });
    res.json({ customer: cust, orders });
  });

  app.get('/api/admin/marketing/segments', (req, res) => {
    res.json(db.getCustomerSegments());
  });

  app.get('/api/admin/marketing/campaigns', (req, res) => {
    res.json(db.getCampaigns());
  });

  app.post('/api/admin/marketing/campaigns', (req, res) => {
    const campaign = db.createCampaign(req.body);
    res.status(201).json(campaign);
  });

  app.put('/api/admin/marketing/campaigns/:id', (req, res) => {
    const campaign = db.updateCampaign(req.params.id, req.body);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  });

  // --- Analytics & Visitor Tracking ---
  app.post('/api/analytics/track', (req, res) => {
    const { visitor_id, customer_id, event_type, payload } = req.body;
    if (visitor_id) {
      db.trackVisitor(visitor_id, customer_id);
    }
    if (event_type) {
      db.trackEvent({
        visitor_id: visitor_id || 'anonymous',
        customer_id,
        event_type,
        payload
      });
    }
    res.json({ success: true });
  });

  app.get('/api/admin/analytics', (req, res) => {
    res.json(db.getAnalyticsSummary());
  });

  // --- Wishlist ---
  app.get('/api/wishlist', (req, res) => {
    const user = (req as any).user;
    if (!user) return res.json([]);
    res.json(db.getUserWishlist(user.id));
  });

  app.post('/api/wishlist/toggle', (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Please login to use wishlist' });
    const { product_id } = req.body;
    const added = db.toggleWishlist(user.id, product_id);
    res.json({ added, wishlist: db.getUserWishlist(user.id) });
  });

  // --- Newsletter / Consent ---
  app.post('/api/newsletter', (req, res) => {
    const { email, phone, source } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    db.addMarketingConsent(email, phone, source);
    res.json({ success: true, message: 'Subscribed successfully! Check your email for exclusive deals.' });
  });

  // --- SEO Sitemap & Robots ---
  app.get('/sitemap.xml', (req, res) => {
    const products = db.getProducts();
    const categories = db.getCategories();
    const baseUrl = process.env.APP_URL || 'https://taztechmart.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/shop</loc><priority>0.9</priority></url>
  <url><loc>${baseUrl}/categories</loc><priority>0.8</priority></url>`;

    for (const cat of categories) {
      xml += `\n  <url><loc>${baseUrl}/shop?category=${cat.slug}</loc><priority>0.8</priority></url>`;
    }
    for (const prod of products) {
      xml += `\n  <url><loc>${baseUrl}/product/${prod.slug}</loc><priority>0.7</priority></url>`;
    }
    xml += `\n</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml`);
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TazTech Mart server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
