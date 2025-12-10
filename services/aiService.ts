
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quote, UserData, DailyMotivation } from '../types';
import { getLocalQuotes } from './quoteDatabase';
import { db } from '../firebaseConfig';
import { collection, getDocs, limit, query, where, orderBy } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Define a custom error class for quota exhaustion
export class QuotaExceededError extends Error {
    constructor(message: string, public readonly status: string = "RESOURCE_EXHAUSTED") {
        super(message);
        this.name = "QuotaExceededError";
    }
}

// Fallback ultra-rápido (caso extremo)
export const fallbackQuotes: Quote[] = getLocalQuotes([], 5);

const modelId = 'gemini-2.5-flash';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateDailyMotivation = async (): Promise<DailyMotivation | null> => {
    const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const prompt = `
        Atue como uma mentora de sabedoria feminina.
        Gere a "Motivação do Dia" para hoje, ${todayStr}.
        
        DIRETRIZES:
        1. **PÚBLICO:** Mulheres modernas (mães, profissionais, estudantes).
        2. **TOM:** Acolhedor, forte, intuitivo e empoderador.
        3. **ORIGINALIDADE:** Evite clichês. Fale sobre força interior, ciclos, intuição ou autoconfiança.
        4. **AUTORAS:** Priorize citações de mulheres inspiradoras (famosas ou provérbios).
        5. **LINGUAGEM:** Use o gênero feminino (ex: "guerreira", "pronta", "segura").
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING, description: "A citação inspiradora (máx 20 palavras)." },
            author: { type: Type.STRING, description: "O nome da autora." },
            category: { type: Type.STRING, description: "Uma palavra-chave em maiúsculo (ex: AUTOESTIMA)." }
        },
        required: ["text", "author", "category"]
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await ai.models.generateContent({
                model: modelId,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.9
                }
            });
            
            const data = JSON.parse(response.text || "{}");
            
            return { 
                text: data.text || "A beleza começa no momento em que você decide ser você mesma.",
                author: data.author || "Coco Chanel",
                category: data.category?.toUpperCase() || "AUTOESTIMA",
                imageUrl: ""
            };
        } catch (error: any) {
            attempts++;
            const errorMsg = error?.message || JSON.stringify(error);
            
            if (errorMsg.includes('429') || errorMsg.includes('Quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
                throw new QuotaExceededError("Quota exceeded.");
            }

            console.warn(`Attempt ${attempts} failed for daily motivation:`, error);

            if (attempts >= maxAttempts) {
                // Fallback gracefully
                const localBackup = getLocalQuotes([], 1)[0];
                return {
                    text: localBackup?.text || "Pés, para que os quero, se tenho asas para voar?",
                    author: localBackup?.author || "Frida Kahlo",
                    category: localBackup?.category || "LIBERDADE",
                    imageUrl: ""
                };
            }
            await delay(1000); // Wait 1s before retry
        }
    }
    return null;
};


export const generateDailyFocus = async (userData: UserData): Promise<{ title: string; text: string; } | null> => {
    // Safe access to array properties to avoid spreading undefined
    const goals = userData.appGoals || [];
    const improvements = userData.improvementAreas || [];

    const prompt = `
        Atue como uma mentora de vida para mulheres. Crie um "Foco Diário" para ${userData.name}.
        Humor atual: ${userData.feeling || 'Neutro'}.
        Objetivos: ${[...goals, ...improvements].join(', ')}.
        
        Gere uma micro-ação de autocuidado ou um mantra de empoderamento curto para hoje.
        Use linguagem feminina.
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Título curto (máx 3 palavras)" },
            text: { type: Type.STRING, description: "Descrição direta e acolhedora (máx 15 palavras)" }
        },
        required: ["title", "text"]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return {
            title: "Seja Gentil Consigo",
            text: "Respire fundo. Você está fazendo o melhor que pode."
        };
    }
};

const fetchCustomQuotesFromFirestore = async (): Promise<Quote[]> => {
    try {
        // Fetch up to 20 random-ish custom quotes (sorting by createdAt descending for now)
        const q = query(collection(db, "custom_quotes"), limit(20));
        const querySnapshot = await getDocs(q);
        
        const quotes: Quote[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            quotes.push({
                id: doc.id,
                text: data.text,
                author: data.author || "Desconhecida",
                category: data.category || "Inspiração",
                liked: false,
                imageUrl: '',
                backgroundImage: ''
            });
        });
        return quotes;
    } catch (error) {
        console.warn("Could not fetch custom quotes:", error);
        return [];
    }
};

export const generateQuotesFromAI = async (userData: UserData, existingQuotes: Quote[], isInitialFetch: boolean, activeFilter: string | null): Promise<Quote[]> => {
    
    const userTopics = userData.topics || [];

    // On initial fetch, try to mix custom quotes with local/AI quotes
    if (isInitialFetch) {
        const customQuotes = await fetchCustomQuotesFromFirestore();
        
        // If we have custom quotes, mix them in immediately for instant load
        if (customQuotes.length > 0) {
            // Shuffle custom quotes
            const shuffledCustom = customQuotes.sort(() => 0.5 - Math.random()).slice(0, 5);
            
            // Get some local quotes as well
            const local = getLocalQuotes(activeFilter ? [activeFilter] : userTopics, 5);
            
            // Interleave them
            const mixed = [...shuffledCustom, ...local].sort(() => 0.5 - Math.random());
            
            if (mixed.length > 0) {
                console.log("Serving mixed Custom + Local quotes");
                return mixed;
            }
        }
        
        if (!existingQuotes || existingQuotes.length === 0) {
            console.log("Instant Load: Serving local quotes");
            return getLocalQuotes(activeFilter ? [activeFilter] : userTopics, 12);
        }
    }

    const previousTexts = existingQuotes ? existingQuotes.slice(-20).map(q => q.text.substring(0, 15)).join(" | ") : "";
    const topicsToUse = activeFilter ? activeFilter : (userTopics.length > 0 ? userTopics.join(', ') : "Autoestima, Força, Mulher");
    
    const baseContext = `
        Você é uma curadora de sabedoria feminina.
        Usuária: ${userData.name}, Humor: ${userData.feeling || 'Neutro'}.
        Tópicos Focais: ${topicsToUse}.
        
        ESTILO DE CURADORIA:
        1. **FEMININO & FORTE:** Frases que empoderam, acolhem e validam a experiência da mulher.
        2. **PROFUNDIDADE:** Busque citações sobre ciclos, intuição, maternidade, liderança feminina, sororidade.
        3. **AUTORAS:** Priorize mulheres (escritoras, filósofas, líderes, artistas).
        4. **IDIOMA:** Português do Brasil impecável.
        5. **FORMATO:** Gere um lote de 8 CITAÇÕES.
    `;

    const prompt = `
        ${baseContext}
        Gere 8 citações esteticamente agradáveis e impactantes para mulheres.
        Não repita estes inícios: [${previousTexts}]
    `;

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "O texto da citação." },
                author: { type: Type.STRING, description: "Autora (nome curto).", nullable: true },
                category: { type: Type.STRING, description: "Categoria breve.", nullable: true }
            },
            required: ["text"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 1.0 
            }
        });

        const quotesArray = JSON.parse(response.text || "[]");

        return quotesArray.map((q: any) => ({
            id: Math.random().toString(36).substring(2, 12),
            text: q.text,
            author: q.author || "Desconhecida",
            category: q.category || "Inspiração",
            liked: false,
            imageUrl: '',
            backgroundImage: '',
        }));

    } catch (error: any) {
        console.warn("Error generating quotes (handling fallback):", error);
        const errorMsg = error?.message || JSON.stringify(error);
        
        if (errorMsg.includes('429') || errorMsg.includes('Quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
            throw new QuotaExceededError("Cota excedida");
        }
        return getLocalQuotes(activeFilter ? [activeFilter] : userTopics, 5);
    }
};

export const generateExploreSuggestions = async (quote: Quote): Promise<string[] | null> => {
    const prompt = `
        Citação: "${quote.text}".
        Público: Mulheres.
        Crie 3 perguntas de introspecção profundas, curtas e pessoais para a usuária refletir sobre sua vida, emoções ou poder.
        Use um tom gentil e provocativo (no bom sentido).
    `;
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        return ["Como isso ressoa no seu coração?", "O que sua intuição diz sobre isso?", "Como aplicar isso hoje?"];
    }
};

export const generateExploreResponse = async (quote: Quote, suggestion: string, userData: UserData): Promise<{ insight: string; action: string; mantra: string } | null> => {
    const prompt = `
        Atue como uma mentora sábia, mística e acolhedora.
        Citação: "${quote.text}".
        Reflexão escolhida pela usuária: "${suggestion}".
        Usuária: ${userData.name}.
        
        Forneça uma resposta estruturada em 3 partes curtas.
        Use formatação **negrito** (asteriscos) apenas para palavras-chave muito importantes (máximo 1 ou 2 vezes).
        
        1. INSIGHT: Uma reflexão profunda sobre o tema (2 frases).
        2. AÇÃO: Um micro-hábito prático para fazer hoje (1 frase).
        3. MANTRA: Uma afirmação curta e poderosa em primeira pessoa.
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            insight: { type: Type.STRING, description: "A sabedoria ou reflexão." },
            action: { type: Type.STRING, description: "Uma ação prática." },
            mantra: { type: Type.STRING, description: "Uma afirmação curta." }
        },
        required: ["insight", "action", "mantra"]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return { 
            insight: "Confie no seu processo, querida. A resposta que você busca já está dentro de você.",
            action: "Tire 5 minutos hoje para respirar e se ouvir.",
            mantra: "Eu sou suficiente e minha intuição me guia."
        };
    }
};