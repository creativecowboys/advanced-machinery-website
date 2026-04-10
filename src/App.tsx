import { useState } from 'react';
import {
  Menu,
  ShoppingCart,
  ChevronRight,
  Phone,
  Mail,
  ArrowRight,
  Wrench,
  GraduationCap,
  HeadphonesIcon,
  Settings2,
  MapPin,
  Star,
  X,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categories, type Category } from './data/products';
import CategoryPage from './components/CategoryPage';
import AIChat from './components/AIChat';
import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import { CabinetsIcon, ConstructionIcon, PlasticsIcon, ArchitectureIcon, AerospaceIcon, FurnitureIcon } from './components/IndustryIcons';
import HeroChat from './components/HeroChat';
import AboutPage from './components/AboutPage';

// Separate machinery and tooling categories
const machineryCategories = categories.filter(c => c.isMachinery);
const toolingCategories = categories.filter(c => !c.isMachinery);

// Brand logos (text-based since we don't have local assets)
const BRANDS = ['Homag', 'Ironwood', 'SawStop', 'Altendorf', 'Sandteq', 'TigerStop', 'Amana Tool', 'Stiles'];

function AppInner() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goHome = () => { setActiveCategory(null); setAboutOpen(false); setMobileMenuOpen(false); };
  const { cartCount, openCart } = useCart();

  const featuredMachinery = machineryCategories[0]; // CNC Routers
  const featuredProduct = featuredMachinery?.products[0];

  if (aboutOpen && !activeCategory) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
        {/* Top Utility Bar */}
        <div className="bg-[#0F1F3A] text-white text-[10px] uppercase tracking-widest py-2 px-4 md:px-8 flex justify-between items-center border-b border-white/10">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> 801-498-7891</span>
            <span className="hidden md:flex items-center gap-1"><Mail size={12} /> office@advanced-machinery.com</span>
          </div>
          <div className="flex gap-4">
            <a href="mailto:office@advanced-machinery.com" className="hover:text-[#2E6DB4] transition-colors">Support</a>
          </div>
        </div>
        <header className="bg-[#1A2B4A] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-8">
            <button onClick={goHome} className="flex items-center shrink-0">
              <img src="/Advanced Machinery Logo.png" alt="Advanced Machinery Systems" className="h-10 w-auto" />
            </button>
            <nav className="hidden lg:flex gap-6 font-bold uppercase text-sm tracking-wide">
              {categories.slice(0, 5).map(cat => (
                <button key={cat.id} onClick={() => { setAboutOpen(false); setActiveCategory(cat); }} className="hover:text-[#2E6DB4] transition-colors">{cat.name}</button>
              ))}
              <button className="text-[#2E6DB4]">About</button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="relative" onClick={openCart}>
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-[#2E6DB4] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              </button>
            </div>
          </div>
        </header>
        <AboutPage onBack={goHome} />
        <AIChat />
        <CartDrawer />
        <footer className="bg-[#0F1F3A] text-white pt-8 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">© 2026 ADVANCED MACHINERY SYSTEMS. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-8 text-[10px] uppercase tracking-widest text-white/40 font-bold">
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>
        <div className="bg-[#2E6DB4] py-3 text-center">
          <a
            href="https://leadlasso.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-widest font-black text-white/80 hover:text-white transition-colors"
          >
            Powered by Lead Lasso
          </a>
        </div>
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
        {/* Top Utility Bar */}
        <div className="bg-[#0F1F3A] text-white text-[10px] uppercase tracking-widest py-2 px-4 md:px-8 flex justify-between items-center border-b border-white/10">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> 801-498-7891</span>
            <span className="hidden md:flex items-center gap-1"><Mail size={12} /> office@advanced-machinery.com</span>
          </div>
          <div className="flex gap-4">
            <a href="mailto:office@advanced-machinery.com" className="hover:text-[#2E6DB4] transition-colors">Support</a>
          </div>
        </div>

        {/* Main Header */}
        <header className="bg-[#1A2B4A] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-8">
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center shrink-0"
            >
              <img src="/Advanced Machinery Logo.png" alt="Advanced Machinery Systems" className="h-10 w-auto" />
            </button>

            <nav className="hidden lg:flex gap-6 font-bold uppercase text-sm tracking-wide">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`hover:text-[#2E6DB4] transition-colors ${activeCategory?.id === cat.id ? 'text-[#2E6DB4]' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className="relative" onClick={openCart}>
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-[#2E6DB4] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              </button>
            </div>
          </div>
        </header>

        <CategoryPage category={activeCategory} onBack={() => setActiveCategory(null)} />

        <AIChat />
        <CartDrawer />

        {/* Footer */}
        <footer className="bg-[#0F1F3A] text-white pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                © 2026 ADVANCED MACHINERY SYSTEMS. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-8 text-[10px] uppercase tracking-widest text-white/40 font-bold">
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>
        <div className="bg-[#2E6DB4] py-3 text-center">
          <a
            href="https://leadlasso.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-widest font-black text-white/80 hover:text-white transition-colors"
          >
            Powered by Lead Lasso
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
      {/* Top Utility Bar — hidden on mobile to save space */}
      <div className="hidden sm:flex bg-[#0F1F3A] text-white text-[10px] uppercase tracking-widest py-2 px-4 md:px-8 justify-between items-center border-b border-white/10">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone size={12} /> 801-498-7891</span>
          <span className="hidden md:flex items-center gap-1"><Mail size={12} /> office@advanced-machinery.com</span>
        </div>
        <div className="flex gap-4">
          <a href="mailto:office@advanced-machinery.com" className="hover:text-[#2E6DB4] transition-colors">Contact</a>
          <a href="#" className="hover:text-[#2E6DB4] transition-colors">Find a Rep</a>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#1A2B4A] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img src="/Advanced Machinery Logo.png" alt="Advanced Machinery Systems" className="h-7 sm:h-9 md:h-10 w-auto" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 font-bold text-sm tracking-wide">
            <div className="relative group">
              <button className="hover:text-[#2E6DB4] transition-colors flex items-center gap-1">
                Machinery <ChevronRight size={14} className="rotate-90" />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-[#0F1F3A] border border-white/10 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                {machineryCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat)}
                    className="block w-full text-left px-5 py-2.5 text-xs font-bold text-white/70 hover:text-[#2E6DB4] hover:bg-white/5 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group">
              <button className="hover:text-[#2E6DB4] transition-colors flex items-center gap-1">
                Tooling <ChevronRight size={14} className="rotate-90" />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-[#0F1F3A] border border-white/10 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                {toolingCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat)}
                    className="block w-full text-left px-5 py-2.5 text-xs font-bold text-white/70 hover:text-[#2E6DB4] hover:bg-white/5 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <button className="hover:text-[#2E6DB4] transition-colors">Service</button>
            <button onClick={() => { setAboutOpen(true); setActiveCategory(null); }} className="hover:text-[#2E6DB4] transition-colors">About</button>
            <a href="mailto:office@advanced-machinery.com" className="hover:text-[#2E6DB4] transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative" onClick={openCart}>
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-[#2E6DB4] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
            </button>
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[#0F1F3A] overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-4 gap-1">
                <p className="text-xs font-black uppercase tracking-widest text-white/50 px-2 pt-2 pb-1 border-l-2 border-[#2E6DB4] ml-0.5">Machinery</p>
                {machineryCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat); setMobileMenuOpen(false); }}
                    className="text-left font-bold uppercase text-sm tracking-wide text-white/80 hover:text-[#2E6DB4] transition-colors py-2.5 border-b border-white/5 px-2"
                  >
                    {cat.name}
                  </button>
                ))}
                <p className="text-xs font-black uppercase tracking-widest text-white/50 px-2 pt-4 pb-1 border-l-2 border-[#2E6DB4] ml-0.5">Tooling</p>
                {toolingCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat); setMobileMenuOpen(false); }}
                    className="text-left font-bold uppercase text-sm tracking-wide text-white/80 hover:text-[#2E6DB4] transition-colors py-2.5 border-b border-white/5 px-2"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[600px] md:min-h-[720px] bg-[#0F1F3A] overflow-hidden flex items-center">
        {/* Background image — real shop floor */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('/hero-shop-floor.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,#0F1F3A_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1F3A]/80 via-transparent to-[#0F1F3A]/90" />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#2E6DB4 1px, transparent 1px), linear-gradient(90deg, #2E6DB4 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />

        {/* Subtle text-area scrim */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-4xl h-full" style={{
            background: 'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(15,31,58,0.72) 0%, transparent 100%)'
          }} />
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="w-6 h-px bg-[#2E6DB4] hidden sm:block" />
            <span className="text-[#2E6DB4] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[10px] sm:text-xs">
              Founded 1989 · Intermountain West · AI-Powered Search
            </span>
            <span className="w-6 h-px bg-[#2E6DB4] hidden sm:block" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-white text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-[0.95] sm:leading-[0.88] tracking-tighter mb-4"
          >
            Your Partner In<br />
            <span className="text-[#2E6DB4]">Wood Manufacturing</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/50 text-sm sm:text-base font-medium mb-8 md:mb-10 max-w-xl px-2 sm:px-0"
          >
            35+ years of woodworking machinery expertise. From CNC routers to precision tooling — we deliver solutions that maximize your productivity and profitability.
          </motion.p>

          <div className="w-full">
            <HeroChat />
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS BAR ── */}
      <div className="bg-[#1A2B4A] text-white py-5 md:py-6 border-b-4 border-[#0F1F3A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          <div className="flex items-center gap-3">
            <Star size={28} strokeWidth={1.5} className="text-[#2E6DB4] shrink-0" />
            <div>
              <h3 className="font-black uppercase text-sm leading-none">35+ Years</h3>
              <p className="text-xs font-bold opacity-70 uppercase">of Wood Mfg. Expertise</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wrench size={28} strokeWidth={1.5} className="text-[#2E6DB4] shrink-0" />
            <div>
              <h3 className="font-black uppercase text-sm leading-none">6 Field Reps</h3>
              <p className="text-xs font-bold opacity-70 uppercase">On-site Service & Support</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Settings2 size={28} strokeWidth={1.5} className="text-[#2E6DB4] shrink-0" />
            <div>
              <h3 className="font-black uppercase text-sm leading-none">Machinery & Tooling</h3>
              <p className="text-xs font-bold opacity-70 uppercase">One Complete Partner</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={28} strokeWidth={1.5} className="text-[#2E6DB4] shrink-0" />
            <div>
              <h3 className="font-black uppercase text-sm leading-none">Intermountain West</h3>
              <p className="text-xs font-bold opacity-70 uppercase">UT · ID · MT · WY · AZ · CO</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── OUR SOLUTIONS ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Our Solutions</h2>
            <div className="h-1 w-20 bg-[#2E6DB4] mt-3 mx-auto" />
            <p className="text-[#777] mt-4 max-w-xl mx-auto font-medium text-sm md:text-base">
              Advanced Machinery Systems delivers everything your wood manufacturing operation needs to succeed.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: <Settings2 size={32} strokeWidth={1.5} className="text-[#2E6DB4]" />,
                title: 'Machinery',
                desc: 'Industrial CNC routers, edgebanders, panel saws, wide belt sanders, and more from the world\'s leading manufacturers.',
                cta: 'Browse Machinery',
                onClick: () => setActiveCategory(machineryCategories[0])
              },
              {
                icon: <Wrench size={32} strokeWidth={1.5} className="text-[#2E6DB4]" />,
                title: 'Tooling',
                desc: 'Precision CNC router bits, edgebander tooling, saw blades, boring bits, and collets — in stock and ready to ship.',
                cta: 'Shop Tooling',
                onClick: () => setActiveCategory(toolingCategories[0])
              },
              {
                icon: <HeadphonesIcon size={32} strokeWidth={1.5} className="text-[#2E6DB4]" />,
                title: 'Service',
                desc: '6 specialist field service reps covering CNCs, edgebanders, sanders, and beam saws across the Intermountain West.',
                cta: 'Our Service',
                onClick: () => {}
              },
              {
                icon: <GraduationCap size={32} strokeWidth={1.5} className="text-[#2E6DB4]" />,
                title: 'Education',
                desc: 'Workshops, training, and case studies designed to help your shop cut costs, increase throughput, and maximize profits.',
                cta: 'Learn More',
                onClick: () => {}
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#F7F8FA] border border-[#E8EAED] p-4 sm:p-8 hover:border-[#2E6DB4] hover:shadow-lg transition-all group cursor-pointer"
                onClick={s.onClick}
              >
                <div className="mb-3 sm:mb-5">{s.icon}</div>
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight text-[#1A1A1A] mb-2 sm:mb-3 group-hover:text-[#2E6DB4] transition-colors">{s.title}</h3>
                <p className="hidden sm:block text-sm text-[#666] leading-relaxed mb-6 font-medium">{s.desc}</p>
                <button
                  onClick={s.onClick}
                  className="flex items-center gap-1.5 sm:gap-2 font-black uppercase text-[10px] sm:text-xs tracking-widest text-[#2E6DB4] hover:gap-3 transition-all"
                >
                  {s.cta} <ArrowRight size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MACHINERY CATEGORIES ── */}
      <section className="py-12 md:py-20 bg-[#F5F6F8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Industrial Machinery</h2>
              <div className="h-1 w-20 bg-[#2E6DB4] mt-2" />
            </div>
            <button
              onClick={() => setActiveCategory(machineryCategories[0])}
              className="hidden md:flex items-center gap-2 font-bold uppercase text-sm hover:text-[#2E6DB4] transition-colors text-[#1A1A1A]"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {machineryCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => setActiveCategory(cat)}
                className="group bg-white border border-[#E0E3E8] overflow-hidden cursor-pointer hover:border-[#2E6DB4] transition-colors shadow-sm hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-[#F5F6F8]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const parent = el.parentElement;
                      if (parent) {
                        parent.style.background = 'linear-gradient(135deg,#1A2B4A,#0F1F3A)';
                      }
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-[#2E6DB4] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                    Request Quote
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#2E6DB4] transition-colors mb-2">{cat.name}</h3>
                  <ul className="space-y-1 mb-4">
                    {cat.subcategories.slice(0, 3).map((item, j) => (
                      <li key={j} className="text-xs text-[#777] font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#2E6DB4] shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button className="flex items-center gap-2 font-black uppercase text-xs tracking-widest group-hover:text-[#2E6DB4] transition-colors text-[#1A1A1A]">
                    Learn More <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP: CNC ROUTERS ── */}
      <section className="bg-[#0F1F3A] text-white py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-[#2E6DB4]/10 rounded-full blur-3xl" />
            <div className="relative z-10 overflow-hidden aspect-[4/3] border border-white/10">
              <img
                src="https://www.homag.com/fileadmin/_processed_/b/1/csm_cnc-processing-center-centateq-p-210_eb6d8fd5f3.jpg"
                alt="Homag Centateq P-210 CNC Router"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg,#1A2B4A,#0F1F3A)';
                  }
                }}
              />
              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#2E6DB4] pointer-events-none" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#2E6DB4] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#2E6DB4] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#2E6DB4] pointer-events-none" />
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="text-[#2E6DB4] font-black uppercase tracking-widest text-sm mb-4 block">Featured Machinery</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-5 md:mb-6">
              Homag Centateq<br />
              <span className="text-[#2E6DB4]">CNC Routers</span>
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              The world's leading CNC machining center for cabinet and furniture manufacturers. The Homag Centateq line delivers unmatched precision, reliability, and software integration for shops of every size.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                { text: "Pod & Rail and Nested Base configurations", mobileHide: false },
                { text: "Full Homag software ecosystem integration", mobileHide: false },
                { text: "5-axis machining capability available", mobileHide: false },
                { text: "Backed by Advanced Machinery's 6 local field service reps", mobileHide: true },
              ].map((feature, i) => (
                <li key={i} className={`flex items-start gap-3 ${feature.mobileHide ? 'hidden sm:flex' : ''}`}>
                  <div className="mt-1 bg-[#2E6DB4] text-white p-0.5">
                    <ChevronRight size={14} strokeWidth={4} />
                  </div>
                  <span className="font-bold uppercase text-sm tracking-wide">{feature.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setActiveCategory(machineryCategories[0])}
              className="bg-[#2E6DB4] text-white font-black uppercase text-sm tracking-widest px-8 py-4 hover:bg-[#1a4f8a] transition-colors"
            >
              Request a CNC Quote
            </button>
          </div>
        </div>
      </section>

      {/* ── TOOLING CATEGORIES ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Shop Tooling</h2>
              <div className="h-1 w-20 bg-[#2E6DB4] mt-2" />
            </div>
            <button
              onClick={() => setActiveCategory(toolingCategories[0])}
              className="hidden md:flex items-center gap-2 font-bold uppercase text-sm hover:text-[#2E6DB4] transition-colors text-[#1A1A1A]"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolingCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                onClick={() => setActiveCategory(cat)}
                className="group relative bg-[#F7F8FA] overflow-hidden cursor-pointer border border-[#E0E3E8] hover:border-[#2E6DB4] transition-colors hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl font-black uppercase mb-3 text-[#1A1A1A] group-hover:text-[#2E6DB4] transition-colors">{cat.name}</h3>
                  <ul className="space-y-1 mb-6">
                    {cat.subcategories.slice(0, 3).map((item, j) => (
                      <li key={j} className="text-sm text-[#777] font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#2E6DB4] shrink-0" /> {item}
                      </li>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <li className="text-sm text-[#999] font-medium pl-3">+{cat.subcategories.length - 3} more</li>
                    )}
                  </ul>
                  <button className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest group-hover:text-[#2E6DB4] transition-colors text-[#1A1A1A]">
                    Shop Now <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="py-16 bg-[#F5F6F8] border-y border-[#E0E3E8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#999] mb-10">Authorized Brands & Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {BRANDS.map((brand) => (
              <div key={brand} className="text-[#BABABA] hover:text-[#2E6DB4] transition-colors font-black uppercase tracking-widest text-sm cursor-default select-none">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Industries We Serve</h2>
            <div className="h-1 w-20 bg-[#2E6DB4] mt-3 mx-auto" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {([
              { name: 'Cabinets & Closets', Icon: CabinetsIcon },
              { name: 'Construction', Icon: ConstructionIcon },
              { name: 'Plastics', Icon: PlasticsIcon },
              { name: 'Architecture', Icon: ArchitectureIcon },
              { name: 'Aerospace', Icon: AerospaceIcon },
              { name: 'Furniture', Icon: FurnitureIcon },
            ] as const).map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex flex-col items-center text-center p-3 md:p-6 bg-[#F7F8FA] border border-[#E8EAED] hover:border-[#2E6DB4] hover:shadow-md transition-all group"
              >
                <industry.Icon size={32} className="text-[#2E6DB4] mb-2 md:mb-3 group-hover:text-[#1a4f8a] transition-colors md:size-[44px]" />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-wide text-[#1A1A1A] group-hover:text-[#2E6DB4] transition-colors leading-tight">{industry.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 md:py-20 bg-[#0F1F3A] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">What Our Partners Say</h2>
            <div className="h-1 w-20 bg-[#2E6DB4] mt-3 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-5 md:gap-8">
            {[
              {
                quote: "Advanced Machinery has been our go-to resource for over 15 years. Their service team responds quickly and knows our machines better than anyone. An indispensable partner for our shop.",
                author: "Mike R.",
                segment: "Cabinet Manufacturer",
                location: "Salt Lake City, UT",
              },
              {
                quote: "When we needed to upgrade our CNC setup, Advanced Machinery walked us through every option and helped us find the right machine for our production volume. The ongoing support has been exceptional.",
                author: "Karen T.",
                segment: "Closet Systems",
                location: "Boise, ID",
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#1A2B4A] p-6 md:p-10 border-l-4 border-[#2E6DB4] relative overflow-hidden">
                <div className="absolute top-4 right-5 text-[#2E6DB4]/20 text-7xl md:text-8xl font-black leading-none pointer-events-none">"</div>
                <p className="text-base md:text-lg italic font-medium mb-6 md:mb-8 text-white/80 leading-relaxed relative z-10">"{t.quote}"</p>
                <div>
                  <h4 className="font-black uppercase text-base text-white">{t.author}</h4>
                  <p className="text-sm font-bold text-[#2E6DB4] uppercase tracking-wide">{t.segment}</p>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wide flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CTA ── */}
      <section className="py-12 md:py-20 bg-[#2E6DB4] text-white">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6">
            Need Machine Service<br />or a Quote?
          </h2>
          <p className="text-white/80 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto font-medium">
            Our 6 specialist field service reps cover the entire Intermountain West. Reach out and we'll connect you with the right expert for your operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="mailto:office@advanced-machinery.com"
              className="bg-white text-[#2E6DB4] font-black uppercase text-sm tracking-widest px-8 py-4 hover:bg-[#F0F4FF] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Mail size={16} /> Email Our Team
            </a>
            <a
              href="tel:8014987891"
              className="bg-[#1a4f8a] text-white font-black uppercase text-sm tracking-widest px-8 py-4 hover:bg-[#0F1F3A] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone size={16} /> 801-498-7891
            </a>
          </div>
        </div>
      </section>

      <AIChat />
      <CartDrawer />

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F1F3A] text-white pt-12 md:pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-10 md:mb-16">
            <div>
              <div className="flex flex-col items-start mb-6">
                <img src="/Advanced Machinery Logo.png" alt="Advanced Machinery Systems" className="h-10 w-auto" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Premier provider of woodworking solutions in the Intermountain West since 1989.
              </p>
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-bold mb-1">
                <MapPin size={11} /> 657 N Kays Dr., Kaysville, UT 84037
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-bold mb-1">
                <Phone size={11} /> 801-498-7891
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-bold">
                <Mail size={11} /> office@advanced-machinery.com
              </div>
              <div className="flex gap-3 mt-6">
                {['f', 'in', 'yt', 'tw', 'ig'].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-[#2E6DB4] transition-colors font-black italic text-xs">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase text-sm tracking-widest mb-6 border-b border-white/10 pb-2">Machinery</h4>
              <ul className="space-y-3 text-sm font-bold uppercase text-white/50">
                {machineryCategories.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => setActiveCategory(cat)} className="hover:text-[#2E6DB4] transition-colors text-left">
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase text-sm tracking-widest mb-6 border-b border-white/10 pb-2">Tooling</h4>
              <ul className="space-y-3 text-sm font-bold uppercase text-white/50">
                {toolingCategories.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => setActiveCategory(cat)} className="hover:text-[#2E6DB4] transition-colors text-left">
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase text-sm tracking-widest mb-6 border-b border-white/10 pb-2">Company</h4>
              <ul className="space-y-3 text-sm font-bold uppercase text-white/50 mb-8">
                <li><a href="#" className="hover:text-[#2E6DB4] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#2E6DB4] transition-colors">Service & Support</a></li>
                <li><a href="#" className="hover:text-[#2E6DB4] transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-[#2E6DB4] transition-colors">Education & Events</a></li>
                <li><a href="mailto:office@advanced-machinery.com" className="hover:text-[#2E6DB4] transition-colors">Contact</a></li>
              </ul>
              <h4 className="font-black uppercase text-sm tracking-widest mb-4 border-b border-white/10 pb-2">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-white/10 border-none py-3 px-4 text-xs flex-1 outline-none focus:ring-1 focus:ring-[#2E6DB4] text-white placeholder:text-white/30 font-bold uppercase tracking-widest"
                />
                <button className="bg-[#2E6DB4] text-white font-black uppercase text-xs tracking-widest px-4 hover:bg-[#1a4f8a] transition-colors">Join</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
              © 2026 Advanced Machinery Systems. All rights reserved.
            </p>
            <div className="flex gap-2 items-center">
              <a href="https://www.advanced-machinery.com" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest text-white/30 font-bold hover:text-white/60 transition-colors flex items-center gap-1">
                advanced-machinery.com <ExternalLink size={9} />
              </a>
            </div>
            <div className="flex gap-6 text-[10px] uppercase tracking-widest text-white/30 font-bold">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
      <div className="bg-[#2E6DB4] py-3 text-center">
        <a
          href="https://leadlasso.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-widest font-black text-white/80 hover:text-white transition-colors"
        >
          Powered by Lead Lasso
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}
