# 📚 Mundo da Alice - Firebase Edition

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)
![Version](https://img.shields.io/badge/Version-6.6.0-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

App que fiz para minha esposa organizar e gerenciar livros, séries e filmes! Esta versão agora roda no **Firebase**, oferecendo muito mais velocidade e recursos sociais.

## 🌟 Funcionalidades

### 👤 Sistema de Autenticação (Firebase Auth)
- **Login/Cadastro**: Sistema seguro de e-mail e senha.
- **WhatsApp no Perfil**: Opção de cadastrar telefone para interação direta.
- **Multi-usuário**: Cada usuário tem sua própria biblioteca isolada do Firestore.

### 👥 Comunidade Online (Social)
- **Usuários Ativos**: Veja quem mais está explorando o Mundo da Alice em tempo real.
- **Chat Global 🌐**: Converse, peça indicações e interaja com outros usuários logados.
- **Integração WhatsApp**: Chame outros usuários no WhatsApp com um clique no perfil deles.

### 📖 Gerenciamento de Conteúdo
- **Livros, Séries e Filmes**: Organize três tipos de conteúdo em um único lugar.
- **Status Contextuais**: As opções de status mudam automaticamente dependendo da categoria.
- **Filtros Poderosos 🔍**: Agora você pode filtrar por **País de Origem**, **Status**, **Categoria** e busca por texto simultaneamente!
- **Estatísticas Aprimoradas**: Gráficos de atividade Mensal e Anual com suporte a múltiplos formatos de data.
- **Recap Premium**: Resumo anual printável com contagem de páginas e episódios.

### 🎁 Novidades e Atualizações
- **Central de Novidades**: Botão dinâmico que exibe as últimas melhorias do app diretamente do `changelog.md`.
- **UI Responsiva & Moderna**: Layout aprimorado para todos os dispositivos e barra de rolagem dinâmica (muda de cor ao rolar).
- **Scroll Infinito 🚀**: Navegação fluida sem botões de "carregar mais".
- **Apoie o Projeto ☕**: Botão de integração com Ko-fi para suporte ao desenvolvedor.

### 🤖 Inteligência Artificial (Google Gemini)
- **Alice - Assistente Inteligente**: Registre conteúdos conversando naturalmente.
- **Precisão Refinada**: A IA agora considera **Título + Autor** para trazer curiosidades e sugestões muito mais assertivas.
- **Powered by Gemini**: Utiliza o modelo `gemini-2.0-flash` via proxy seguro no Apps Script.

## 🚀 Estrutura do Projeto

O projeto é modular para facilitar a manutenção:
- `js/app.js`: Inicialização e lógica principal da aplicação.
- `js/auth.js`: Gerenciamento de usuários via Firebase Auth.
- `js/database.js`: Operações de CRUD no Cloud Firestore.
- `js/ui.js`: Renderização de todas as telas e componentes.
- `js/ai.js`: Integração com a Alice (Google Gemini).
- `js/state.js`: Gerenciamento de estado global.
- `js/constants.js`: Configurações e opções estáticas.
- `js/utils.js`: Funções utilitárias e tratadores de data.

## 🔧 Tecnologias Utilizadas

- **Frontend**: Vanilla JavaScript (ES6 Modules), HTML5, TailwindCSS.
- **Backend & Database**: Firebase Authentication, Cloud Firestore.
- **IA Integration**: Google Gemini API via Google Apps Script (Proxy).
- **Offline**: Service Worker (PWA).

---

## 📄 Licença

Este projeto foi criado especialmente para a minha linda esposa Ana Alice! ❤️

---

**Última atualização**: 03 de Fevereiro de 2026.