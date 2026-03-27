import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Sparkles, RotateCcw, ExternalLink, ShoppingCart, CheckCircle } from 'lucide-react';
import { sendMessage, type ChatMessage } from '../lib/gemini';
import { categories } from '../data/products';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

// Flatten all products for lookup
const allProducts: Record<string, Product> = {};
categories.forEach(cat => {
    cat.products.forEach(p => { allProducts[p.id] = p; });
});

// Inline mini product card for chat
function ChatProductCard({ product, onAddToCart }: { product: Product; key?: string; onAddToCart: (id: string) => void }) {
    const { isInCart } = useCart();
    const inCart = isInCart(product.id);
    return (
        <div className="flex items-center gap-3 bg-white border border-[#E0E0E0] p-3 hover:border-[#1E73C8] hover:shadow-md transition-all group">
            <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 flex-1 min-w-0 no-underline"
            >
                <div className="w-12 h-12 bg-[#F7F7F7] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase text-[#1A1A1A] leading-tight line-clamp-2 group-hover:text-[#1E73C8] transition-colors">
                        {product.name}
                    </p>
                    <p className="text-[11px] font-bold text-[#1E73C8] mt-0.5">
                        {product.priceFrom ? 'From ' : ''}{product.price}
                    </p>
                </div>
                <ExternalLink size={11} className="text-[#CCC] group-hover:text-[#1E73C8] transition-colors shrink-0" />
            </a>
            <button
                onClick={() => onAddToCart(product.id)}
                className={`shrink-0 w-8 h-8 flex items-center justify-center transition-all ${inCart
                    ? 'bg-green-500 text-white'
                    : 'bg-[#1A2947] text-white hover:bg-[#1E73C8]'
                    }`}
                title={inCart ? 'In cart' : 'Add to cart'}
            >
                {inCart ? <CheckCircle size={14} /> : <ShoppingCart size={14} />}
            </button>
        </div>
    );
}

// Parse markdown-lite bold
function MessageText({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black text-[#1A1A1A]">{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

// Cart added toast
function CartToast({ count, onDismiss }: { count: number; onDismiss: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 3500);
        return () => clearTimeout(t);
    }, [onDismiss]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 mx-4"
        >
            <div className="bg-green-600 text-white text-xs font-bold flex items-center gap-2 px-4 py-3">
                <CheckCircle size={14} />
                {count} item{count !== 1 ? 's' : ''} added to your cart!
            </div>
        </motion.div>
    );
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    streaming?: boolean;
    productIds?: string[];
}

export interface AIChatHandle {
    openWithQuery: (query: string) => void;
}

const SUGGESTIONS = [
    'What saw blade do I need for melamine panels?',
    'Tell me about PCD diamond tooling',
    'What CNC router bits do you carry?',
    'I need edgebander tooling for a Biesse machine',
];

const WELCOME = "Hi! I'm your CarbideTooling.net product specialist. Ask me anything about our tooling — I can help you find the right saw blade, CNC bit, edgebander tooling, and more. I can even add items to your cart when you're ready to order. What are you working on?";

const AIChat = forwardRef<AIChatHandle>(function AIChat(_props, ref) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastCount, setToastCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef(false);
    const pendingQueryRef = useRef<string | null>(null);

    const { addToCart, cartCount, openCart } = useCart();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
            if (messages.length === 0) {
                setMessages([{ id: 'welcome', role: 'model', text: WELCOME, productIds: [] }]);
            }
            // If a query was queued (from hero search), fire it
            if (pendingQueryRef.current) {
                const q = pendingQueryRef.current;
                pendingQueryRef.current = null;
                setTimeout(() => handleSend(q), 100);
            }
        }
    }, [open]);

    // Exposed handle so parent can open chat with a pre-filled query
    useImperativeHandle(ref, () => ({
        openWithQuery(query: string) {
            if (open) {
                handleSend(query);
            } else {
                pendingQueryRef.current = query;
                setOpen(true);
            }
        }
    }));

    function handleCartAdd(ids: string[]) {
        if (ids.length === 0) return;
        ids.forEach(id => addToCart(id));
        setToastCount(ids.length);
    }

    async function handleSend(text?: string) {
        const messageText = (text ?? input).trim();
        if (!messageText || loading) return;

        setInput('');
        setError(null);
        abortRef.current = false;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: messageText };
        const streamingMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: '', streaming: true, productIds: [] };

        setMessages(prev => [...prev, userMsg, streamingMsg]);
        setLoading(true);

        const history: ChatMessage[] = messages
            .filter(m => m.id !== 'welcome' && !m.streaming)
            .map(m => ({ role: m.role, text: m.text, productIds: m.productIds }));

        try {
            let accumulatedText = '';

            const { text: finalText, productIds, addToCartIds } = await sendMessage(history, messageText, (chunk) => {
                if (abortRef.current) return;
                accumulatedText += chunk;
                const displayText = accumulatedText
                    .replace(/\[\[PRODUCTS:[^\]]*\]\]?/g, '')
                    .replace(/\[\[ADD_TO_CART:[^\]]*\]\]?/g, '')
                    .trimEnd();
                setMessages(prev => prev.map(m => m.streaming ? { ...m, text: displayText } : m));
            });

            if (!abortRef.current) {
                setMessages(prev => prev.map(m =>
                    m.streaming ? { ...m, text: finalText, streaming: false, productIds } : m
                ));
                if (addToCartIds.length > 0) {
                    handleCartAdd(addToCartIds);
                }
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            setError(errMsg);
            setMessages(prev => prev.filter(m => !m.streaming));
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        abortRef.current = true;
        setLoading(false);
        setMessages([]);
        setError(null);
        setToastCount(0);
        setTimeout(() => {
            setMessages([{ id: 'welcome', role: 'model', text: WELCOME, productIds: [] }]);
        }, 100);
    }

    return (
        <>
            {/* Floating Button — hidden on mobile (hero chat is primary) */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => setOpen(true)}
                        className="hidden md:flex fixed bottom-6 right-6 z-50 bg-[#1A2947] text-white w-16 h-16 rounded-full shadow-2xl items-center justify-center hover:bg-[#1E73C8] transition-colors group"
                        aria-label="Open AI product search"
                    >
                        <div className="relative">
                            <MessageSquare size={26} />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1E73C8] group-hover:bg-white rounded-full animate-pulse" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="hidden md:flex fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] flex-col bg-white shadow-2xl border border-[#E0E0E0]"
                        style={{ height: 'min(640px, calc(100vh - 100px))' }}
                    >
                        {/* Header */}
                        <div className="bg-[#1A2947] text-white px-5 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 bg-[#1E73C8] flex items-center justify-center">
                                        <Sparkles size={18} />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1A2947]" />
                                </div>
                                <div>
                                    <p className="font-black uppercase text-sm tracking-wide leading-none">Tooling Assistant</p>
                                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">CarbideTooling.net · AI</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Cart shortcut */}
                                <button
                                    onClick={() => { setOpen(false); openCart(); }}
                                    className="relative w-8 h-8 hover:bg-white/10 flex items-center justify-center transition-colors"
                                    title="View cart"
                                >
                                    <ShoppingCart size={16} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1E73C8] rounded-full text-[9px] font-black flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-8 h-8 hover:bg-white/10 flex items-center justify-center transition-colors"
                                    title="Reset conversation"
                                >
                                    <RotateCcw size={15} />
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-8 h-8 hover:bg-white/10 flex items-center justify-center transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-[#1A2947] text-white px-4 py-2.5 max-w-[85%] text-sm font-medium leading-relaxed">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="max-w-[92%] space-y-3">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className="w-5 h-5 bg-[#1E73C8] flex items-center justify-center">
                                                    <Sparkles size={11} className="text-white" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#999]">Tooling AI</span>
                                            </div>

                                            {(msg.text || msg.streaming) && (
                                                <div className="bg-[#F7F7F7] border border-[#E8E8E8] px-4 py-3 text-sm text-[#333] leading-relaxed">
                                                    {msg.text ? <MessageText text={msg.text} /> : null}
                                                    {msg.streaming && (
                                                        <span className="inline-flex items-center gap-1 ml-1">
                                                            <span className="w-1 h-3 bg-[#1E73C8] animate-pulse inline-block" />
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Product Cards */}
                                            {!msg.streaming && msg.productIds && msg.productIds.length > 0 && (
                                                <div className="space-y-2 pt-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#999] px-0.5">
                                                        Suggested Products
                                                    </p>
                                                    {msg.productIds.map(id => {
                                                        const product = allProducts[id];
                                                        return product ? (
                                                            <ChatProductCard
                                                                key={id}
                                                                product={product}
                                                                onAddToCart={(productId) => { addToCart(productId); setToastCount(1); }}
                                                            />
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
                                    {error}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion Chips */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSend(s)}
                                        disabled={loading}
                                        className="text-[11px] font-bold bg-[#F0F4FF] border border-[#C8D8F0] text-[#1A2947] px-3 py-1.5 hover:bg-[#1E73C8] hover:text-white hover:border-[#1E73C8] transition-colors disabled:opacity-40"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="relative border-t border-[#E0E0E0] px-4 py-3 flex gap-2 shrink-0 bg-white">
                            {/* Cart toast */}
                            <AnimatePresence>
                                {toastCount > 0 && (
                                    <CartToast count={toastCount} onDismiss={() => setToastCount(0)} />
                                )}
                            </AnimatePresence>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Ask about tooling, or say 'add to cart'..."
                                className="flex-1 text-sm bg-[#F7F7F7] border border-[#E0E0E0] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1E73C8] focus:border-transparent placeholder:text-[#BBB] font-medium"
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="w-11 h-11 bg-[#1A2947] text-white flex items-center justify-center hover:bg-[#1E73C8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-[#F7F7F7] border-t border-[#E8E8E8] shrink-0">
                            <p className="text-[10px] text-[#BBB] font-bold uppercase tracking-widest text-center">
                                Powered by Gemini AI · CarbideTooling.net
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});

export default AIChat;
