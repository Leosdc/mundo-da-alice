import { state, render } from './state.js';
import {
    statusOptions,
    ratingOptions,
    categoryOptions,
    countryOptions
} from './constants.js';
import { formatDate, escapeHtml } from './utils.js';

export function renderLogin() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div class="text-center mb-8">
                    <div class="mb-4">
                        <img src="icon.png" alt="Mundo da Alice" class="w-32 h-32 mx-auto">
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2 app-title">Mundo da Alice</h1>
                    <p class="text-gray-600 italic">"${state.currentQuote.quote}"</p>
                    <p class="text-xs text-gray-400 mt-1">— ${state.currentQuote.book}</p>
                </div>

                <div class="mb-6">
                    <div class="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            onclick="state.isLoginMode = true; window.render();"
                            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${state.isLoginMode ? 'bg-white shadow-sm' : ''}"
                        >
                            Entrar
                        </button>
                        <button
                            onclick="state.isLoginMode = false; window.render();"
                            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${!state.isLoginMode ? 'bg-white shadow-sm' : ''}"
                        >
                            Cadastrar
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value="${state.loginData.username}"
                                oninput="state.loginData.username = this.value;"
                                placeholder="exemplo@email.com"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                ${state.loading ? 'disabled' : ''}
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                type="password"
                                value="${state.loginData.password}"
                                oninput="state.loginData.password = this.value;"
                                onkeypress="if(event.key === 'Enter') ${state.isLoginMode ? 'handleLogin()' : 'handleRegister()'};"
                                placeholder="Digite sua senha"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                ${state.loading ? 'disabled' : ''}
                            />
                        </div>

                        ${!state.isLoginMode ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular (Opcional)</label>
                            <input
                                type="tel"
                                value="${state.phoneNumber || ''}"
                                oninput="this.value = window.maskPhone(this.value); state.phoneNumber = this.value;"
                                placeholder="(00) 00000-0000"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                ${state.loading ? 'disabled' : ''}
                            />
                        </div>
                        ` : ''}

                    ${state.isLoginMode ? `
                    <div class="flex justify-between items-center px-1">
                        <button
                            onclick="handleForgotPassword()"
                            class="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                            Esqueci minha senha
                        </button>
                    </div>
                    ` : ''}

                    <button
                        onclick="${state.isLoginMode ? 'handleLogin()' : 'handleRegister()'};"
                        class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 mt-4"
                        ${state.loading ? 'disabled' : ''}
                    >
                        ${state.loading ? 'Aguarde...' : (state.isLoginMode ? '🔐 Entrar' : '✨ Criar Conta')}
                    </button>
                </div>

                ${!state.isLoginMode ? `
                <div class="text-center text-sm text-gray-500 mt-4">
                    <p>💡 Use um e-mail válido para poder recuperar sua senha.</p>
                    <p class="mt-1">Mínimo 6 caracteres na senha.</p>
                </div>
                ` : ''}
            </div>
        </div>
        ${state.showForgotPasswordModal ? renderForgotPasswordModal() : ''}
    `;
}

function renderThemeToggle() {
    return `
        <button
            onclick="window.toggleTheme()"
            class="theme-toggle-btn bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
            title="${state.theme === 'light' ? 'Mudar para modo noturno' : 'Mudar para modo claro'}"
        >
            <div class="sun-moon-container">
                <div class="sun-icon text-xl">☀️</div>
                <div class="moon-icon text-xl">🌙</div>
            </div>
        </button>
    `;
}

export function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    // Captura o estado de foco, seleção e rolagem antes de limpar o DOM
    const activeId = document.activeElement ? document.activeElement.id : null;
    const selectionStart = (activeId && document.activeElement.selectionStart !== undefined) ? document.activeElement.selectionStart : null;
    const selectionEnd = (activeId && document.activeElement.selectionEnd !== undefined) ? document.activeElement.selectionEnd : null;
    const scrollY = window.scrollY;

    if (!state.currentUser) {
        if (state.isAuthInitialized) {
            renderLogin();
        }
        return;
    }

    if (state.displayedItems.length === 0) {
        window.loadMoreItems();
    }
    const stats = window.getStats();
    const filteredItems = window.getFilteredItems();
    const hasMore = state.displayedItems.length < filteredItems.length;

    app.innerHTML = `
        <div class="bg-gradient-to-r from-purple-400 to-indigo-400 text-white p-6 shadow-lg shadow-purple-200/50">
            <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
                <div class="flex-1">
                    <h1 class="text-3xl md:text-4xl font-bold mb-1 app-title cursor-pointer" onclick="window.switchView('dashboard')">Mundo da Alice</h1>
                    <p class="text-purple-50 text-sm italic opacity-90">"${state.currentQuote.quote}"</p>
                    <p class="text-[10px] text-purple-100 uppercase tracking-widest font-bold mt-1">— ${state.currentQuote.book}</p>
                    ${state.loading ? '<p class="text-purple-100 mt-2 flex items-center justify-center md:justify-start gap-2"><span class="loading"></span> Carregando...</p>' : ''}
                </div>
                <div class="flex flex-col items-center md:items-end gap-3 px-2">
                    <div class="flex items-center gap-2">
                        <div class="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <span class="text-xs">👤 ${escapeHtml(state.currentUser.username)}</span>
                            <button onclick="window.handleProfileEdit()" class="text-xs hover:text-purple-200 transition-colors" title="Editar Perfil">⚙️</button>
                        </div>
                        ${state.latestChangelog.version ? `
                        <button
                            onclick="state.showChangelogModal = true; window.render();"
                            class="bg-yellow-400 hover:bg-yellow-300 text-purple-900 w-9 h-9 flex items-center justify-center rounded-full text-sm font-black transition-all hover:scale-110 active:scale-95 shadow-lg shadow-yellow-400/20"
                            title="Novidades v${state.latestChangelog.version}"
                        >
                            🎁
                        </button>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <a href='https://ko-fi.com/O4O41NAE7I' target='_blank' class="hover:scale-105 transition-transform">
                            <img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi4.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
                        </a>
                        ${state.currentUser.role === 'admin' ? `
                        <button
                            onclick="window.switchView('admin');"
                            class="w-11 h-11 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 border-2 ${state.currentView === 'admin' ? 'bg-white/40 border-white/50 shadow-lg' : 'bg-white/10 border-white/10 hover:bg-white/20'}"
                            title="Painel Admin"
                        >
                            🛠️
                        </button>
                        ` : ''}
                        ${renderThemeToggle()}
                    </div>
                    <div class="flex flex-wrap justify-center md:justify-end gap-2">
                        <button
                            onclick="window.switchView('dashboard')"
                            class="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${state.currentView === 'dashboard' ? 'bg-white/40 ring-2 ring-white/50' : ''}"
                            title="Início"
                        >
                            🏠 <span class="hidden lg:inline">Início</span>
                        </button>
                        <button
                            onclick="window.switchView('stats')"
                            class="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${state.currentView === 'stats' ? 'bg-white/40 ring-2 ring-white/50' : ''}"
                            title="Estatísticas"
                        >
                            📊 <span class="hidden lg:inline">Estatísticas</span>
                        </button>
                        <button
                            onclick="window.switchView('social')"
                            class="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${state.currentView === 'social' ? 'bg-white/40 ring-2 ring-white/50' : ''}"
                            title="Comunidade"
                        >
                            👥 <span class="hidden lg:inline">Comunidade</span>
                        </button>
                        <button
                            onclick="window.handleRecap();"
                            class="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            title="Recap"
                        >
                            ✨ <span class="hidden lg:inline">Recap</span>
                        </button>
                        <button
                            onclick="window.handleLogout();"
                            class="bg-white/10 hover:bg-red-500/40 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2"
                        >
                            🚪 Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>

        ${state.needsEmailLinking ? renderEmailLinkingModal() : ''}

        ${state.currentView === 'stats' ? renderStatsView() :
            state.currentView === 'social' ? renderSocialView() :
                state.currentView === 'admin' ? renderAdminView() : `
        <div class="max-w-6xl mx-auto px-4 mt-6">
            ${state.adminTargetUser ? `
                <div class="bg-blue-600 text-white p-4 rounded-2xl mb-6 flex justify-between items-center shadow-lg">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">👁️</span>
                        <div>
                            <p class="text-xs uppercase font-bold opacity-75">Modo Visualização Admin</p>
                            <p class="font-bold">Vendo registros de: ${state.adminTargetUser.username}</p>
                        </div>
                    </div>
                    <button onclick="state.adminTargetUser = null; window.loadData();" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                        Voltar para Meu Mundo
                    </button>
                </div>
            ` : ''}
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"> 
                <div class="bg-white rounded-[2rem] p-5 shadow-xl shadow-purple-500/5 border border-purple-50">
                    <div class="text-2xl font-black text-purple-600">${stats.total}</div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total</div>
                </div>
                <div class="bg-white rounded-[2rem] p-5 shadow-xl shadow-blue-500/5 border border-blue-50">
                    <div class="text-2xl font-black text-blue-600">${stats.books}</div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Livros</div>
                </div>
                <div class="bg-white rounded-[2rem] p-5 shadow-xl shadow-pink-500/5 border border-pink-50">
                    <div class="text-2xl font-black text-pink-600">${stats.series}</div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Séries</div>
                 </div>
                 <div class="bg-white rounded-[2rem] p-5 shadow-xl shadow-yellow-500/5 border border-yellow-50">
                    <div class="text-2xl font-black text-yellow-600">${stats.movies}</div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Filmes</div> 
                </div>
                <div class="bg-white rounded-[2rem] p-5 shadow-xl shadow-green-500/5 border border-green-50">
                    <div class="text-2xl font-black text-green-600">${stats.completed}</div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Concluídos</div>
                </div>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 pb-8">
            <div class="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-5 mb-6 border border-purple-50">
                <div class="space-y-4">
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Buscar nos registros..."
                                value="${state.searchInput}"
                                onkeypress="if(event.key === 'Enter') window.performSearch();"
                                class="w-full pl-10 pr-4 h-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm transition-all"
                            />
                            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        </div>
                        <button
                            onclick="window.performSearch();"
                            class="px-6 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95 flex items-center justify-center h-12"
                        >
                            <span class="hidden sm:inline">Buscar</span>
                            <span class="sm:hidden text-lg">🔍</span>
                        </button>
                        ${state.searchTerm ? `
                        <button
                            onclick="state.searchTerm = ''; state.searchInput = ''; window.render();"
                            class="px-4 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                        ` : ''}
                    </div>
                    
                    <div class="flex gap-2 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onclick="state.filter = 'all'; window.resetPagination(); window.render();"
                            class="px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm flex items-center gap-2 ${state.filter === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                        >
                            Todos
                        </button>
                        <button
                            onclick="state.filter = 'books'; window.resetPagination(); window.render();"
                            class="px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm flex items-center gap-2 ${state.filter === 'books' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                        >
                            📖 <span class="hidden sm:inline">Livros</span>
                        </button>
                        <button
                            onclick="state.filter = 'series'; window.resetPagination(); window.render();"
                            class="px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm flex items-center gap-2 ${state.filter === 'series' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                        >
                            📺 <span class="hidden sm:inline">Séries</span>
                        </button>
                         <button
                            onclick="state.filter = 'movies'; window.resetPagination(); window.render();"
                            class="px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm flex items-center gap-2 ${state.filter === 'movies' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                        >
                            🎬 <span class="hidden sm:inline">Filmes</span>
                        </button> 
                    </div>

                    <div class="flex gap-2 flex-wrap items-center">
                        <div class="relative flex-1 min-w-[120px]">
                            <button
                                onclick="state.activeDropdown = (state.activeDropdown === 'filterCountry' ? null : 'filterCountry'); window.render();"
                                class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 flex justify-between items-center transition-all hover:bg-gray-100"
                            >
                                <span class="truncate">🌍 ${state.countryFilter === 'all' ? 'País: Todos' : state.countryFilter}</span>
                                <span class="text-[10px] ml-2 ${state.activeDropdown === 'filterCountry' ? 'rotate-180' : ''}">▼</span>
                            </button>
                            ${state.activeDropdown === 'filterCountry' ? renderDropdownPortal('filterCountry') : ''}
                        </div>

                        <div class="relative flex-1 min-w-[120px]">
                            <button
                                onclick="state.activeDropdown = (state.activeDropdown === 'filterStatus' ? null : 'filterStatus'); window.render();"
                                class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 flex justify-between items-center transition-all hover:bg-gray-100"
                            >
                                <span class="truncate">🚦 ${state.statusFilter === 'all' ? 'Status: Todos' : state.statusFilter}</span>
                                <span class="text-[10px] ml-2 ${state.activeDropdown === 'filterStatus' ? 'rotate-180' : ''}">▼</span>
                            </button>
                            ${state.activeDropdown === 'filterStatus' ? renderDropdownPortal('filterStatus') : ''}
                        </div>

                        <div class="relative flex-1 min-w-[120px]">
                            <button
                                onclick="state.activeDropdown = (state.activeDropdown === 'filterRating' ? null : 'filterRating'); window.render();"
                                class="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 flex justify-between items-center transition-all hover:bg-gray-100"
                            >
                                <span class="truncate">⭐ ${state.ratingFilter === 'all' ? 'Avaliação: Todos' : state.ratingFilter}</span>
                                <span class="text-[10px] ml-2 ${state.activeDropdown === 'filterRating' ? 'rotate-180' : ''}">▼</span>
                            </button>
                            ${state.activeDropdown === 'filterRating' ? renderDropdownPortal('filterRating') : ''}
                        </div>

                        ${(state.countryFilter !== 'all' || state.statusFilter !== 'all' || state.ratingFilter !== 'all') ? `
                            <button 
                                onclick="state.countryFilter = 'all'; state.statusFilter = 'all'; state.ratingFilter = 'all'; window.resetPagination(); window.render();"
                                class="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors px-2"
                            >
                                Limpar Filtros
                            </button>
                        ` : ''}
                    </div>

                    <div class="grid grid-cols-4 gap-2">
                        <button
                            onclick="state.showForm = !state.showForm; if(state.showForm) state.shouldScrollToForm = true; window.render();"
                            class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-3 rounded-2xl font-bold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                            ${state.loading ? 'disabled' : ''}
                        >
                            <span>➕</span>
                            <span class="hidden sm:inline">Adicionar</span>
                        </button>
                        <button
                            onclick="window.loadData();"
                            class="bg-green-600 text-white px-3 py-3 rounded-2xl font-bold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                            ${state.loading ? 'disabled' : ''}
                        >
                            <span>🔄</span>
                            <span class="hidden sm:inline">Atualizar</span>
                        </button>
                        <div class="relative col-span-2">
                            <button
                                onclick="state.showSortMenu = !state.showSortMenu; window.render();"
                                class="w-full bg-gray-100 text-gray-700 px-3 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <span>🔽</span>
                                <span class="hidden sm:inline">Ordenar Lista</span>
                            </button>
                            ${state.showSortMenu ? `
                            <div class="absolute right-0 mt-2 w-48 bg-white border border-purple-50 rounded-2xl shadow-2xl p-2 z-[100] max-h-64 overflow-y-auto shadow-purple-200/50">
                                <button onclick="state.sortBy='title-asc'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'title-asc' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Título A–Z</button>
                                <button onclick="state.sortBy='title-desc'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'title-desc' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Título Z–A</button>
                                <button onclick="state.sortBy='date-desc'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'date-desc' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Mais recentes</button>
                                <button onclick="state.sortBy='date-asc'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'date-asc' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Mais antigos</button>
                                <button onclick="state.sortBy='category'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'category' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Categoria</button>
                                <button onclick="state.sortBy='status'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'status' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Status</button>
                                <button onclick="state.sortBy='rating'; state.showSortMenu=false; window.resetPagination(); window.render();" class="block w-full text-left px-4 py-2 hover:bg-purple-50 rounded-xl text-sm transition-colors ${state.sortBy === 'rating' ? 'bg-purple-100 text-purple-700 font-bold' : ''}">Avaliação</button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            ${state.showForm ? `
            <div id="formPanel" class="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-purple-100">
                <h2 class="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-center md:justify-start gap-2">
                    ${state.editingId !== null ? '✨ Editar Registro' : '➕ Novo Registro'}
                </h2>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="relative">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Categoria</label>
                            <div 
                                onclick="state.activeDropdown = (state.activeDropdown === 'category' ? null : 'category'); window.render();"
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm select-none cursor-pointer flex justify-between items-center"
                            >
                                <span>${state.formData.category || 'Selecionar'}</span>
                                <span class="text-xs transition-transform ${state.activeDropdown === 'category' ? 'rotate-180' : ''}">▼</span>
                            </div>
                            ${state.activeDropdown === 'category' ? renderDropdownPortal('category') : ''}
                        </div>

                        <div class="relative">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Status</label>
                            <div 
                                onclick="state.activeDropdown = (state.activeDropdown === 'status' ? null : 'status'); window.render();"
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm select-none cursor-pointer flex justify-between items-center"
                            >
                                <span>${state.formData.status || 'Selecionar'}</span>
                                <span class="text-xs transition-transform ${state.activeDropdown === 'status' ? 'rotate-180' : ''}">▼</span>
                            </div>
                            ${state.activeDropdown === 'status' ? renderDropdownPortal('status') : ''}
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Título do Item</label>
                            <input
                                type="text"
                                value="${state.formData.title}"
                                oninput="state.formData.title = this.value;"
                                placeholder="Ex: O Pequeno Príncipe"
                                class="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm"
                                ${state.loading ? 'disabled' : ''}
                            />
                        </div>

                        ${state.formData.category === 'Livro' ? `
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Autor(a)</label>
                            <input
                                type="text"
                                value="${state.formData.author}"
                                oninput="state.formData.author = this.value;"
                                placeholder="Ex: Antoine de Saint-Exupéry"
                                class="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm"
                                ${state.loading ? 'disabled' : ''}
                            />
                        </div>
                        ` : ''}

                        ${state.formData.category !== 'Filme' ? `
                            <div>
                                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                                    ${state.formData.category === 'Livro' ? 'Total de Páginas' : 'Total de Episódios'}
                                </label>
                                <input
                                    type="number"
                                    value="${state.formData.pages}"
                                    oninput="state.formData.pages = this.value;"
                                    class="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm"
                                    ${state.loading ? 'disabled' : ''}
                                />
                            </div>
                        ` : ''} 

                        <div class="relative">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Sua Avaliação</label>
                            <div 
                                onclick="state.activeDropdown = (state.activeDropdown === 'rating' ? null : 'rating'); window.render();"
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm select-none cursor-pointer flex justify-between items-center"
                            >
                                <span>${state.formData.rating || 'Como foi a experiência?'}</span>
                                <span class="text-xs transition-transform ${state.activeDropdown === 'rating' ? 'rotate-180' : ''}">▼</span>
                            </div>
                            ${state.activeDropdown === 'rating' ? renderDropdownPortal('rating') : ''}
                        </div>

                        <div class="relative">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Data</label>
                            <div 
                                id="date-display-field"
                                onclick="state.showDatePicker = !state.showDatePicker; window.render();"
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm select-none"
                            >
                                <span class="${state.formData.date ? '' : 'text-gray-400'}">${state.formData.date ? window.formatDate(state.formData.date) : 'Selecionar data'}</span>
                                <span class="text-purple-500">📅</span>
                            </div>
                            ${state.showDatePicker ? renderCalendarPortal() : ''}
                        </div>

                        ${(state.formData.category !== 'Livro') ? `
                        <div class="relative">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">País de Origem</label>
                            <div 
                                onclick="state.activeDropdown = (state.activeDropdown === 'country' ? null : 'country'); window.render();"
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 text-sm select-none cursor-pointer flex justify-between items-center"
                            >
                                <span>${state.formData.country || 'Opcional'}</span>
                                <span class="text-xs transition-transform ${state.activeDropdown === 'country' ? 'rotate-180' : ''}">▼</span>
                            </div>
                            ${state.activeDropdown === 'country' ? renderDropdownPortal('country') : ''}
                        </div>
                        ` : ''}
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onclick="window.handleSubmit();"
                            class="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-base shadow-purple-200"
                            ${state.loading ? 'disabled' : ''}
                        >
                            ${state.loading ? 'Salvando...' : (state.editingId !== null ? 'Salvar Alterações' : 'Confirmar e Salvar')}
                        </button>
                        <button
                            onclick="window.resetForm(); window.render();"
                            class="sm:w-auto px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            ${state.loading ? 'disabled' : ''}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="space-y-4">
                ${state.loading && state.items.length === 0 ? `
                <div class="bg-white rounded-3xl shadow-md p-16 text-center border border-gray-50">
                    <div class="loading w-12 h-12 mb-6 border-purple-500 border-t-transparent"></div>
                    <p class="text-gray-400 font-medium">Conectando ao seu Mundo...</p>
                </div>
                ` : state.displayedItems.length === 0 ? `
                <div class="bg-white rounded-3xl shadow-md p-16 text-center border border-gray-50">
                    <div class="text-6xl mb-6">${state.searchTerm ? '🔍' : '✨'}</div>
                    <p class="text-gray-500 text-xl font-bold">
                        ${state.searchTerm ? 'Nenhum resultado para sua busca' : 'Sua estante está vazia'}
                    </p>
                    <p class="text-gray-400 mt-2">Que tal adicionar algo novo hoje?</p>
                </div>
                ` : state.displayedItems.map((item) => `
                <div class="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all p-5 md:p-6 border border-gray-100 group">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex items-start gap-4 flex-1">
                            <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-purple-50 transition-colors" title="${item.category}">
                                ${item.category === 'Livro' ? '<img src="assets/icons/book.png" class="w-10 h-10 object-contain" />' :
                        (item.category === 'Série' || item.category === 'Serie') ? '<img src="assets/icons/series.png" class="w-10 h-10 object-contain" />' :
                            (item.category === 'Filme' || item.category === 'Filmes') ? '<img src="assets/icons/movie.png" class="w-10 h-10 object-contain" />' : '❓'}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[10px] font-black uppercase tracking-widest text-purple-400">${item.category}</span>
                                    ${item.country ? `<span class="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">${item.country}</span>` : ''}
                                </div>
                                <h3 class="text-xl font-black text-gray-800 break-words leading-tight">${escapeHtml(item.title)}</h3>
                                ${item.author ? `<p class="text-gray-500 mt-1 font-medium text-sm flex items-center gap-1">✍️ ${escapeHtml(item.author)}</p>` : ''}
                                
                                <div class="flex flex-wrap gap-2 mt-4">
                                    <span class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                        <span class="w-2 h-2 rounded-full ${item.status === 'Lido' || item.status === 'Assistido' ? 'bg-green-500' : (item.status === 'Lendo' || item.status === 'Assistindo' ? 'bg-blue-500' : 'bg-yellow-500')}"></span>
                                        ${item.status}
                                    </span>
                                    ${item.rating ? `
                                    <span class="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-bold border border-yellow-100">
                                        ${item.rating}
                                    </span>
                                    ` : ''}
                                    ${item.pages ? `
                                    <span class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                                        📄 ${item.pages} ${item.category === 'Livro' ? 'págs' : 'eps'}
                                    </span>
                                    ` : ''}
                                    ${item.date ? `<span class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold border border-purple-100">📅 ${formatDate(item.date)}</span>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="flex sm:flex-col gap-2 justify-end sm:justify-start">
                            <button
                                onclick="window.handleEdit('${item.id}')"
                                class="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Editar"
                                ${state.loading ? 'disabled' : ''}
                            >
                                ✏️
                            </button>
                            <button
                                onclick="window.handleDelete('${item.id}')"
                                class="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Excluir"
                                ${state.loading ? 'disabled' : ''}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
                `).join('')}
                
                ${hasMore && state.displayedItems.length > 0 ? `
                <div id="infinite-scroll-sentinel" class="flex justify-center py-12">
                    <div class="loading border-purple-500 border-t-transparent w-8 h-8"></div>
                </div>
                ` : ''}
                
                ${state.displayedItems.length > 0 && !hasMore ? `
                <div class="text-center py-10 text-gray-400 font-bold text-sm tracking-widest uppercase">
                    ✨ Fim da Estante ✨
                </div>
                ` : ''}
            </div>
        `}

        ${renderChat()}
        ${renderInsight()}
        ${renderRecapModal()}
        ${renderProfileModal()}
        ${renderChangelogModal()}
`;

    // Restauração de rolagem, foco e cursor genérica (CIRÚRGICA)
    if (scrollY !== undefined) {
        window.scrollTo(0, scrollY);
    }

    if (activeId) {
        const restoreFocus = () => {
            const element = document.getElementById(activeId);
            if (element) {
                element.focus();
                if (selectionStart !== null && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                    try {
                        element.setSelectionRange(selectionStart, selectionEnd || selectionStart);
                    } catch (e) { }
                }
            }
        };
        // Tenta restaurar imediatamente para evitar flicker
        restoreFocus();
        // Backup com timeout para garantir em casos de layout assíncrono
        setTimeout(restoreFocus, 0);
    }

    // Listener para o input de busca principal para preservar o cursorPos do estado se necessário
    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', function (e) {
            state.searchInput = e.target.value;
            state.cursorPos = e.target.selectionStart;
        });
    }

    // Scroll para o formulário
    if (state.showForm && state.shouldScrollToForm) {
        setTimeout(() => {
            const formPanel = document.getElementById('formPanel');
            if (formPanel) {
                formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                state.shouldScrollToForm = false;
            }
        }, 100);
    }

    // Infinite Scroll initiation
    if (typeof window.setupInfiniteScroll === 'function') {
        setTimeout(window.setupInfiniteScroll, 100);
    }
}

function renderChart() {
    const data = window.getChartData();
    if (data.length === 0) {
        return '<div class="text-center text-gray-500 py-12 text-sm">Nenhum dado disponível para o período selecionado</div>';
    }

    const maxValue = Math.max(...data.map(d => d.value));

    return `
    <div class="space-y-3">
        ${data.map(item => {
        const percentage = (item.value / maxValue) * 100;
        return `
                    <div class="flex items-center gap-2">
                        <div class="w-20 md:w-32 text-xs md:text-sm text-gray-600 text-right flex-shrink-0">${item.label}</div>
                        <div class="flex-1 flex items-center gap-2">
                            <div class="flex-1 bg-gray-100 rounded-full h-7 md:h-8 relative overflow-hidden">
                                <div
                                    class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 flex items-center justify-end px-2 md:px-3"
                                    style="width: ${percentage}%"
                                >
                                    <span class="text-white font-bold text-xs md:text-sm">${item.value}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    }).join('')
        }
        </div >
    `;
}

function renderStatsView() {
    const stats = window.getStats();
    return `
    <div class="max-w-6xl mx-auto px-4 mt-6 pb-8">
            <h2 class="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center md:justify-start gap-2 text-center md:text-left">
                📊 Estatísticas Detalhadas
            </h2>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white rounded-2xl p-6 shadow-md border-b-4 border-purple-500">
                    <div class="text-3xl font-bold text-purple-600">${stats.total}</div>
                    <div class="text-sm text-gray-600 font-medium tracking-tight">Total de Itens</div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-md border-b-4 border-blue-500">
                    <div class="text-3xl font-bold text-blue-600">${stats.books}</div>
                    <div class="text-sm text-gray-600 font-medium tracking-tight">Livros</div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-md border-b-4 border-pink-500">
                    <div class="text-3xl font-bold text-pink-600">${stats.series}</div>
                    <div class="text-sm text-gray-600 font-medium tracking-tight">Séries</div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-md border-b-4 border-yellow-500">
                    <div class="text-3xl font-bold text-yellow-600">${stats.movies}</div>
                    <div class="text-sm text-gray-600 font-medium tracking-tight">Filmes</div>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">Gráfico de Atividade</h3>
                        <p class="text-gray-500 text-sm">Visualize sua jornada no tempo</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
                        <button onclick="state.chartPeriod = 'monthly'; window.render();" class="px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.chartPeriod === 'monthly' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}">Mensal</button>
                        <button onclick="state.chartPeriod = 'yearly'; window.render();" class="px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.chartPeriod === 'yearly' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}">Anual</button>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mb-8 bg-gray-50 p-2 rounded-xl">
                    <button onclick="state.chartType = 'all'; window.render();" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${state.chartType === 'all' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}">Todos</button>
                    <button onclick="state.chartType = 'books'; window.render();" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${state.chartType === 'books' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}">📖 Livros</button>
                    <button onclick="state.chartType = 'series'; window.render();" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${state.chartType === 'series' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}">📺 Séries</button>
                    <button onclick="state.chartType = 'movies'; window.render();" class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${state.chartType === 'movies' ? 'bg-yellow-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}">🎬 Filmes</button>
                </div>

                <div class="min-h-[350px]">
                    ${renderChart()}
                </div>
            </div>

    <div class="mt-6 md:hidden">
        <button
            onclick="window.switchView('dashboard')"
            class="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold shadow-md border border-gray-100 flex items-center justify-center gap-2"
        >
            🏠 Voltar para o Início
        </button>
    </div>
        </div>
    `;
}

export function renderSocialView() {
    return `
    <div class="max-w-6xl mx-auto px-4 mt-6 pb-20">
            <h2 class="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center md:justify-start gap-2 text-center md:text-left">
                👥 Comunidade Online
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-4">
                    <div class="bg-white rounded-3xl shadow-xl p-6 border border-purple-50">
                        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            🟢 Usuários Ativos
                        </h3>
                        <div class="space-y-3">
                            ${state.activeUsers.length === 0 ? `
                                <p class="text-xs text-gray-400 italic text-center py-4">Buscando viajantes...</p>
                            ` : state.activeUsers.map(user => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">👤</div>
                                            <div>
                                                <div class="text-sm font-bold text-gray-800">${escapeHtml(user.username)}</div>
                                                <div class="text-[10px] text-green-500 font-medium">${user.uid === state.currentUser?.uid ? 'Você' : 'Online'}</div>
                                            </div>
                                        </div>
                                        ${user.phoneNumber && user.showWhatsApp ? `
                                            <a href="https://wa.me/${user.phoneNumber.replace(/\D/g, '')}" target="_blank" class="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all text-sm" title="Chamar no WhatsApp">
                                                📱
                                            </a>
                                        ` : ''}
                                    </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-purple-50 overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
                        <h3 class="font-bold flex items-center gap-2 text-lg">🌐 Chat Global</h3>
                        <p class="text-[10px] text-purple-100 opacity-80 uppercase tracking-widest font-bold">Aberto para todos os usuários</p>
                    </div>

                    <div id="global-chat-container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                        ${state.globalMessages.length === 0 ? `
                            <div class="h-full flex flex-col items-center justify-center text-gray-400">
                                <span class="text-4xl mb-4">🎈</span>
                                <p class="text-sm font-medium">Seja o primeiro a dizer oi!</p>
                            </div>
                        ` : state.globalMessages.map(msg => `
                            <div class="flex flex-col ${msg.userId === state.currentUser?.uid ? 'items-end' : 'items-start'}">
                                ${msg.type === 'notification' ? `
                                    <div class="w-full flex justify-center my-2">
                                        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2">
                                            <span>📢</span> ${msg.text}
                                        </div>
                                    </div>
                                ` : `
                                    <span class="text-[10px] font-bold text-gray-400 mb-1 px-2">${escapeHtml(msg.username)}</span>
                                    <div class="max-w-[85%] p-3 rounded-2xl text-sm ${msg.userId === state.currentUser?.uid
            ? 'bg-purple-600 text-white rounded-tr-none shadow-lg'
            : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'}">
                                        ${escapeHtml(msg.text)}
                                    </div>
                                    <span class="text-[9px] text-gray-300 mt-1 px-2">${msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                `}
                            </div>
                        `).join('')}
                    </div>

                    <div class="p-4 bg-white border-t border-gray-100">
                        <div class="flex gap-2">
                            <input
                                type="text"
                                id="global-chat-input"
                                placeholder="Diga algo para a comunidade..."
                                onkeypress="if(event.key === 'Enter') window.sendGlobalMessage();"
                                class="flex-1 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onclick="window.sendGlobalMessage();"
                                class="p-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 active:scale-95"
                            >
                                🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderProfileModal() {
    if (!state.showProfileModal) return '';

    return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
                <div class="text-4xl mb-2">👤</div>
                <h3 class="text-xl font-bold">Editar Perfil</h3>
                <p class="text-purple-100 text-sm">Atualize suas informações</p>
            </div>

            <div class="p-6 space-y-6">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">Usuário</label>
                    <input
                        type="text"
                        value="${state.currentUser.username}"
                        disabled
                        class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-400 cursor-not-allowed"
                    />
                    <p class="text-[10px] text-gray-400 mt-1 italic">O nome de usuário não pode ser alterado.</p>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">WhatsApp / Celular</label>
                    <input
                        type="tel"
                        id="edit-profile-phone"
                        value="${state.tempProfileData.phoneNumber}"
                        oninput="this.value = window.maskPhone(this.value); state.tempProfileData.phoneNumber = this.value;"
                        placeholder="(00) 00000-0000"
                        class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    />
                </div>

                <div class="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div>
                        <p class="text-sm font-bold text-purple-900">Exibir WhatsApp na Comunidade</p>
                        <p class="text-[10px] text-purple-700">Permite que outros usuários vejam seu contato.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" ${state.tempProfileData.showWhatsApp ? 'checked' : ''} onchange="state.tempProfileData.showWhatsApp = this.checked;" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                <div class="flex gap-3 pt-2">
                    <button
                        onclick="state.showProfileModal = false; window.render();"
                        class="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onclick="window.saveProfile();"
                        class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        Salvar ✨
                    </button>
                </div>
            </div>
        </div>
        </div >
    `;
}

export function renderChat() {
    if (!state.userPermissions?.canUseAIChat) return '';
    if (!state.chatOpen) {
        return `
    <button
onclick="state.chatOpen = true; window.render();"
class="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50"
title="Conversar com a Alice"
    >
                💬
            </button>
    `;
    }

    return `
    <div class="fixed bottom-8 right-8 w-80 md:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-[60] border border-purple-100 overflow-hidden chat-message">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <img src="alice_face_icon.png" alt="Alice" class="w-8 h-8 rounded-full object-cover" />
                    <div>
                        <h3 class="font-bold text-sm">Alice</h3>
                        <p class="text-[10px] text-purple-100">Pronta para ajudar! ✨</p>
                    </div>
                </div>
                <button onclick="state.chatOpen = false; window.render();" class="hover:bg-white/20 p-1 rounded-lg transition-colors">
                    ✕
                </button>
            </div>

            <div id="chat-container" class="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50/50 chat-scroll">
                ${state.chatMessages.map(msg => `
                    <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[80%] p-3 rounded-2xl text-sm chat-message ${msg.role === 'user'
            ? 'bg-purple-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
        }">
                            ${escapeHtml(msg.content)}
                        </div>
                    </div>
                `).join('')}
                ${state.isChatLoading ? `
                    <div class="flex justify-start">
                        <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none">
                            <span class="flex gap-1">
                                <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                                <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                        </div>
                    </div>
                ` : ''}
            </div>

    <div class="p-3 bg-white border-t border-gray-100">
        <div class="flex gap-2 mb-2">
            <button
                onclick="window.handleSuggestionRequest();"
                class="flex-1 py-1.5 px-3 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 border border-purple-100"
                ${state.isChatLoading ? 'disabled' : ''}
            >
                <span>Sugerir algo 🪄</span>
            </button>
        </div>
        <div class="flex gap-2">
            <input
                type="text"
                id="chat-input"
                placeholder="Digite sua mensagem..."
                onkeypress="if(event.key === 'Enter') window.handleChatSubmit();"
                class="flex-1 px-3 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                ${state.isChatLoading ? 'disabled' : ''}
            />
            <button
                onclick="window.handleChatSubmit();"
                class="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                ${state.isChatLoading ? 'disabled' : ''}
            >
                🚀
            </button>
        </div>
    </div>
    </div>
    `;
}

export function renderInsight() {
    if (!state.userPermissions?.canUseCuriosities) return '';
    if (!state.showInsight && !state.isGeneratingInsight) {
        return `
    <button
onclick="window.generateInsight();"
class="fixed bottom-8 right-[104px] md:right-[98px] md:px-4 py-3 bg-white text-purple-600 rounded-full shadow-lg border border-purple-100 flex items-center justify-center gap-2 hover:scale-105 transition-all z-50 text-sm font-medium w-14 h-14 md:w-auto md:h-auto"
    >
                <span class="text-xl">✨</span>
                <span class="hidden md:inline">Me conte uma curiosidade</span>
            </button>
    `;
    }

    if (state.isGeneratingInsight) {
        return `
    <div class="fixed bottom-8 right-[104px] md:right-[98px] px-4 py-3 bg-white text-purple-600 rounded-full shadow-lg border border-purple-100 flex items-center justify-center gap-2 z-50 text-sm font-medium chat-message w-14 h-14 md:w-auto md:h-auto">
                <span class="text-xl animate-spin">✨</span>
                <span class="hidden md:inline">Pensando...</span>
            </div>
    `;
    }

    return `
    <div class="fixed bottom-24 right-8 md:bottom-8 md:right-[98px] max-w-xs bg-white p-4 rounded-2xl shadow-2xl border border-purple-100 z-50 chat-message">
        <div class="flex items-start gap-3">
            <span class="text-xl">💡</span>
            <div>
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Você sabia?</h4>
                <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(state.insightMessage)}</p>
            </div>
            <button onclick="state.showInsight = false; window.render();" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        </div>
    `;
}

export function renderRecapModal() {
    if (!state.showRecapModal) return '';

    const data = window.getRecapData();
    const currentYear = new Date().getFullYear();
    const availableYears = [...new Set(state.items.filter(i => i.date).map(i => {
        const d = window.toValidDate(i.date);
        return d ? d.getFullYear() : null;
    }).filter(y => y))].sort((a, b) => b - a);
    if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear);

    return `
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative max-h-[95vh] flex flex-col">
            <div class="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white relative">
                <button
                    onclick="state.showRecapModal = false; window.render();"
                    class="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
                >✕</button>
                <div class="text-center">
                    <div class="text-4xl mb-2">✨</div>
                    <h2 class="text-2xl font-bold">Resumo ${state.recapYear}</h2>
                    <p class="text-[10px] text-white/70 uppercase font-black tracking-widest mt-1">Segue seu RECAP para publicar nas redes sociais! ✨</p>

                    <div class="mt-4 relative inline-block">
                        <div 
                            onclick="state.activeDropdown = (state.activeDropdown === 'recapYears' ? null : 'recapYears'); window.render();"
                            class="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-white text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-white/30 transition-all border border-white/10"
                        >
                            <span>${state.recapYear}</span>
                            <span class="text-[10px] transition-transform ${state.activeDropdown === 'recapYears' ? 'rotate-180' : ''}">▼</span>
                        </div>
                        
                        ${state.activeDropdown === 'recapYears' ? `
                        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl py-2 min-w-[100px] z-[10001] border border-purple-100 overflow-hidden">
                            <div class="max-height-[200px] overflow-y-auto">
                                ${availableYears.map(y => `
                                    <div 
                                        onclick="state.recapYear = ${y}; state.activeDropdown = null; window.render();"
                                        class="px-4 py-2 text-gray-700 text-sm font-bold hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer ${y === state.recapYear ? 'bg-purple-50 text-purple-600' : ''}"
                                    >
                                        ${y}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="p-5 overflow-y-auto space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-purple-50 p-3 rounded-2xl text-center border border-purple-100">
                        <div class="text-2xl mb-1">📚</div>
                        <div class="text-xl font-bold text-purple-700">${data.total}</div>
                        <div class="text-[10px] text-purple-600 uppercase font-bold tracking-wider">Registros</div>
                    </div>
                    <div class="bg-pink-50 p-3 rounded-2xl text-center border border-pink-100">
                        <div class="text-2xl mb-1">✅</div>
                        <div class="text-xl font-bold text-pink-700">${data.completedItemsCount}</div>
                        <div class="text-[10px] text-pink-600 uppercase font-bold tracking-wider">Concluídos</div>
                    </div>
                </div>

                <div class="space-y-3">
                    ${data.completedBooksCount > 0 ? `
                        <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div class="text-2xl">📖</div>
                            <div>
                                <div class="text-xs text-blue-600 font-bold uppercase tracking-tight">Livros</div>
                                <div class="text-sm font-medium text-gray-800">
                                    <span class="font-bold text-blue-700">${data.completedBooksCount}</span> livros... 
                                    <span class="font-bold text-blue-700">${data.totalPages}</span> páginas total
                                </div>
                            </div>
                        </div>
                        ` : ''}

                    ${data.completedSeriesCount > 0 ? `
                        <div class="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                            <div class="text-2xl">📺</div>
                            <div>
                                <div class="text-xs text-pink-600 font-bold uppercase tracking-tight">Séries</div>
                                <div class="text-sm font-medium text-gray-800">
                                    <span class="font-bold text-pink-700">${data.completedSeriesCount}</span> séries... 
                                    <span class="font-bold text-pink-700">${data.totalEpisodes}</span> episódios
                                </div>
                            </div>
                        </div>
                        ` : ''}

                    ${data.completedMoviesCount > 0 ? `
                        <div class="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                            <div class="text-2xl">🎬</div>
                            <div>
                                <div class="text-xs text-yellow-600 font-bold uppercase tracking-tight">Filmes</div>
                                <div class="text-sm font-medium text-gray-800">
                                    <span class="font-bold text-yellow-700">${data.completedMoviesCount}</span> filmes assistidos
                                </div>
                            </div>
                        </div>
                        ` : ''}
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div class="text-xs text-gray-500 uppercase font-bold mb-1">Status Favorito</div>
                        <div class="text-sm font-bold text-gray-800 truncate">${data.mostUsedRating}</div>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div class="text-xs text-gray-500 uppercase font-bold mb-1">Mais visto/lido</div>
                        <div class="text-sm font-bold text-gray-800 truncate">${data.favoriteCategory}</div>
                    </div>
                </div>

                ${data.total > 0 ? `
                    <div class="pt-2">
                        <div class="flex justify-around items-end h-24 px-2 text-center">
                            <div class="flex flex-col items-center gap-1 w-full">
                                <div class="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-1000 shadow-md" style="height: ${(data.booksCount / data.total) * 100}%"></div>
                                <div class="text-[9px] font-bold text-gray-400">${data.booksCount}</div>
                                <div class="text-[10px] font-bold text-gray-700">Livros</div>
                            </div>
                            <div class="flex flex-col items-center gap-1 w-full">
                                <div class="w-full max-w-[30px] bg-pink-500 rounded-t-lg transition-all duration-1000 shadow-md" style="height: ${(data.seriesCount / data.total) * 100}%"></div>
                                <div class="text-[9px] font-bold text-gray-400">${data.seriesCount}</div>
                                <div class="text-[10px] font-bold text-gray-700">Séries</div>
                            </div>
                            <div class="flex flex-col items-center gap-1 w-full">
                                <div class="w-full max-w-[30px] bg-yellow-500 rounded-t-lg transition-all duration-1000 shadow-md" style="height: ${(data.moviesCount / data.total) * 100}%"></div>
                                <div class="text-[9px] font-bold text-gray-400">${data.moviesCount}</div>
                                <div class="text-[10px] font-bold text-gray-700">Filmes</div>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <div class="text-center py-4 text-gray-400">
                        <p class="text-sm">Nenhum registro em ${state.recapYear}</p>
                    </div>
                    `}
            </div>

            <div class="p-4 bg-gray-50 border-t flex justify-center">
                <button
                    onclick="state.showRecapModal = false; window.render();"
                    class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-2.5 rounded-full font-bold shadow-lg text-sm"
                >
                    Fechar
                </button>
            </div>
        </div>
    </div >
    `;
}

export function renderEmailLinkingModal() {
    return `
    < div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-purple-100">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
                <div class="text-5xl mb-4">📧</div>
                <h3 class="text-2xl font-bold mb-2">Vincular E-mail Real</h3>
                <p class="text-purple-100 text-sm leading-relaxed">
                    Para garantir a segurança da sua conta e permitir a recuperação de senha, vincule um e-mail válido.
                </p>
            </div>

            <div class="p-8 space-y-6">
                <div>
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu Novo E-mail</label>
                    <input
                        type="email"
                        id="linking-email-input"
                        placeholder="seu@email.com"
                        class="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none font-medium"
                    />
                </div>

                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                    <span class="text-xl">ℹ️</span>
                    <p class="text-xs text-blue-700 leading-tight">
                        Seu nome de usuário continuará o mesmo para login. O e-mail será usado apenas para segurança.
                    </p>
                </div>

                <button
                    onclick="window.handleEmailLinking()"
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all text-lg mb-4"
                    ${state.loading ? 'disabled' : ''}
                >
                    ${state.loading ? 'Vinculando...' : 'Confirmar E-mail ✨'}
                </button>

                <button
                    onclick="window.handleLogout()"
                    class="w-full bg-gray-100 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm"
                >
                    Sair da conta e tentar depois
                </button>
            </div>
        </div>
    </div >
    `;
}

export function renderAdminView() {
    return `
    <div class="max-w-6xl mx-auto px-4 mt-6 pb-20 animate-fade-in">
        <div class="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-purple-100 dark:border-gray-800 overflow-hidden">
            <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 dark:from-gray-950 dark:via-purple-950 dark:to-gray-950 p-8 text-white shadow-inner">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="text-center md:text-left">
                        <h2 class="text-3xl font-black tracking-tight mb-1 text-center md:text-left">Painel Administrativo</h2>
                        <p class="text-[10px] uppercase font-black tracking-[0.3em] text-purple-300 opacity-80 text-center md:text-left">Alice Master Control v1.0</p>
                    </div>
                    <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <span class="text-3xl">🛠️</span>
                    </div>
                </div>
            </div>

            <div class="p-6 md:p-8 space-y-10 bg-white/50 dark:bg-transparent">
                <section>
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-center md:justify-start gap-2">
                        <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Notificação Global
                    </h3>
                    <div class="space-y-4 bg-yellow-50/80 dark:bg-yellow-900/10 p-6 rounded-[2rem] border border-yellow-100 dark:border-yellow-900/20 shadow-sm">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase ml-4">Mensagem Geral</label>
                            <input
                                type="text"
                                id="global-notif-input"
                                placeholder="Digite um aviso para todos os usuários..."
                                class="w-full bg-white dark:bg-gray-800 border-2 border-yellow-100/50 dark:border-transparent rounded-2xl px-6 py-4 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 dark:focus:ring-yellow-400/10 outline-none transition-all font-medium text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <button
                            onclick="window.sendGlobalNotification(document.getElementById('global-notif-input').value.trim())"
                            class="w-full bg-gray-900 dark:bg-yellow-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-gray-200 dark:shadow-none hover:scale-[1.01] transition-all text-sm uppercase tracking-widest"
                        >
                            🚀 Enviar Notificação
                        </button>
                    </div>
                </section>

                <section>
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-center md:justify-start gap-2">
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Recuperação de Dados (Busca por Nome/ID Legado)
                    </h3>
                    <div class="space-y-4 bg-blue-50/80 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 shadow-sm">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase ml-4">Nome ou UID</label>
                            <input
                                type="text"
                                id="legacy-search-input"
                                placeholder="Ex: juliana ou fDmtf..."
                                class="w-full bg-white dark:bg-gray-800 border-2 border-blue-100/50 dark:border-transparent rounded-2xl px-6 py-4 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-400/10 outline-none transition-all font-medium text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                onkeypress="if(event.key === 'Enter') window.findLegacyData(this.value.trim());"
                            />
                        </div>
                        <button
                            onclick="window.findLegacyData(document.getElementById('legacy-search-input').value.trim())"
                            class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none hover:scale-[1.01] transition-all text-sm uppercase tracking-widest"
                        >
                            🔍 Buscar Registros
                        </button>
                    </div>
                </section>

                <section>
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-center md:justify-start gap-2">
                        <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Migração de Itens (Transferir para Nova Conta)
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50/80 dark:bg-purple-900/10 p-6 rounded-[2rem] border border-purple-100 dark:border-purple-900/20 shadow-sm">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase ml-4">UID Origem (Antigo)</label>
                            <input
                                type="text"
                                id="mig-old-uid"
                                placeholder="UID antigo (ex: fDmtf...)"
                                class="w-full bg-white dark:bg-gray-800 border-2 border-purple-100/50 dark:border-transparent rounded-2xl px-6 py-4 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-400/10 outline-none transition-all font-medium text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase ml-4">UID Destino (Novo)</label>
                            <input
                                type="text"
                                id="mig-new-uid"
                                placeholder="Substituir por ID do novo usuário..."
                                class="w-full bg-white dark:bg-gray-800 border-2 border-purple-100/50 dark:border-transparent rounded-2xl px-6 py-4 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-400/10 outline-none transition-all font-medium text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <div class="md:col-span-2">
                            <button
                                onclick="if(confirm('Tem certeza? Isso vai mover TODOS os itens do UID antigo para o novo UID.')) window.migrateItems(document.getElementById('mig-old-uid').value.trim(), document.getElementById('mig-new-uid').value.trim())"
                                class="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-100 dark:shadow-none hover:scale-[1.01] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <span class="text-xl">🚀</span> Executar Migração de Dados
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                            Gestão de Usuários (${state.allUsers.length})
                        </h3>
                        <button onclick="window.fetchAllUsers()" class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-200 transition-colors shadow-sm">
                            🔄 Atualizar Lista
                        </button>
                    </div>

                    <div class="hidden lg:block overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left border-b border-gray-100 dark:border-gray-800">
                                    <th class="pb-4 pt-6 font-black text-gray-400 text-[10px] uppercase tracking-widest pl-6">Usuário</th>
                                    <th class="pb-4 pt-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">E-mail</th>
                                    <th class="pb-4 pt-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Status IA</th>
                                    <th class="pb-4 pt-6 font-black text-gray-400 text-[10px] uppercase tracking-widest pr-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                ${state.allUsers.map(user => `
                                    <tr class="group hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                        <td class="py-5 pl-6">
                                            <div class="font-bold text-gray-800 dark:text-gray-200">${user.username}</div>
                                            <div class="text-[10px] text-gray-400 font-mono">${user.uid}</div>
                                        </td>
                                        <td class="py-5">
                                            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">${user.email || user.requestedEmail || user.realEmail || '—'}</div>
                                        </td>
                                        <td class="py-5">
                                            <div class="flex gap-2">
                                                <button
                                                    onclick="window.updateUserPermissions('${user.uid}', 'canUseAIChat', ${!user.canUseAIChat})"
                                                    class="px-3 py-2 rounded-xl text-[10px] font-black tracking-tighter transition-all ${user.canUseAIChat ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}"
                                                >
                                                    ${user.canUseAIChat ? '🚀 IA ATIVA' : '🚫 IA INATIVA'}
                                                </button>
                                                <button
                                                    onclick="window.updateUserPermissions('${user.uid}', 'canUseCuriosities', ${!user.canUseCuriosities})"
                                                    class="px-3 py-2 rounded-xl text-[10px] font-black tracking-tighter transition-all ${user.canUseCuriosities ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}"
                                                >
                                                    ✨ CUR. ATIVA
                                                </button>
                                            </div>
                                        </td>
                                        <td class="py-5 pr-6 text-right">
                                            <button
                                                onclick="window.fetchUserItems('${user.uid}')"
                                                class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200/50 dark:shadow-none transition-all active:scale-95"
                                            >
                                                Ver Itens
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="lg:hidden space-y-4">
                        ${state.allUsers.map(user => `
                            <div class="bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-sm">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <div class="font-black text-gray-800 text-lg">${user.username}</div>
                                        <div class="text-[10px] text-gray-400 font-medium font-mono">${user.uid}</div>
                                    </div>
                                    <button
                                        onclick="window.fetchUserItems('${user.uid}')"
                                        class="p-3 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="Ver Registros"
                                    >
                                        📂
                                    </button>
                                </div>
                                <div class="text-sm text-gray-500 font-medium mb-5 bg-white p-3 rounded-2xl border border-gray-100">
                                    <span class="text-gray-400 mr-2">📧</span>
                                    ${user.email || user.requestedEmail || user.realEmail || 'Sem e-mail'}
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <button
                                        onclick="window.updateUserPermissions('${user.uid}', 'canUseAIChat', ${!user.canUseAIChat})"
                                        class="flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-sm border-2 ${user.canUseAIChat ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-100 border-transparent text-gray-400'}"
                                    >
                                        <span class="text-xl mb-1">${user.canUseAIChat ? '🤖' : '🚫'}</span>
                                        <span class="text-[10px] font-black uppercase tracking-widest">${user.canUseAIChat ? 'IA On' : 'IA Off'}</span>
                                    </button>
                                    <button
                                        onclick="window.updateUserPermissions('${user.uid}', 'canUseCuriosities', ${!user.canUseCuriosities})"
                                        class="flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-sm border-2 ${user.canUseCuriosities ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-100 border-transparent text-gray-400'}"
                                    >
                                        <span class="text-xl mb-1">${user.canUseCuriosities ? '✨' : '⏳'}</span>
                                        <span class="text-[10px] font-black uppercase tracking-widest">${user.canUseCuriosities ? 'Curios. On' : 'Off'}</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    </div>
    `;
}

export function renderForgotPasswordModal() {
    return `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in shadow-2xl">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-purple-100 relative">
            <div class="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div class="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

                <button
                    onclick="state.showForgotPasswordModal = false; window.render();"
                    class="absolute top-4 right-4 text-white/70 hover:text-white transition-all hover:rotate-90 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                >✕</button>

                <div class="relative z-10">
                    <div class="text-5xl mb-4 animate-bounce-subtle">🔑</div>
                    <h3 class="text-2xl font-black mb-2 tracking-tight">Recuperar Senha</h3>
                    <p class="text-purple-100 text-xs font-medium leading-relaxed opacity-90">
                        Informe seu e-mail vinculado e enviaremos as instruções para você.
                    </p>
                </div>
            </div>

            <div class="p-8 space-y-6">
                <div class="space-y-2">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">E-mail Cadastrado</label>
                    <div class="relative group">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">📧</span>
                        <input
                            type="email"
                            value="${state.forgotPasswordEmail || ''}"
                            oninput="state.forgotPasswordEmail = this.value;"
                            onkeypress="if(event.key === 'Enter') window.submitForgotPassword();"
                            placeholder="seu@email.com"
                            class="w-full pl-11 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none font-bold text-gray-700 shadow-inner"
                            ${state.loading ? 'disabled' : ''}
                            autofocus
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-3 pt-2">
                    <button
                        onclick="window.submitForgotPassword()"
                        class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                        ${state.loading ? 'disabled' : ''}
                    >
                        ${state.loading ? '...' : 'Enviar Link de Reset ✨'}
                    </button>
                    <button
                        onclick="state.showForgotPasswordModal = false; window.render();"
                        class="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-all text-xs uppercase tracking-widest"
                    >
                        Voltar ao Login
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function renderChangelogModal() {
    if (!state.showChangelogModal || !state.latestChangelog.version) return '';

    const { version, date, content } = state.latestChangelog;

    return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-purple-100">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative">
                <button 
                    onclick="state.showChangelogModal = false; window.render();"
                    class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                    ✕
                </button>
                <div class="text-5xl mb-4">🎁</div>
                <h3 class="text-3xl font-black tracking-tight">Novidades</h3>
                <div class="flex items-center gap-2 mt-2 opacity-90">
                    <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">v${version}</span>
                    <span class="text-xs font-medium">📅 ${formatDate(date)}</span>
                </div>
            </div>

            <div class="p-8 max-h-[60vh] overflow-y-auto bg-gray-50/30">
                <div class="space-y-4">
                    <div class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        ${content.replace(/###\s*(.*)/g, '<br><b class="text-purple-600 uppercase tracking-wider text-[10px]">$1</b>')}
                    </div>
                </div>
            </div>

            <div class="p-6 bg-white border-t border-gray-100">
                <button
                    onclick="state.showChangelogModal = false; window.render();"
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                    Entendido! ✨
                </button>
            </div>
        </div>
    </div>
    `;
}
function renderCalendarPortal() {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const view = state.calendarView || 'days';

    let content = '';

    if (view === 'days') {
        const firstDay = new Date(state.datePickerYear, state.datePickerMonth, 1).getDay();
        const daysInMonth = new Date(state.datePickerYear, state.datePickerMonth + 1, 0).getDate();
        const prevMonthDays = new Date(state.datePickerYear, state.datePickerMonth, 0).getDate();
        const today = new Date();
        const isThisMonth = today.getMonth() === state.datePickerMonth && today.getFullYear() === state.datePickerYear;

        content = `
            <div class="calendar-grid">
                ${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
                ${Array.from({ length: firstDay }).map((_, i) => {
            const day = prevMonthDays - firstDay + i + 1;
            return `<div class="calendar-day other-month">${day}</div>`;
        }).join('')}
                ${Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${state.datePickerYear}-${String(state.datePickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isActive = state.formData.date === dateStr;
            const isToday = isThisMonth && today.getDate() === day;
            return `
                        <div 
                            onclick="event.stopPropagation(); state.formData.date = '${dateStr}'; state.showDatePicker = false; window.render();"
                            class="calendar-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"
                        >
                            ${day}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    } else if (view === 'months') {
        content = `
            <div class="calendar-months-grid">
                ${months.map((m, i) => `
                    <div 
                        onclick="event.stopPropagation(); window.selectCalendarMonth(${i})"
                        class="calendar-month-item ${state.datePickerMonth === i ? 'active' : ''}"
                    >
                        ${m.substring(0, 3)}
                    </div>
                `).join('')}
            </div>
        `;
    } else if (view === 'years') {
        const startYear = state.datePickerYear - 5;
        content = `
            <div class="calendar-years-grid">
                ${Array.from({ length: 12 }).map((_, i) => {
            const y = startYear + i;
            return `
                        <div 
                            onclick="event.stopPropagation(); window.selectCalendarYear(${y})"
                            class="calendar-year-item ${state.datePickerYear === y ? 'active' : ''}"
                        >
                            ${y}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    return `
        <div class="absolute right-0 mt-2 calendar-container shadow-2xl" onclick="event.stopPropagation()">
            <div class="calendar-header">
                <button onclick="event.stopPropagation(); window.changeMonth(-1)" class="calendar-nav-btn" ${view !== 'days' ? 'style="visibility:hidden"' : ''}>‹</button>
                <div class="text-sm font-black text-gray-800 dark:text-gray-100" onclick="window.toggleCalendarView()">
                    ${view === 'years' ? 'Selecionar Ano' : (view === 'months' ? state.datePickerYear : `${months[state.datePickerMonth]} ${state.datePickerYear}`)}
                </div>
                <button onclick="event.stopPropagation(); window.changeMonth(1)" class="calendar-nav-btn" ${view !== 'days' ? 'style="visibility:hidden"' : ''}>›</button>
            </div>
            ${content}
            <div class="mt-4 flex justify-between border-t pt-3">
                <button onclick="event.stopPropagation(); state.formData.date = ''; state.showDatePicker = false; window.render();" class="text-xs font-bold text-gray-400 hover:text-red-500">Limpar</button>
                <button onclick="event.stopPropagation(); state.showDatePicker = false; state.calendarView = 'days'; window.render();" class="text-xs font-bold text-purple-600">Fechar</button>
            </div>
        </div>
    `;
}

window.toggleCalendarView = () => {
    if (!state.calendarView || state.calendarView === 'days') state.calendarView = 'months';
    else if (state.calendarView === 'months') state.calendarView = 'years';
    else state.calendarView = 'days';
    window.render();
};

window.selectCalendarMonth = (m) => {
    state.datePickerMonth = m;
    state.calendarView = 'days';
    window.render();
};

window.selectCalendarYear = (y) => {
    state.datePickerYear = y;
    state.calendarView = 'months';
    window.render();
};

window.changeMonth = (dir) => {
    state.datePickerMonth += dir;
    if (state.datePickerMonth > 11) {
        state.datePickerMonth = 0;
        state.datePickerYear++;
    } else if (state.datePickerMonth < 0) {
        state.datePickerMonth = 11;
        state.datePickerYear--;
    }
    window.render();
};
function renderDropdownPortal(type) {
    let options = [];
    let selectedValue = '';
    let onSelect = (val) => { };

    if (type === 'category') {
        options = categoryOptions;
        selectedValue = state.formData.category;
        onSelect = (val) => {
            const cat = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            state.formData.category = val;
            state.formData.pages = '';
            state.formData.country = val !== 'Livro' ? state.formData.country : '';
            state.formData.status = (cat.includes('seri') || cat.includes('film')) ? 'Quero assistir' : 'Quero ler';
            state.activeDropdown = null;
            window.render();
        };
    } else if (type === 'status') {
        const cat = (state.formData.category || 'Livro').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        options = (cat === 'livro' || cat === 'livros') ? statusOptions['Livro'] :
            (cat.includes('seri')) ? statusOptions['Série'] :
                (cat.includes('film')) ? statusOptions['Filme'] :
                    statusOptions['Livro'];
        selectedValue = state.formData.status;
        onSelect = (val) => {
            state.formData.status = val;
            state.activeDropdown = null;
            window.render();
        };
    } else if (type === 'rating') {
        options = ratingOptions;
        selectedValue = state.formData.rating;
        onSelect = (val) => {
            state.formData.rating = val;
            state.activeDropdown = null;
            window.render();
        };
    } else if (type === 'country' || type === 'filterCountry') {
        const search = (state.countrySearch || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filteredCountries = countryOptions.filter(opt => opt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search));

        if (type === 'filterCountry') {
            options = ['Todos', ...filteredCountries];
            selectedValue = state.countryFilter === 'all' ? 'Todos' : state.countryFilter;
        } else {
            options = filteredCountries;
            selectedValue = state.formData.country;
        }
    } else if (type === 'filterStatus') {
        options = ['Todos', 'Quero ler', 'Lendo', 'Lido', 'Quero assistir', 'Assistindo', 'Assistido', 'Desisti'];
        selectedValue = state.statusFilter === 'all' ? 'Todos' : state.statusFilter;
    } else if (type === 'filterRating') {
        options = ['Todos', ...ratingOptions];
        selectedValue = state.ratingFilter === 'all' ? 'Todos' : state.ratingFilter;
    }

    return `
        <div class="dropdown-portal" onclick="event.stopPropagation()">
            ${(type === 'country' || type === 'filterCountry') ? `
                <div class="dropdown-search-container">
                    <input 
                        type="text" 
                        id="countrySearchInput"
                        class="dropdown-search-input" 
                        placeholder="Pesquisar país..." 
                        value="${state.countrySearch || ''}"
                        oninput="state.countrySearch = this.value; window.render();"
                    />
                </div>
            ` : ''}
            <div class="dropdown-list">
                ${options.length > 0 ? options.map(opt => `
                    <div 
                        onclick="window.selectDropdownOption('${type}', '${opt}')"
                        class="dropdown-option ${selectedValue === opt ? 'active' : ''}"
                    >
                        ${opt}
                    </div>
                `).join('') : '<div class="p-4 text-center text-xs text-gray-400">Nenhum resultado</div>'}
            </div>
        </div>
    `;
}

window.selectDropdownOption = (type, val) => {
    if (type === 'category') {
        const cat = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        state.formData.category = val;
        state.formData.pages = '';
        state.formData.status = (cat.includes('seri') || cat.includes('film')) ? 'Quero assistir' : 'Quero ler';
    } else if (type === 'status') {
        state.formData.status = val;
    } else if (type === 'rating') {
        state.formData.rating = val;
    } else if (type === 'country') {
        state.formData.country = val;
        state.countrySearch = '';
    } else if (type === 'filterCountry') {
        state.countryFilter = val === 'Todos' ? 'all' : val;
        state.countrySearch = '';
        window.resetPagination();
    } else if (type === 'filterStatus') {
        state.statusFilter = val === 'Todos' ? 'all' : val;
        window.resetPagination();
    } else if (type === 'filterRating') {
        state.ratingFilter = val === 'Todos' ? 'all' : val;
        window.resetPagination();
    }
    state.activeDropdown = null;
    window.render();
};
