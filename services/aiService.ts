// services/aiService.ts – versão FINAL completa e compatível com todo o app
import { Quote, UserData, DailyMotivation } from '../types';
import { getLocalQuotes } from './quoteDatabase';

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export const fallbackQuotes: Quote[] = getLocalQuotes([], 5);

const API_URL = '/api/gemini';

/* ============================================================
   Função genérica de chamada da API
   ============================================================ */
const callGemini = async (type: string, payload: any) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    return data.text;
  } catch (error) {
    console.warn("Gemini offline — usando fallback");
    throw new QuotaExceededError("Offline");
  }
};

/* ============================================================
   DAILY MOTIVATION
   ============================================================ */
export const generateDailyMotivation = async (): Promise<DailyMotivation | null> => {
  try {
    const prompt = `
      Gere uma motivação do dia para mulheres brasileiras.
      Retorne JSON com: text, author, category.
    `;

    const text = await callGemini('dailyMotivation', { prompt });
    const parsed = JSON.parse(text);

    return {
      text: parsed.text || "Você é suficiente.",
      author: parsed.author || "Você mesma",
      category: parsed.category || "FORÇA",
      imageUrl: ""
    };
  } catch {
    return {
      text: "Hoje, escolha ser gentil consigo mesma.",
      author: "Você",
      category: "AUTOCUIDADO",
      imageUrl: ""
    };
  }
};

/* ============================================================
   QUOTES / FRASES
   ============================================================ */
export const generateQuotesFromAI = async (
  userData: UserData,
  existingQuotes: Quote[] = [],
  isInitialFetch = false,
  activeFilter: string | null = null
): Promise<Quote[]> => {

  if (isInitialFetch) {
    return getLocalQuotes(activeFilter ? [activeFilter] : userData.topics || [], 12);
  }

  try {
    const prompt = `
      Gere 8 citações empoderadoras para mulheres brasileiras.
      Retorne JSON array com: text, author, category.
    `;

    const text = await callGemini('quotes', { prompt });
    const quotes = JSON.parse(text);

    return quotes.map((q: any) => ({
      id: Math.random().toString(36).substring(7),
      text: q.text,
      author: q.author || "Anônima",
      category: q.category || "Inspiração",
      liked: false,
      imageUrl: '',
      backgroundImage: '',
    }));
  } catch {
    return getLocalQuotes(activeFilter ? [activeFilter] : userData.topics || [], 8);
  }
};

/* ============================================================
   EXPLORE — usado no ExploreModal
   ============================================================ */
export const generateExploreResponse = async (prompt: string): Promise<string> => {
  try {
    const text = await callGemini('exploreResponse', { prompt });
    return text || "Permita-se respirar e sentir o momento.";
  } catch {
    return "Às vezes, a resposta está em desacelerar e ouvir a si mesma.";
  }
};

export const generateExploreSuggestions = async (): Promise<string[]> => {
  try {
    const prompt = `
      Gere 6 sugestões de temas de autoexploração emocional.
      Retorne JSON array de strings.
    `;

    const text = await callGemini('exploreSuggestions', { prompt });
    return JSON.parse(text);

  } catch {
    return [
      "Algo que você precisa reconhecer em si mesma.",
      "Uma pequena vitória da semana.",
      "O que você está evitando sentir?",
      "Algo que você gostaria de começar hoje.",
      "O que tiraria um peso dos seus ombros?",
      "Do que seu corpo precisa agora?"
    ];
  }
};

/* ============================================================
   DAILY FOCUS — usado no ProfileScreen
   ============================================================ */
export const generateDailyFocus = async (): Promise<string> => {
  try {
    const prompt = `
      Gere um "Foco do Dia" curto, prático e motivacional para mulheres brasileiras.
      Responda apenas com o texto da frase.
    `;

    const text = await callGemini('dailyFocus', { prompt });
    return text || "Escolha um passo simples e faça hoje.";
  } catch {
    return "Uma coisa de cada vez — você consegue.";
  }
};
