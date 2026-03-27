import { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import type { Category } from '../data/products';
import ProductCard from './ProductCard';

interface CategoryPageProps {
    category: Category;
    onBack: () => void;
}

export default function CategoryPage({ category, onBack }: CategoryPageProps) {
    const [search, setSearch] = useState('');
    const [activeSubcat, setActiveSubcat] = useState('All');

    const filtered = category.products.filter((p) => {
        const matchesSearch =
            search === '' ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Category Hero */}
            <div className="bg-[#1A2947] text-white py-16 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A2947] via-[#1A2947]/80 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        All Categories
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
                            {category.name}
                        </h1>
                        <div className="h-1 w-16 bg-[#1E73C8] mb-6" />
                        <p className="text-white/70 max-w-2xl text-lg leading-relaxed">
                            {category.description}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#F7F7F7] border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col gap-3">
                    {/* Top row: search + count */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E73C8] font-medium"
                            />
                        </div>
                        <span className="text-xs font-bold text-[#999] uppercase tracking-wide shrink-0">
                            {filtered.length} {filtered.length !== 1 ? 'products' : 'product'}
                        </span>
                    </div>

                    {/* Subcategory Pills — horizontal scroll on mobile */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <SlidersHorizontal size={14} className="text-[#999] shrink-0" />
                        {['All', ...category.subcategories].map((sub) => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubcat(sub)}
                                className={`text-[11px] font-black uppercase tracking-wide px-3 py-1.5 border transition-colors shrink-0 ${activeSubcat === sub
                                    ? 'bg-[#1A2947] text-white border-[#1A2947]'
                                    : 'bg-white text-[#555] border-[#E0E0E0] hover:border-[#1A2947] hover:text-[#1A2947]'
                                    }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((product, i) => {
                            return <ProductCard key={product.id} product={product} index={i} />;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <p className="text-[#999] font-bold uppercase tracking-widest text-sm">No products found</p>
                        <button
                            onClick={() => setSearch('')}
                            className="mt-4 text-[#1E73C8] font-black uppercase text-xs tracking-widest hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-20 bg-[#1A2947] text-white p-10 text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">
                        Don't see what you need?
                    </h3>
                    <p className="text-white/60 mb-6 text-sm">
                        We carry hundreds of SKUs. Contact us for custom tooling, special sizes, or bulk pricing.
                    </p>
                    <a
                        href="mailto:Sales@carbidetooling.net"
                        className="inline-flex items-center gap-2 bg-[#1E73C8] text-white font-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-white hover:text-[#1A2947] transition-colors"
                    >
                        Contact Our Team
                    </a>
                </div>
            </div>
        </div>
    );
}
