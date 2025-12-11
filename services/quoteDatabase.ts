
import { Quote } from '../types';

// Banco de dados local focado em empoderamento feminino e sabedoria feminina.
// Usado como fallback e para popular o banco de dados online via Admin Panel.

const generateId = () => Math.random().toString(36).substring(2, 9);

export const localQuotesDb: Omit<Quote, 'liked' | 'imageUrl' | 'backgroundImage'>[] = [
    // --- AUTOAMOR & AUTOESTIMA ---
    { id: generateId(), text: "Pés, para que os quero, se tenho asas para voar?", author: "Frida Kahlo", category: "AUTOAMOR" },
    { id: generateId(), text: "A beleza começa no momento em que você decide ser você mesma.", author: "Coco Chanel", category: "AUTOESTIMA" },
    { id: generateId(), text: "Você é suficiente exatamente como é.", author: "Meghan Markle", category: "AUTOAMOR" },
    { id: generateId(), text: "Não há nada mais raro, nem mais bonito, do que uma mulher sendo ela mesma.", author: "Desconhecida", category: "AUTOESTIMA" },
    { id: generateId(), text: "Apaixone-se por si mesma todos os dias.", author: "Desconhecida", category: "AUTOAMOR" },
    { id: generateId(), text: "Seja a mulher da sua vida.", author: "Desconhecida", category: "AUTOESTIMA" },
    { id: generateId(), text: "O relacionamento mais poderoso que você terá é consigo mesma.", author: "Steve Maraboli", category: "AUTOAMOR" },
    
    // --- LIDERANÇA & CARREIRA ---
    { id: generateId(), text: "Eu não sou descendente de escravos. Eu descendo de seres humanos que foram escravizados.", author: "Makota Valdina", category: "FORÇA" },
    { id: generateId(), text: "Não peça permissão para liderar. Lidere.", author: "Kamala Harris", category: "LIDERANÇA" },
    { id: generateId(), text: "O ato mais corajoso é pensar por você mesma. Em voz alta.", author: "Coco Chanel", category: "CARREIRA" },
    { id: generateId(), text: "Você pode ter tudo. Só não pode ter tudo ao mesmo tempo.", author: "Oprah Winfrey", category: "CARREIRA" },
    { id: generateId(), text: "Sua voz é sua ferramenta mais poderosa.", author: "Malala Yousafzai", category: "LIDERANÇA" },
    { id: generateId(), text: "O sucesso é gostar de si mesmo, gostar do que faz e gostar de como faz.", author: "Maya Angelou", category: "CARREIRA" },

    // --- SAGRADO FEMININO & INTUIÇÃO ---
    { id: generateId(), text: "A intuição é a sabedoria da alma sussurrando.", author: "Desconhecida", category: "INTUIÇÃO" },
    { id: generateId(), text: "Respeite seus ciclos. Você não é uma máquina, é natureza.", author: "Desconhecida", category: "CICLOS" },
    { id: generateId(), text: "Há uma força selvagem dentro de toda mulher que clama por liberdade.", author: "Clarissa Pinkola Estés", category: "SAGRADO FEMININO" },
    { id: generateId(), text: "Eu sou minha própria musa.", author: "Frida Kahlo", category: "INTUIÇÃO" },
    { id: generateId(), text: "Mulheres bem comportadas raramente fazem história.", author: "Laurel Thatcher Ulrich", category: "FORÇA" },

    // --- RESILIÊNCIA & SUPERAÇÃO ---
    { id: generateId(), text: "Você pode me fuzilar com palavras... mas ainda assim, como o ar, eu vou me levantar.", author: "Maya Angelou", category: "RESILIÊNCIA" },
    { id: generateId(), text: "A liberdade é pouco. O que eu desejo ainda não tem nome.", author: "Clarice Lispector", category: "SUPERAÇÃO" },
    { id: generateId(), text: "Eu sobrevivo porque o fogo dentro de mim queima mais forte que o fogo ao redor.", author: "Desconhecida", category: "FORÇA" },
    { id: generateId(), text: "Transformei minhas feridas em sabedoria.", author: "Oprah Winfrey", category: "SUPERAÇÃO" },
    { id: generateId(), text: "No meio do inverno, descobri que havia dentro de mim um verão invencível.", author: "Albert Camus", category: "RESILIÊNCIA" },

    // --- MATERNIDADE & FAMÍLIA ---
    { id: generateId(), text: "Não existe mãe perfeita. Existem milhões de maneiras de ser uma boa mãe.", author: "Jill Churchill", category: "MATERNIDADE" },
    { id: generateId(), text: "Cuidar de si mesma é parte de cuidar da sua família.", author: "Desconhecida", category: "MATERNIDADE" },
    { id: generateId(), text: "Você está criando o futuro. Respire fundo, mãe.", author: "Desconhecida", category: "FAMÍLIA" },
    { id: generateId(), text: "A maternidade tem um efeito muito humanizador. Tudo se reduz ao essencial.", author: "Meryl Streep", category: "MATERNIDADE" },
    { id: generateId(), text: "O amor de mãe é o combustível que capacita um ser humano comum a fazer o impossível.", author: "Marion C. Garretty", category: "MATERNIDADE" },

    // --- FILHOS & CRIAÇÃO ---
    { id: generateId(), text: "Os filhos são herança do Senhor, uma recompensa que ele dá.", author: "Salmos 127:3", category: "FILHOS" },
    { id: generateId(), text: "Eduque a criança no caminho em que deve andar, e até o fim da vida não se desviará dele.", author: "Provérbios 22:6", category: "FILHOS" },
    { id: generateId(), text: "O maior legado que deixamos aos filhos são raízes e asas.", author: "Desconhecida", category: "FILHOS" },
    { id: generateId(), text: "Não prepare o caminho para a criança. Prepare a criança para o caminho.", author: "Desconhecida", category: "FILHOS" },
    { id: generateId(), text: "Atrás de cada criança que acredita em si mesma, está uma mãe que acreditou primeiro.", author: "Matthew Jacobson", category: "FILHOS" },

    // --- FELICIDADE & GRATIDÃO ---
    { id: generateId(), text: "A felicidade é um perfume que você não pode passar nos outros sem conseguir algumas gotas em si mesma.", author: "Desconhecida", category: "FELICIDADE" },
    { id: generateId(), text: "Gratidão transforma o que temos em suficiente.", author: "Melody Beattie", category: "GRATIDÃO" },
    { id: generateId(), text: "Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.", author: "Clarice Lispector", category: "ESPIRITUALIDADE" },
    { id: generateId(), text: "A alegria não está nas coisas, está em nós.", author: "Richard Wagner", category: "FELICIDADE" },
    { id: generateId(), text: "Comece onde você está. Use o que você tem. Faça o que você pode.", author: "Arthur Ashe", category: "GRATIDÃO" },
    
    // --- RELIGIÃO & FÉ ---
    { id: generateId(), text: "A fé não torna as coisas fáceis, torna-as possíveis.", author: "Lucas 1:37", category: "RELIGIÃO" },
    { id: generateId(), text: "Tudo posso naquele que me fortalece.", author: "Filipenses 4:13", category: "RELIGIÃO" },
    { id: generateId(), text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", author: "Jeremias 29:11", category: "RELIGIÃO" },
    { id: generateId(), text: "Mil cairão ao teu lado, e dez mil à tua direita, mas tu não serás atingido.", author: "Salmos 91:7", category: "RELIGIÃO" },
    { id: generateId(), text: "Entregue o seu caminho ao Senhor; confie nele, e ele agirá.", author: "Salmos 37:5", category: "RELIGIÃO" },
    { id: generateId(), text: "A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.", author: "Hebreus 11:1", category: "RELIGIÃO" },

    // --- ANSIEDADE & SAÚDE MENTAL ---
    { id: generateId(), text: "Você não precisa controlar tudo. Respire e solte.", author: "Desconhecida", category: "ANSIEDADE" },
    { id: generateId(), text: "A calma é um superpoder.", author: "Desconhecida", category: "SAÚDE MENTAL" },
    { id: generateId(), text: "Um dia de cada vez. Um passo de cada vez.", author: "Desconhecida", category: "ANSIEDADE" },
    { id: generateId(), text: "Não acredite em tudo o que você pensa.", author: "Desconhecida", category: "SAÚDE MENTAL" },
    { id: generateId(), text: "Sua paz mental vale mais do que tentar entender o porquê de tudo.", author: "Desconhecida", category: "ANSIEDADE" },

    // --- AMIZADE & SORORIDADE ---
    { id: generateId(), text: "Quando uma mulher ajuda outra, ambas se curam.", author: "Desconhecida", category: "SORORIDADE" },
    { id: generateId(), text: "Cercada de mulheres fortes, me tornei uma.", author: "Desconhecida", category: "AMIZADE" },
    { id: generateId(), text: "O sucesso de outra mulher não apaga o seu.", author: "Desconhecida", category: "SORORIDADE" },
    { id: generateId(), text: "Amigas são a família que escolhemos.", author: "Desconhecida", category: "AMIZADE" },
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
