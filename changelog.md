# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [6.7.0] - 2026-02-27
### Adicionado
- **Pretty Pop-ups ✨**: Substituição completa dos alertas e confirmações nativos do navegador por modais customizados com design *glassmorphism*, animações suaves e suporte total ao modo escuro.

### Corrigido
- **UX de Formulário**: Resolvido o problema onde o alerta de "alterações não salvas" aparecia incorretamente após um salvamento bem-sucedido.
- **Limpeza de Console**: Removidos logs de depuração e silenciados avisos de produção do Tailwind CDN para um console mais limpo.
- **PWA Meta Tags**: Atualizada a meta tag `apple-mobile-web-app-capable` para a versão recomendada `mobile-web-app-capable`.

## [6.6.0] - 2026-02-03
### Adicionado
- **Filtros Avançados**: Novo sistema de filtragem por **País de Origem** e **Status** permitindo buscas muito mais precisas na sua biblioteca.
- **Reset de Filtros**: Adicionado botão "Limpar Filtros" que aparece dinamicamente ao aplicar critérios de busca.

### Alterado
- **Tema Lilás ✨**: Renovação visual completa da interface com uma nova paleta cromática em tons de lilás e lavanda.
- **Gradientes Suaves**: Todos os gradientes da interface (Header, Botões, Chat) foram atualizados para uma transição mais moderna entre lilás e índigo.
- **UI Consistente**: Ajustes em diversos componentes para garantir que a nova identidade visual brilhe tanto no modo claro quanto no noturno.

## [6.5.2] - 2026-01-18
### Alterado
- **Migração de Modelo**: Atualizado o modelo da Alice de `gemini-2.0-flash-exp` para a versão estável `gemini-2.0-flash`, garantindo maior confiabilidade e performance.

## [6.5.1] - 2026-01-16
### Adicionado
- **Scroll Infinito**: Substituído o botão "Carregar mais" por carregamento automático ao rolar a página.
- **Scroll Decorado**: Barra de rolagem customizada que muda de cor suavemente entre tons de roxo conforme a rolagem.
- **Apoio ao Projeto**: Integrado botão do **Ko-fi** para permitir contribuições da comunidade.

### Corrigido
- **UX Mobile**: Resolvido o problema de foco automático na barra de busca que abria o teclado inesperadamente.
- **Responsividade**: Títulos de páginas (Estatísticas, Comunidade, Admin) e formulários agora são centralizados automaticamente em dispositivos móveis.

## [6.5.0] - 2026-01-16
### Corrigido
- **Animações de UI**: Removido o efeito de "piscar" (flickering) nos campos de data e seleção de país.
- **Modo Escuro Admin**: Corrigida a consistência visual do painel administrativo no modo claro.
- **Funcionalidades Sociais**: Estabilização do chat global e da lista de usuários ativos.
- **Painel Admin**: Corrigida a função "Ver Itens" e migração completa para o sistema de visões por estado.

### Alterado
- **Refinamento Visual**: Melhoria na legibilidade do modal de "Novidades" em modo escuro e ajuste no brilho do botão "Enviar" no chat.
- **Limpeza de Código**: Remoção de comentários desnecessários em diversos arquivos do projeto (`index.html`, `style.css`, e módulos `js/`).

## [6.4.0] - 2026-01-14
### Adicionado
- **Modo Escuro / Tema Dia & Noite 🌙☀️**: Novo botão no cabeçalho com transição suave entre Sol e Lua. O sistema agora lembra sua preferência de tema.
- **Rich Aesthetics**: Visual premium no modo escuro com gradientes suaves e cores adaptativas.

## [6.3.0] - 2026-01-14
### Segurança
- **Segurança Ninja (Firebase ID Tokens)**: Implementação de tokens dinâmicos para acesso à IA, eliminando chaves estáticas.
- **Cadastro Obrigatório por E-mail**: Refatoração do sistema de login e registro para exigir e-mails reais, garantindo maior segurança e suporte a recuperação de senha.

## [6.2.0] - 2026-01-13
### Adicionado
- **Otimização de Navegação**: Melhorias na estrutura e fluidez entre as visões do aplicativo.
- **Ajustes de Responsividade**: Refinamento de layouts para melhor adaptação em diferentes tamanhos de tela.

### Corrigido
- **Renderização Visual**: Corrigido um problema técnico que afetava a exibição de elementos da interface em tempo real.

## [6.1.0] - 2026-01-13
### Adicionado
- **Botão de Novidades Dinâmico 🎁**: Novo botão integrado ao cabeçalho que lê automaticamente a última versão do `changelog.md`.
- **Status Contextuais 📚🎬**: As opções de status agora mudam dinamicamente baseadas na categoria (ex: "Lendo" para Livros, "Assistindo" para Séries/Filmes).
- **Indicadores de Atividade 💓**: O status "Lendo" ou "Assistindo" agora possui uma animação de pulsar no dashboard.

### Alterado
- **UX de Registro**: Sincronização automática entre Categoria e Status para evitar erros de preenchimento.

### Técnico
- Normalização de strings (NFD) para tratamento robusto de acentuação em categorias.
- Parsing dinâmico de Markdown para o modal de novidades.

## [6.0.0] - 2026-01-13
### Adicionado
- **Migração para Firebase**: O banco de dados foi migrado do Google Sheets para o **Cloud Firestore**, oferecendo sincronização em tempo real e maior escalabilidade.
- **Firebase Authentication**: Novo sistema de login e cadastro seguro via e-mail e senha.
- **Aba Comunidade 👥**: Nova tela social para ver usuários ativos e interagir com outros membros da plataforma.
- **Chat Global 🌐**: Sistema de mensagens em tempo real para todos os usuários do Mundo da Alice.
- **Perfis de Usuário**: Suporte a preenchimento de telefone/WhatsApp opcional para facilitar o contato entre a comunidade.
- **Indicador Online**: Status de presença em tempo real com timeout de 15 minutos na lista de usuários ativos.

### Alterado
- **Precisão da Alice (IA)**: O assistente agora considera o **Autor** em conjunto com o Título para curiosidades e sugestões, eliminando erros de identificação.
- **Arquitetura Modular**: O código foi completamente refatorado em módulos ES6 (`auth.js`, `database.js`, `state.js`, etc.) para melhor organização.
- **Gráficos de Atividade**: Removida a métrica diária e implementado suporte robusto a múltiplos formatos de data (`DD/MM/AAAA` e `AAAA-MM-DD`).

### Técnico
- Integração do Firebase SDK (v9+).
- Configuração de Cloud Firestore Security Rules para isolamento de dados por usuário.
- Refatoração do gerenciamento de estado global no `state.js`.
- Heartbeat para atualização de status `lastActive` dos usuários.

## [5.4.0] - 2026-01-12
### Alterado
- **Migração para Google Gemini API**: O assistente Alice agora utiliza a API do Google Gemini (modelo `gemini-2.0-flash-exp`) em vez do Groq, oferecendo respostas mais rápidas e integração nativa com o ecossistema Google.
- **Melhorias de Performance**: A nova API proporciona latência reduzida e maior confiabilidade nas sugestões e insights.

### Técnico
- Substituída função `callGroq()` por `callGemini()` no backend (Apps Script)
- Atualizado `callGroqViaGAS()` para `callGeminiViaGAS()` no frontend
- Migração da chave de API de `GROQ_API_KEY` para `GEMINI_API_KEY` nas Script Properties
- Adaptação do formato de payload e resposta para compatibilidade com a API Gemini

## [5.3.0] - 2026-01-06
### Adicionado
- **Nova interface**: Criada uma nova interface gráfica para o app, com transições mais suaves.
- **Estatísticas**: As estatísticas agora possuem uma tela própria, com gráficos e estatísticas detalhadas.

### Bugs conhecidos
- **Estatísticas mensais, anuais e semanal não estão funcionando corretamente**: As estatísticas não estão funcionando corretamente, pois não estão sendo atualizadas na interface.

## [5.2.0] - 2025-12-31
### Adicionado
- **Estatísticas Detalhadas no Recap**: O resumo anual agora mostra o total de páginas lidas para livros e total de episódios para séries.
- **Design para Redes Sociais**: O modal de Recap foi redesenhado para ser mais compacto e "printável", facilitando o compartilhamento em redes sociais.
- **Separação Visual**: Nova identidade visual por categorias dentro do Recap (Azul para Livros, Rosa para Séries, Amarelo para Filmes).

## [5.1.0] - 2025-12-28
### Alterado
- **Modelo de Segurança**: Migração para um sistema de validação de credenciais diretamente no backend (App Script).
- **GitHub Pages**: A `API_URL` voltou a ser pública no `script.js` para garantir compatibilidade com o deploy estático.
- **Simplificação**: Removida a dependência do arquivo `env.js`, unificando a configuração.
- **Resiliência**: Todas as chamadas ao backend agora enviam credenciais criptografadas (via HTTPS) para validação obrigatória.

## [5.0.0] - 2025-12-27

### Adicionado
- **Partitionamento por Usuário**: Os dados de cada usuário agora são isolados em suas próprias abas (ex: `anaalice`, `juliana`), garantindo total privacidade e performance.
- **Auto-Provisionamento**: Novas abas de usuários são criadas automaticamente no primeiro registro ou cadastro.
- **Utilitário de Limpeza**: Nova função `removerColunaTempoMedio` para automatizar a manutenção da planilha.
- **Segurança de API**: A URL do App Script foi movida para variáveis de ambiente (`.env` e `env.js`) protegidas por gitignore.

### Alterado
- **Arquitetura de Dados**: Transição de uma tabela única ("Biblioteca") para abas individuais nomeadas por nome de usuário.
- **Contexto da IA**: A Alice agora utiliza o histórico exclusivo da aba do usuário logado para sugestões e insights.

### Removido
- **Coluna Tempo Médio**: Removido completamente do banco de dados e da interface para simplificar o preenchimento.

## [4.8.0] - 2025-12-26

### Alterado
- **Sugestões com Autor**: O sistema de sugestões agora inclui explicitamente o nome do autor quando recomenda um livro, melhorando a precisão e utilidade das recomendações.

## [4.7.0] - 2025-12-23

### Alterado
- **Assistente Personalizado**: O assistente agora se apresenta como "Alice" (do País das Maravilhas) em vez de "Assistente da Alice"
- **Ícone da Alice**: Criado e implementado ícone estilizado do rosto da Alice, substituindo o emoji de robô 🤖
- **Identidade do Chat**: Todas as mensagens e referências ao assistente foram atualizadas para refletir a nova identidade como "Alice"

### Corrigido
- **Carregamento do App**: Corrigido erro crítico onde o app abria o arquivo README ao invés da aplicação. O arquivo principal foi renomeado para `index.html`.
- **Ícone do Aplicativo**: O ícone de instalação (PWA) agora usa corretamente a imagem da Alice de cabelo preto, substituindo o ícone antigo de livros.

## [4.6.0] - 2025-12-23

### Adicionado
- **Ícone Personalizado**: Novo ícone SVG customizado com design de livro mágico, gradiente roxo-rosa e estrelas douradas, substituindo o emoji genérico.
- **Tipografia Premium**: Fonte Cinzel (Google Fonts) aplicada ao título "Mundo da Alice" para um visual mais elegante e literário.

### Alterado
- **Identidade Visual**: Todos os ícones (favicon, PWA, Apple Touch) agora usam o design customizado.
- **Tela de Login**: Ícone SVG animado substituiu o emoji na tela de entrada.

## [4.5.0] - 2025-12-23

### Adicionado
- **Recap Anual**: O modal de Recap agora permite filtrar as estatísticas por ano. Foi adicionado um seletor de anos dinâmico que detecta todos os anos presentes na sua biblioteca.
- **Gráficos e Estatísticas Melhores**: O Recap agora exibe o número exato de itens acima das barras de categoria e as barras possuem um design mais robusto com sombras e cores vibrantes.

- **Interface**: O botão de fechar do Recap foi renomeado de "Continuar Lendo" para apenas "Continuar", tornando a navegação mais direta.

### Corrigido
- **Cálculos do Recap**: Corrigida falha no processamento de estatísticas anuais. O sistema agora interpreta corretamente datas no formato `DD/MM/AAAA`, garantindo que o resumo anual exiba os números reais da planilha.

## [4.4.0] - 2025-12-23

## [4.3.0] - 2025-12-23

## [4.2.0] - 2025-12-22

### Adicionado
- **Funcionalidade de Sugestões**: Novo botão "Sugerir algo 🪄" no assistente de chat. A IA agora analisa seu histórico de leitura/visualização e sugere novos títulos com sinopse e motivo da recomendação.

### Corrigido
- **Padronização de Avaliações**: Implementada sanitização automática para avaliações via IA. Mesmo que o assistente esqueça o emoji, o sistema agora garante o formato correto (ex: "Bom" vira "Bom 🙂").
- **Instruções da IA**: Reforço no sistema para que a IA sempre siga estritamente o formato de avaliação com emoji.

## [4.1.0] - 2025-12-22

### Adicionado
- **Prompt IA Aprimorado**: O assistente agora solicita explicitamente a data de leitura/assistência no formato `DD/MM/AAAA`.
- **Labels de Avaliação**: Emojis de avaliação atualizados para corresponder à interface do usuário (`Mais ou menos 🤨` e `Péssimo 😒`).

### Alterado
- **Curiosidades**: O tempo de exibição do balão de curiosidades foi aumentado de 10 para 30 segundos.

### Corrigido
- **Edição de Itens**: Corrigido bug onde os campos de **Data** e **Avaliação** apareciam vazios ao tentar editar um item. A lógica de conversão de data agora é mais robusta.
- **Data Padrão**: O formulário agora respeita quando uma data é deixada vazia, em vez de preencher automaticamente com a data de hoje.

## [4.0.0] - Dezembro 2025

### Adicionado
- **Assistente de Chat (IA)**: Integração com a API do Groq (`llama-3.3-70b-versatile`) para registro de itens através de conversação.
- **Bolha de Curiosidades**: Sistema que gera fatos interessantes sobre os itens da sua biblioteca usando IA.
- **Segurança Backend**: Proxy seguro via Google Apps Script para proteger a API Key do Groq.
- **Interface**: Novos botões flutuantes e animações para o chat e bolha de insights.

### Corrigido
- **Quebra de Texto**: Ajustado o CSS para evitar que mensagens longas saiam do balão de chat.
- **Autenticação**: Agora o sistema exige usuário e senha salvos localmente para permitir chamadas à IA.

## [3.1.0] - 2025-12-20

### Corrigido
- **Ordenação por Data**: Corrigido o erro que impedia a ordenação correta por "Mais recente" ou "Mais antigo". Agora o sistema processa corretamente datas no formato `DD/MM/AAAA`.
- **Robustez de Datas**: Novo sistema de tratamento de datas que aceita múltiplos formatos (`DD/MM/AAAA`, `AAAA-MM-DD`, ISO).

## [3.0.0] - Dezembro 2025

### Adicionado
- **Categoria Filmes**: Agora é possível adicionar, filtrar e ver estatísticas de Filmes 🎬.
- **Modularização**: O projeto foi dividido em arquivos separados (`biblioteca.html`, `style.css`, `script.js`) para facilitar a manutenção.
- **Filtros**: Novo filtro específico para "Filmes".
- **Design**: Novo ícone para identificar filmes na lista.

### Removido
- **Tempo Médio**: O campo "Tempo Médio" foi removido do formulário e da visualização dos itens.
- **Código Inline**: CSS e JavaScript foram removidos do arquivo HTML principal.


### Corrigido
- **Ordenação por Data**: Corrigido o erro que impedia a ordenação correta por "Mais recente" ou "Mais antigo". Agora o sistema processa corretamente datas no formato `DD/MM/AAAA`.
- **Processamento de Datas**: Implementada função robusta para garantir que formatos variados de data (planilha, input e sistema) sejam interpretados de forma consistente.
