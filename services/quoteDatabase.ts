import { Quote } from '../types';

// Banco de dados local focado em empoderamento feminino e sabedoria feminina.

const generateId = () => Math.random().toString(36).substring(2, 9);

export const localQuotesDb: Omit<Quote, 'liked' | 'imageUrl' | 'backgroundImage'>[] = [
    // --- AUTOAMOR & AUTOESTIMA ---
    { id: generateId(), text: "Pés, para que os quero, se tenho asas para voar?", author: "Frida Kahlo", category: "AUTOAMOR" },
    { id: generateId(), text: "A beleza começa no momento em que você decide ser você mesma.", author: "Coco Chanel", category: "AUTOESTIMA" },
    { id: generateId(), text: "Você é suficiente exatamente como é.", author: "Meghan Markle", category: "AUTOAMOR" },
    { id: generateId(), text: "Não há nada mais raro, nem mais bonito, do que uma mulher sendo ela mesma.", author: "Desconhecida", category: "AUTOESTIMA" },
    { id: generateId(), text: "Apaixone-se por si mesma todos os dias.", author: "Desconhecida", category: "AUTOAMOR" },
    
    // --- LIDERANÇA & CARREIRA ---
    { id: generateId(), text: "Eu não sou descendente de escravos. Eu descendo de seres humanos que foram escravizados.", author: "Makota Valdina", category: "FORÇA" },
    { id: generateId(), text: "Não peça permissão para liderar. Lidere.", author: "Kamala Harris", category: "LIDERANÇA" },
    { id: generateId(), text: "O ato mais corajoso é pensar por você mesma. Em voz alta.", author: "Coco Chanel", category: "CARREIRA" },
    { id: generateId(), text: "Você pode ter tudo. Só não pode ter tudo ao mesmo tempo.", author: "Oprah Winfrey", category: "CARREIRA" },
    { id: generateId(), text: "Sua voz é sua ferramenta mais poderosa.", author: "Malala Yousafzai", category: "LIDERANÇA" },

    // --- SAGRADO FEMININO & INTUIÇÃO ---
    { id: generateId(), text: "A intuição é a sabedoria da alma sussurrando.", author: "Desconhecida", category: "INTUIÇÃO" },
    { id: generateId(), text: "Respeite seus ciclos. Você não é uma máquina, é natureza.", author: "Desconhecida", category: "CICLOS" },
    { id: generateId(), text: "Há uma força selvagem dentro de toda mulher que clama por liberdade.", author: "Clarissa Pinkola Estés", category: "SAGRADO FEMININO" },
    { id: generateId(), text: "Eu sou minha própria musa.", author: "Frida Kahlo", category: "INTUIÇÃO" },

    // --- RESILIÊNCIA & SUPERAÇÃO ---
    { id: generateId(), text: "Você pode me fuzilar com palavras... mas ainda assim, como o ar, eu vou me levantar.", author: "Maya Angelou", category: "RESILIÊNCIA" },
    { id: generateId(), text: "A liberdade é pouco. O que eu desejo ainda não tem nome.", author: "Clarice Lispector", category: "SUPERAÇÃO" },
    { id: generateId(), text: "Eu sobrevivo porque o fogo dentro de mim queima mais forte que o fogo ao redor.", author: "Desconhecida", category: "FORÇA" },
    { id: generateId(), text: "Transformei minhas feridas em sabedoria.", author: "Oprah Winfrey", category: "SUPERAÇÃO" },

    // --- MATERNIDADE & FAMÍLIA ---
    { id: generateId(), text: "Não existe mãe perfeita. Existem milhões de maneiras de ser uma boa mãe.", author: "Jill Churchill", category: "MATERNIDADE" },
    { id: generateId(), text: "Cuidar de si mesma é parte de cuidar da sua família.", author: "Desconhecida", category: "MATERNIDADE" },
    { id: generateId(), text: "Você está criando o futuro. Respire fundo, mãe.", author: "Desconhecida", category: "FAMÍLIA" },

    // --- FELICIDADE & GRATIDÃO ---
    { id: generateId(), text: "A felicidade é um perfume que você não pode passar nos outros sem conseguir algumas gotas em si mesma.", author: "Desconhecida", category: "FELICIDADE" },
    { id: generateId(), text: "Gratidão transforma o que temos em suficiente.", author: "Melody Beattie", category: "GRATIDÃO" },
    { id: generateId(), text: "Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.", author: "Clarice Lispector", category: "ESPIRITUALIDADE" },
    
    // --- AMIZADE & SORORIDADE ---
    { id: generateId(), text: "Quando uma mulher ajuda outra, ambas se curam.", author: "Desconhecida", category: "SORORIDADE" },
    { id: generateId(), text: "Cercada de mulheres fortes, me tornei uma.", author: "Desconhecida", category: "AMIZADE" },
    { id: generateId(), text: "O sucesso de outra mulher não apaga o seu.", author: "Desconhecida", category: "SORORIDADE" },
];

/**
 * Recupera citações locais filtradas por tópicos do usuário para carregamento instantâneo.
 */
export const getLocalQuotes = (topics: string[], limit: number = 10): Quote[] => {
    // 1. Filtra por tópicos se existirem
    let filtered = topics.length > 0 
        ? localQuotesDb.filter(q => q.category && topics.some(t => t.toUpperCase().includes(q.category!.toUpperCase()) || q.category!.toUpperCase().includes(t.toUpperCase())))
        : localQuotesDb;

    // 2. Se não houver o suficiente, mistura com o banco geral
    if (filtered.length < limit) {
        const remaining = localQuotesDb.filter(q => !filtered.includes(q));
        filtered = [...filtered, ...remaining];
    }

    // 3. Embaralha e corta (Fisher-Yates shuffle simplificado)
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, limit).map(q => ({
        ...q,
        id: `local-${Math.random().toString(36).substring(2,9)}`, // ID único para evitar conflitos de chave no React
        liked: false,
        imageUrl: '',
        backgroundImage: ''
    }));
};