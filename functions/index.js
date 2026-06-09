const { onRequest } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.callGemini = onRequest({
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['GEMINI_API_KEY'],
    cors: true
}, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Método Não Permitido. Use POST.');
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).send('Corpo da requisição inválido. "messages" é obrigatório.');
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Chave de API do Gemini não configurada no Secret Manager.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Extrair e separar instruções de sistema, histórico e última mensagem
        let systemInstruction = '';
        let chatHistory = [];
        let userPrompt = '';

        // Varre as mensagens recebidas
        const processedMessages = [...messages];
        
        // 1. Identificar instrução do sistema (normalmente o primeiro item se role === 'system')
        if (processedMessages[0] && processedMessages[0].role === 'system') {
            systemInstruction = processedMessages.shift().content;
        }

        if (processedMessages.length === 0) {
            // Caso tenha sido enviado apenas instrução de sistema
            userPrompt = systemInstruction;
            systemInstruction = '';
        } else {
            // A última mensagem do array vira o prompt atual do usuário
            const lastMsg = processedMessages.pop();
            userPrompt = lastMsg.content;

            // Mensagens restantes viram o histórico do chat
            chatHistory = processedMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content || "" }]
            }));
        }

        // Inicializar o modelo Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemInstruction || undefined
        });

        let responseText = '';

        if (chatHistory.length > 0) {
            // Modo Conversa com Histórico
            const chat = model.startChat({
                history: chatHistory
            });
            const result = await chat.sendMessage(userPrompt);
            responseText = result.response.text();
        } else {
            // Modo Geração Simples (Única mensagem)
            const result = await model.generateContent(userPrompt);
            responseText = result.response.text();
        }

        return res.json({
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content: responseText
                    }
                }
            ]
        });

    } catch (error) {
        console.error('Erro na Cloud Function callGemini:', error);
        return res.status(500).json({
            error: 'Falha ao processar requisição no Gemini.',
            details: error.message
        });
    }
});
