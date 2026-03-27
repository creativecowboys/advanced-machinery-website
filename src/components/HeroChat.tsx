import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, Send, ShoppingCart, Check, X, RotateCcw } from 'lucide-react';
import { sendMessage, type ChatMessage } from '../lib/gemini';
import { categories, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

// ─── Types ─────────────────────────────────────────────────────────────────

interface DisplayMessage {
    role: 'user' | 'ai';
    text: string;
    streaming?: boolean;
    productIds?: string[];
}

// ─── Suggestion Pills ───────────────────────────────────────────────────────

const PILLS = [
    { label: 'Melamine saw blade', query: 'What saw blade do I need for cutting melamine panels?' },
    { label: 'PCD diamond tools', query: 'Tell me about your PCD diamond tooling options' },
    { label: 'Biesse edgebander bits', query: 'I need edgebander tooling for a Biesse machine' },
    { label: 'CNC compression bits', query: 'What CNC compression router bits do you carry?' },
    { label: 'Metric boring bits', query: 'What metric boring bits do you stock?' },
];

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({ productId, onOpen }: { productId: string; onOpen: (p: Product) => void }) {
    const { addToCart, isInCart } = useCart();
    const product = categories.flatMap(c => c.products).find(p => p.id === productId);
    if (!product) return null;
    const inCart = isInCart(product.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-sm px-3 py-2.5 hover:bg-white/10 transition-colors cursor-pointer group"
            onClick={() => onOpen(product)}
        >
            <div className="w-10 h-10 bg-white/10 rounded-sm overflow-hidden shrink-0">
                {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold uppercase truncate group-hover:text-[#1E73C8] transition-colors">{product.name}</p>
                <p className="text-[#1E73C8] text-xs font-black">
                    {product.price}{product.priceFrom && '+'}
                </p>
            </div>
            <button
                onClick={e => { e.stopPropagation(); addToCart(product.id); }}
                className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-sm transition-all ${inCart
                    ? 'bg-green-500 text-white'
                    : 'bg-[#1E73C8] text-white hover:bg-[#155fa0]'
                    }`}
                title={inCart ? 'In cart' : 'Add to cart'}
            >
                {inCart ? <Check size={13} strokeWidth={3} /> : <ShoppingCart size={13} />}
            </button>
        </motion.div>
    );
}

// ─── AI Message Bubble ──────────────────────────────────────────────────────

function AIMessage({ msg, onOpen }: { msg: DisplayMessage; onOpen: (p: Product) => void }) {
    const cleanText = msg.text
        .replace(/\[\[PRODUCTS:[^\]]*\]\]/g, '')
        .replace(/\[\[ADD_TO_CART:[^\]]*\]\]/g, '')
        .trim();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
        >
            <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5 w-6 h-6 bg-[#1E73C8] rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-[#1E73C8] mb-1">Tooling Assistant</p>
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {cleanText}
                        {msg.streaming && (
                            <span className="inline-block w-1.5 h-4 bg-[#1E73C8] ml-0.5 animate-pulse align-middle" />
                        )}
                    </p>
                </div>
            </div>

            {/* Product cards */}
            {msg.productIds && msg.productIds.length > 0 && !msg.streaming && (
                <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.productIds.map((id, idx) => (
                        <div key={`${id}-${idx}`}>
                            <ProductCard productId={id} onOpen={onOpen} />
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ─── Main HeroChat Component ────────────────────────────────────────────────

interface HeroChatProps {
    /** Optional external query to fire (e.g. from pill click when collapsed) */
    initialQuery?: string | null;
    onQueryConsumed?: () => void;
}

export default function HeroChat({ initialQuery, onQueryConsumed }: HeroChatProps) {
    const { addToCart } = useCart();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll within the chat container — does NOT move the page
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Fire external query (e.g. pill click from parent)
    useEffect(() => {
        if (initialQuery) {
            submitQuery(initialQuery);
            onQueryConsumed?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]);

    const submitQuery = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;

        setExpanded(true);
        setInputValue('');

        const userMsg: DisplayMessage = { role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);

        const aiPlaceholder: DisplayMessage = { role: 'ai', text: '', streaming: true };
        setMessages(prev => [...prev, aiPlaceholder]);
        setIsStreaming(true);

        const newHistory: ChatMessage[] = [...history, { role: 'user', text: trimmed }];

        try {
            let streamedText = '';
            const result = await sendMessage(newHistory, trimmed, (chunk) => {
                streamedText += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'ai', text: streamedText, streaming: true };
                    return updated;
                });
            });

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'ai',
                    text: result.text,
                    streaming: false,
                    productIds: result.productIds,
                };
                return updated;
            });

            // Handle AI-triggered cart additions
            if (result.addToCartIds.length > 0) {
                result.addToCartIds.forEach(id => addToCart(id));
            }

            setHistory([...newHistory, { role: 'model', text: result.text }]);
        } catch (err) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'ai',
                    text: 'Sorry, something went wrong. Please try again.',
                    streaming: false,
                };
                return updated;
            });
        } finally {
            setIsStreaming(false);
        }
    }, [history, isStreaming]);

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') submitQuery(inputValue);
    }

    function handleReset() {
        setMessages([]);
        setHistory([]);
        setExpanded(false);
        setInputValue('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="w-full max-w-3xl mx-auto"
            >
                {/* ── Search / Input Bar ── */}
                <div
                    className={`flex items-center bg-white transition-all duration-200 ${focused || expanded
                        ? 'shadow-[0_0_0_3px_rgba(30,115,200,0.5),0_20px_60px_rgba(0,0,0,0.4)]'
                        : 'shadow-[0_8px_40px_rgba(0,0,0,0.35)]'
                        }`}
                >
                    <div className="pl-5 pr-3 shrink-0">
                        <Search size={20} className={`transition-colors ${focused || expanded ? 'text-[#1E73C8]' : 'text-[#999]'}`} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming}
                        placeholder={
                            expanded
                                ? 'Ask a follow-up question...'
                                : 'Ask anything — "I need a blade for cutting 18mm melamine..."'
                        }
                        className="flex-1 bg-transparent py-5 px-2 text-[#1A1A1A] placeholder:text-[#BBB] text-base font-medium outline-none disabled:opacity-60"
                    />
                    {expanded && (
                        <button
                            onClick={handleReset}
                            className="mr-1 text-[#999] hover:text-[#1A1A1A] p-2 transition-colors"
                            title="Start over"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => submitQuery(inputValue)}
                        disabled={!inputValue.trim() || isStreaming}
                        className="m-2 bg-[#1E73C8] text-white font-black uppercase text-xs tracking-widest px-6 py-3.5 flex items-center gap-2 hover:bg-[#155fa0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                        {expanded ? <Send size={14} /> : <Sparkles size={14} />}
                        {expanded ? 'Send' : 'Ask AI'}
                    </button>
                </div>

                {/* ── Suggestion Pills (only when not expanded) ── */}
                <AnimatePresence>
                    {!expanded && (
                        <motion.div
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-wrap justify-center gap-2 mt-4"
                        >
                            {PILLS.map(pill => (
                                <button
                                    key={pill.label}
                                    onClick={() => submitQuery(pill.query)}
                                    className="text-[11px] font-bold text-white/70 border border-white/25 px-3.5 py-1.5 hover:bg-white/15 hover:text-white hover:border-white/50 transition-all backdrop-blur-sm"
                                >
                                    {pill.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Inline Chat Thread ── */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="mt-3 bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden text-left"
                        >
                            {/* Thread header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={13} className="text-[#1E73C8]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                        Tooling Assistant · CarbideTooling.net AI
                                    </span>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="text-white/30 hover:text-white/70 transition-colors"
                                    title="Clear conversation"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={scrollContainerRef} className="px-4 py-4 max-h-[380px] overflow-y-auto flex flex-col gap-5 scroll-smooth text-left">
                                {messages.map((msg, i) =>
                                    msg.role === 'user' ? (
                                        <motion.div
                                            key={`usr-${i}`}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="self-end ml-auto max-w-[80%] bg-[#1E73C8] text-white px-4 py-2.5 text-sm font-medium rounded-sm text-left"
                                        >
                                            {msg.text}
                                        </motion.div>
                                    ) : (
                                        <div key={`ai-${i}`}>
                                            <AIMessage msg={msg} onOpen={setSelectedProduct} />
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10">
                                <p className="text-[10px] text-white/30 font-medium">Powered by Tool Lasso AI</p>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <RotateCcw size={10} /> New search
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtext when collapsed */}
                {!expanded && (
                    <p className="text-center text-white/40 text-xs font-medium mt-4 tracking-wide">
                        Powered by Tool Lasso AI · Ask in plain English
                    </p>
                )}
            </motion.div>
            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
    );
}
