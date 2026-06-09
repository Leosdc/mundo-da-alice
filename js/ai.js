import { state, render } from './state.js';
import { API_URL } from './constants.js';
import { auth } from './app.js';

export async function callGeminiViaGAS(messages) {
    if (!state.currentUser || !auth.currentUser) return;

    try {
        const idToken = await auth.currentUser.getIdToken();

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        const result = await response.json();

        if (result.error) {
            console.error('[AICall] Erro do Servidor:', result.error);
            return `❌ Erro do Servidor: ${result.error}`;
        }

        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            console.error('[AICall] Resposta inválida da Cloud Function:', result);
            return '❌ Erro: API Gemini indisponível ou resposta vazia. Verifique as configurações das Cloud Functions.';
        }

        return result.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar Gemini:', error);
        return 'Desculpe, tive um problema na conexão com o serviço de IA. Verifique se as Cloud Functions estão ativas e se o plano do projeto está atualizado para o plano Blaze.';
    }
}

export async function handleChatSubmit() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || state.isChatLoading) return;

    input.value = '';
    state.chatMessages.push({ role: 'user', content: text });
    state.isChatLoading = true;
    render();
    window.scrollChat();

    const systemMessage = {
        role: 'system',
        content: `Você é a Alice do app "Mundo da Alice". Seu objetivo é ajudar o usuário a registrar Livros, Séries ou Filmes de forma EXTREMAMENTE cuidadosa.
        
        PESQUISA E PRECISÃO:
        Antes de sugerir ou confirmar dados, "pesquise" mentalmente para garantir que o autor, número de episódios ou páginas estejam corretos. Se não tiver certeza absoluta, peça para o usuário confirmar. Evite inventar dados (alucinações).
        
        CAMPOS NECESSÁRIOS: Título, Autor (se for livro), Páginas/Episódios (número), Status (Quero ler/assistir, Lido, Assistido, Desisti), Avaliação, Data (em formato DD/MM/AAAA), Categoria (Livro, Série, Filme), País (Opcional).
        
        REGRAS:
        1. Seja amigável e use emojis, mas mantenha o foco na organização.
        2. Pergunte uma coisa de cada vez. IMPORTANTE: Pergunte a data de leitura/assistência e peça para o usuário digitar no formato DD/MM/AAAA.
        3. Quando tiver TODAS as informações, termine respondendo EXATAMENTE com um JSON no formato: 
        [[REGISTER_ITEM: {"title": "...", "author": "...", "pages": "...", "status": "...", "rating": "...", "date": "...", "category": "...", "country": "..."}]]
        
        Status permitidos (use APENAS estes dependendo da categoria):
        LIVROS: "Quero ler", "Lendo", "Lido", "Desisti".
        FILMES/SÉRIES: "Quero assistir", "Assistindo", "Assistido", "Desisti".
        
        Avaliações permitidas (USE EXATAMENTE ASSIM, COM O EMOJI): "Maravilhoso 😍", "Muito bom 😊", "Bom 🙂", "Mais ou menos 🤨", "Ruim 🙁", "Péssimo 😒".
        Categorias: "Livro", "Série", "Filme".`
    };

    const response = await callGeminiViaGAS([systemMessage, ...state.chatMessages]);

    const sanitizeRating = (rating) => {
        const ratingMap = {
            'Maravilhoso': 'Maravilhoso 😍',
            'Muito bom': 'Muito bom 😊',
            'Bom': 'Bom 🙂',
            'Mais ou menos': 'Mais ou menos 🤨',
            'Ruim': 'Ruim 🙁',
            'Péssimo': 'Péssimo 😒'
        };
        if (!rating) return rating;
        for (const [key, value] of Object.entries(ratingMap)) {
            if (rating.toLowerCase().includes(key.toLowerCase()) && !rating.includes(' ')) {
                return value;
            }
        }
        return rating;
    };

    if (response.includes('[[REGISTER_ITEM:')) {
        const jsonMatch = response.match(/\[\[REGISTER_ITEM: (.*?)\]\]/);
        if (jsonMatch) {
            try {
                const itemData = JSON.parse(jsonMatch[1]);
                if (itemData.rating) {
                    itemData.rating = sanitizeRating(itemData.rating);
                }
                state.chatMessages.push({ role: 'assistant', content: 'Perfeito! Registrei tudo para você. ✨' });
                state.formData = { ...state.formData, ...itemData };
                await window.handleSubmit();
                state.isChatLoading = false;
                render();
                setTimeout(window.scrollChat, 100);
                return;
            } catch (e) {
                console.error('Erro ao processar registro do bot:', e);
            }
        }
    }

    state.chatMessages.push({ role: 'assistant', content: response });
    state.isChatLoading = false;
    render();
    window.scrollChat();
}

export async function handleSuggestionRequest() {
    if (state.isChatLoading) return;

    state.isChatLoading = true;
    state.chatMessages.push({ role: 'assistant', content: 'Deixa eu ver o que você já gostou... Analisando seu histórico para uma sugestão especial! 🧐✨' });
    render();
    window.scrollChat();

    const history = state.items.slice(0, 20).map(item => `- ${item.category}: ${item.title} (${item.rating || 'Sem avaliação'})`).join('\n');

    const suggestionPrompt = {
        role: 'system',
        content: `Você é um curador especialista em entretenimento, conhecido por sua precisão e recomendações impecáveis.
        
        PESQUISA RIGOROSA: 
        Analise o histórico do usuário com cuidado. Pense em conexões de gênero, autores, diretores e temática. SEMPRE verifique se sua sugestão existe de fato e se o autor está correto.
        
        HISTÓRICO RECENTE:
        ${history}

        REGRAS:
        1. Sugira apenas UM item.
        2. Explique detalhadamente por que você acha que ele vai gostar, conectando com o que ele já consumiu.
        3. Use emojis e um tom entusiasmado.
        4. NUNCA sugira algo que já está no histórico.
        5. Formate a resposta como: "Minha sugestão: **[NOME]**" (se for Livro, adicione " **por [AUTOR]**")\n\n**Sinopse:** [SINOPSE CURTA E PRECISA]\n\n**Por que você vai amar:** [MOTIVO BASEADO NO HISTÓRICO]"`
    };

    const response = await callGeminiViaGAS([suggestionPrompt]);

    state.chatMessages.push({ role: 'assistant', content: response });
    state.isChatLoading = false;
    render();
    window.scrollChat();
}

export async function generateInsight() {
    if (state.items.length === 0 || state.isGeneratingInsight) return;

    state.isGeneratingInsight = true;
    render();

    const randomItem = state.items[Math.floor(Math.random() * state.items.length)];
    const systemMessage = {
        role: 'system',
        content: 'Você é um assistente curioso e bem informado. O usuário tem uma biblioteca de livros, filmes e séries. Sua tarefa é fornecer uma curiosidade REAL, PRECISA e fascinante sobre o item fornecido. Use o Título e o Autor (se disponível) para garantir que você está falando da obra correta. Pesquise mentalmente detalhes técnicos, de bastidores ou históricos. Máximo 3 frases. Responda de forma divertida e inteligente.'
    };

    const userMessage = {
        role: 'user',
        content: `O item é: "${randomItem.title}"${randomItem.author ? ` por ${randomItem.author}` : ''} (${randomItem.category}). Conte algo legal sobre ele.`
    };

    const insight = await callGeminiViaGAS([systemMessage, userMessage]);
    state.insightMessage = insight;
    state.showInsight = true;
    state.isGeneratingInsight = false;
    render();

    setTimeout(() => {
        state.showInsight = false;
        render();
    }, 30000);
}
