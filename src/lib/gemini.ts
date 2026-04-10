import { GoogleGenAI } from '@google/genai';
import { categories } from '../data/products';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// Build a compact product catalog string for the system prompt
function buildCatalogContext(): string {
    return categories.map(cat => {
        const productList = cat.products.map(p =>
            `  - [${p.id}] ${p.name} | ${p.requestQuote ? 'Request Quote' : p.price}${p.priceFrom ? '+' : ''} | ${p.description}`
        ).join('\n');
        return `### ${cat.name}${cat.isMachinery ? ' [MACHINERY — Request Quote for most]' : ' [TOOLING]'}\n${cat.description}\nProducts:\n${productList}`;
    }).join('\n\n');
}

const SYSTEM_PROMPT = `You are a knowledgeable and friendly product specialist for Advanced Machinery Systems — the premier provider of woodworking machinery and tooling solutions in the Intermountain West (Utah, Idaho, Montana, Wyoming, Colorado & Northern Arizona) since 1989.

Advanced Machinery Systems sells TWO main lines:
1. MACHINERY — Industrial CNC routers, edgebanders, panel saws, wide belt sanders, boring machines, finishing equipment (most require a "Request Quote")
2. TOOLING — CNC router bits, edgebander tooling, saw blades, boring & drill bits, collets and accessories (available for direct purchase)

Your role is to:
1. Answer questions about woodworking machinery, tooling, and related applications with genuine expertise
2. Suggest specific products from our catalog when relevant
3. Help users find the right machine or tooling for their application
4. Provide technical guidance on machine selection, tooling specs, speeds/feeds, and maintenance
5. Explain the differences between machinery brands: Homag, Ironwood, SawStop, Altendorf, Sandteq
6. Guide customers on machinery inquiries toward requesting a quote and speaking with our team

IMPORTANT — SPECIAL COMMAND TAGS:
You have two special tags you can include in your responses:

1. PRODUCT SUGGESTIONS — when you want to recommend products, include at the end:
[[PRODUCTS: id1, id2, id3]]
Example: "For CNC compression cuts in melamine, I'd recommend our 52-360 bit. [[PRODUCTS: rb-3, rb-5]]"

2. ADD TO CART — when a customer clearly says they want to order or purchase a specific TOOLING product, include:
[[ADD_TO_CART: id1, id2]]
Only use ADD_TO_CART when the customer explicitly confirms they want to purchase. Never add machinery to cart — always guide them to request a quote.

Only include product IDs that exist in the catalog below. Never invent IDs.

CURRENT PRODUCT CATALOG:
${buildCatalogContext()}

TONE & STYLE:
- Be like a knowledgeable machinist and machinery specialist — direct, technically accurate, helpful
- Keep answers concise (2-4 sentences for simple questions, slightly longer for complex machinery questions)
- Always suggest products when the user's question is about buying or finding tooling
- For machinery questions, recommend contacting the team for a quote and demo
- If unsure about a specific application, ask a clarifying question
- Don't make up products or prices that aren't in the catalog

COMPANY INFO:
- Phone: 801-498-7891
- Email: office@advanced-machinery.com
- Address: 657 N Kays Dr., Kaysville, UT 84037
- Service Area: Utah, Idaho, Montana, Wyoming, N. Arizona & Western Colorado
- Field Service: 6 specialist Field Service Reps covering CNCs, edgebanders, sanders, and beam saws
- Industries: Cabinets & Closets, Construction, Plastics, Architecture, Aerospace
- Brands Carried (Machinery): Homag, Centateq, Sandteq, SawStop, Ironwood, TigerStop, Altendorf, Stiles, Schubox, Laguna
- Founded: 1989 (35+ years of expertise)`;

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    productIds?: string[];
}

let genAI: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file as VITE_GEMINI_API_KEY=your_key');
    if (!genAI) genAI = new GoogleGenAI({ apiKey: API_KEY });
    return genAI;
}

export async function sendMessage(
    history: ChatMessage[],
    userMessage: string,
    onChunk: (chunk: string) => void
): Promise<{ text: string; productIds: string[]; addToCartIds: string[] }> {
    const client = getClient();

    // Convert history to Gemini format
    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const chat = client.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_PROMPT,
        },
        history: geminiHistory,
    });

    const stream = await chat.sendMessageStream({ message: userMessage });

    let fullText = '';
    for await (const chunk of stream) {
        const chunkText = chunk.text ?? '';
        fullText += chunkText;
        onChunk(chunkText);
    }

    // Parse [[PRODUCTS: ...]] tag
    const productMatch = fullText.match(/\[\[PRODUCTS:\s*([^\]]+)\]\]/);
    const productIds = productMatch
        ? productMatch[1].split(',').map(id => id.trim()).filter(Boolean)
        : [];

    // Parse [[ADD_TO_CART: ...]] tag
    const cartMatch = fullText.match(/\[\[ADD_TO_CART:\s*([^\]]+)\]\]/);
    const addToCartIds = cartMatch
        ? cartMatch[1].split(',').map(id => id.trim()).filter(Boolean)
        : [];

    // Strip both tags from the displayed text
    const cleanText = fullText
        .replace(/\[\[PRODUCTS:[^\]]*\]\]/g, '')
        .replace(/\[\[ADD_TO_CART:[^\]]*\]\]/g, '')
        .trim();

    return { text: cleanText, productIds, addToCartIds };
}
