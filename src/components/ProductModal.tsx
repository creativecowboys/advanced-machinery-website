import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Check, ExternalLink, Tag, Package } from 'lucide-react';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
}

// Parse the description into labelled spec lines where possible
function parseSpecs(description: string): { label: string; value: string }[] {
    const specs: { label: string; value: string }[] = [];

    // Dimension pattern: e.g. "250mm x 3.2/2.2mm x 30mm"
    const dimMatch = description.match(/(\d+[\d./]*mm\s*x\s*[\d./]+mm(?:\s*x\s*[\d./]+mm)?)/i);
    if (dimMatch) specs.push({ label: 'Dimensions', value: dimMatch[1] });

    // Tooth count: e.g. "Z80" or "Z72"
    const toothMatch = description.match(/\bZ(\d+)\b/);
    if (toothMatch) specs.push({ label: 'Tooth Count', value: `${toothMatch[1]} teeth` });

    // Shank size: e.g. "1/4SK" or "1/4\" shank"
    const shankMatch = description.match(/([\d/]+"?\s*(?:SK|shank))/i);
    if (shankMatch) specs.push({ label: 'Shank', value: shankMatch[1].replace('SK', '" shank') });

    // Flute count / type: "2 Flute", "2+2 flute", "O Flute"
    const fluteMatch = description.match(/([\d+]+(?:\+\d+)?\s+(?:Flute|flutes?|O[ -]Flute))/i);
    if (fluteMatch) specs.push({ label: 'Flute Type', value: fluteMatch[1] });

    // Pin pattern
    const pinMatch = description.match(/Pin Pattern[\s:]*([\d/+]+(?:\s*\+\s*[\d/+]+)*)/i);
    if (pinMatch) specs.push({ label: 'Pin Pattern', value: pinMatch[1] });

    // Machine compatibility: "Fits X" or "for Biesse" / "for Holzma"
    const machineMatch = description.match(/(?:Fits|for)\s+([\w\s]+?(?:Akron|Biesse|Holzma|Holzher|Brandt|Homag|SCM)[^\s.,]*)/i);
    if (machineMatch) specs.push({ label: 'Compatible Machine', value: machineMatch[1].trim() });

    // Orientation: Left Hand / Right Hand
    const orientMatch = description.match(/\b(Left[ -]?Hand|Right[ -]?Hand|LH|RH)\b/i);
    if (orientMatch) specs.push({ label: 'Orientation', value: orientMatch[1] });

    // Direction: Upcut / Downcut / Compression
    const dirMatch = description.match(/\b(Upcut|Downcut|Compression)\b/i);
    if (dirMatch) specs.push({ label: 'Cut Direction', value: dirMatch[1] });

    return specs;
}

// Find what category a product belongs to
function getCategoryName(product: Product): string {
    const cat = categories.find(c => c.id === product.category);
    return cat?.name ?? product.category;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
    const { addToCart, isInCart } = useCart();

    if (!product) return null;
    const inCart = isInCart(product.id);
    const specs = parseSpecs(product.description);
    const categoryName = getCategoryName(product);

    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-xl bg-[#0D1520] border border-white/10 shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0A1018]">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-[#1E73C8]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                        {categoryName}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/40 hover:text-white transition-colors p-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col sm:flex-row gap-0">
                                {/* Product image */}
                                <div className="sm:w-48 shrink-0 bg-white flex items-center justify-center p-6">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full max-h-40 object-contain"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-5 flex flex-col gap-4">
                                    <div>
                                        <h2 className="text-white font-black uppercase text-base leading-tight tracking-tight mb-2">
                                            {product.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#1E73C8] font-black text-xl">
                                                {product.price}
                                            </span>
                                            {product.priceFrom && (
                                                <span className="text-white/40 text-xs font-bold uppercase">and up</span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {product.description}
                                    </p>

                                    {/* Parsed specs */}
                                    {specs.length > 0 && (
                                        <div className="border-t border-white/10 pt-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2.5 flex items-center gap-1.5">
                                                <Tag size={10} /> Specifications
                                            </p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                {specs.map(spec => (
                                                    <div key={spec.label}>
                                                        <p className="text-[10px] text-white/35 font-bold uppercase tracking-wide">{spec.label}</p>
                                                        <p className="text-white/80 text-xs font-medium">{spec.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-[#0A1018]">
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-black uppercase text-xs tracking-widest transition-all ${inCart
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#1E73C8] text-white hover:bg-[#155fa0]'
                                        }`}
                                >
                                    {inCart ? <Check size={14} strokeWidth={3} /> : <ShoppingCart size={14} />}
                                    {inCart ? 'In Cart' : 'Add to Cart'}
                                </button>
                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/50 py-3 px-5 font-black uppercase text-xs tracking-widest transition-all"
                                >
                                    <ExternalLink size={13} />
                                    View on Site
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
