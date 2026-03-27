import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingCart, Trash2, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
    const { cartItems, cartCount, cartTotal, removeFromCart, updateQty, clearCart, cartOpen, closeCart } = useCart();

    // Build mailto body with cart items
    function buildMailtoHref() {
        const lines = cartItems.map(i =>
            `• ${i.product.name} (x${i.quantity}) — ${i.product.price}`
        ).join('\n');
        const body = encodeURIComponent(
            `Hello,\n\nI'd like to request a quote for the following items:\n\n${lines}\n\nSubtotal: ${cartTotal}\n\nPlease contact me with pricing and availability.\n\nThank you.`
        );
        return `mailto:Sales@carbidetooling.net?subject=Quote%20Request%20from%20CarbideTooling.net&body=${body}`;
    }

    return (
        <AnimatePresence>
            {cartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={closeCart}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full sm:max-w-[440px] bg-white z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-[#1A2947] text-white px-6 py-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={20} />
                                <div>
                                    <p className="font-black uppercase text-sm tracking-wide leading-none">Your Cart</p>
                                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        {cartCount} {cartCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeCart}
                                className="w-9 h-9 hover:bg-white/10 flex items-center justify-center transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                                    <div className="w-20 h-20 bg-[#F7F7F7] flex items-center justify-center">
                                        <ShoppingCart size={32} className="text-[#CCC]" />
                                    </div>
                                    <p className="font-black uppercase text-[#1A1A1A] text-sm tracking-wide">Your cart is empty</p>
                                    <p className="text-[#999] text-sm">Ask the AI assistant to help you find the right tooling.</p>
                                    <button onClick={closeCart} className="bg-[#1E73C8] text-white font-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-[#155fa0] transition-colors">
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#F0F0F0]">
                                    {cartItems.map(({ product, quantity }) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 40 }}
                                            className="flex items-start gap-4 px-5 py-4"
                                        >
                                            {/* Image */}
                                            <div className="w-16 h-16 bg-[#F7F7F7] flex items-center justify-center shrink-0 overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-1"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black uppercase text-xs text-[#1A1A1A] leading-tight line-clamp-2">
                                                    {product.name}
                                                </p>
                                                <p className="text-[#1E73C8] font-bold text-sm mt-1">
                                                    {product.priceFrom ? 'From ' : ''}{product.price}
                                                </p>

                                                {/* Qty Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateQty(product.id, quantity - 1)}
                                                        className="w-7 h-7 border border-[#E0E0E0] flex items-center justify-center hover:border-[#1E73C8] hover:text-[#1E73C8] transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center font-black text-sm">{quantity}</span>
                                                    <button
                                                        onClick={() => updateQty(product.id, quantity + 1)}
                                                        className="w-7 h-7 border border-[#E0E0E0] flex items-center justify-center hover:border-[#1E73C8] hover:text-[#1E73C8] transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeFromCart(product.id)}
                                                className="text-[#CCC] hover:text-red-500 transition-colors mt-1 shrink-0"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t border-[#E0E0E0] px-6 py-5 space-y-4 shrink-0 bg-white">
                                {/* Totals */}
                                <div className="flex justify-between items-center">
                                    <span className="font-black uppercase text-xs tracking-widest text-[#666]">Estimated Subtotal</span>
                                    <span className="font-black text-xl text-[#1A1A1A]">{cartTotal}</span>
                                </div>
                                <p className="text-[10px] text-[#999] font-medium">
                                    Final pricing subject to availability and volume. Request a quote for exact pricing.
                                </p>

                                {/* CTA */}
                                <a
                                    href={buildMailtoHref()}
                                    className="flex items-center justify-center gap-2 bg-[#1E73C8] text-white font-black uppercase text-sm tracking-widest py-4 w-full hover:bg-[#155fa0] transition-colors"
                                >
                                    <Mail size={16} />
                                    Request a Quote
                                </a>
                                <button
                                    onClick={clearCart}
                                    className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-[#BBB] hover:text-red-500 transition-colors py-1"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
