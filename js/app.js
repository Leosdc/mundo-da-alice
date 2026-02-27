import { state, setRenderer, render } from './state.js';
import { renderApp } from './ui.js';
import { handleLogin, handleRegister, handleLogout, checkSavedLogin, handleForgotPassword, handleEmailLinking, submitForgotPassword } from './auth.js';
import { loadData, handleSubmit, handleDelete, fetchAllUsers, fetchUserItems, updateUserPermissions, sendGlobalNotification, findLegacyData, migrateItems } from './database.js';
import { handleChatSubmit, handleSuggestionRequest, generateInsight } from './ai.js';
import { toValidDate, showNotification, compareDates, formatDate, maskPhone } from './utils.js';
import { firebaseConfig } from './constants.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp,
    Timestamp,
    where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

setRenderer(renderApp);

window.state = state;
window.render = render;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.handleForgotPassword = handleForgotPassword;
window.handleEmailLinking = handleEmailLinking;
window.submitForgotPassword = submitForgotPassword;

window.loadData = loadData;
window.handleSubmit = handleSubmit;
window.handleDelete = handleDelete;
window.fetchAllUsers = fetchAllUsers;
window.fetchUserItems = fetchUserItems;
window.updateUserPermissions = updateUserPermissions;
window.sendGlobalNotification = sendGlobalNotification;
window.findLegacyData = findLegacyData;
window.migrateItems = migrateItems;

window.toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    render();
};

document.documentElement.classList.toggle('dark', state.theme === 'dark');

window.handleChatSubmit = handleChatSubmit;
window.handleSuggestionRequest = handleSuggestionRequest;
window.generateInsight = generateInsight;
window.toValidDate = toValidDate;
window.formatDate = formatDate;
window.maskPhone = maskPhone;

window.fetchLatestChangelog = async () => {
    try {
        const response = await fetch('changelog.md');
        if (!response.ok) return;
        const text = await response.text();

        // Regex para o changelog
        const match = text.match(/## \[([\d.]+)\] - ([\d-]+)\n([\s\S]*?)(?=\n##|$)/);

        if (match) {
            state.latestChangelog = {
                version: match[1],
                date: match[2],
                content: match[3].trim()
            };
            render();
        }
    } catch (error) {
        console.error("Erro ao carregar changelog:", error);
    }
};

let unsubUsers = null;
let unsubMessages = null;

window.switchView = (view) => {
    state.currentView = view;
    if (view === 'social') {
        window.setupSocialListeners();
        setTimeout(window.scrollGlobalChat, 200);
    } else if (view === 'admin') {
        if (!state.allUsers || state.allUsers.length === 0) {
            window.fetchAllUsers();
        }
    }
    render();
};

window.setupSocialListeners = () => {
    if (unsubUsers) return;

    // Usuários ativos nos últimos 15 min
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const usersQ = query(
        collection(db, "users"),
        where("lastActive", ">=", Timestamp.fromDate(fifteenMinsAgo)),
        limit(50)
    );

    unsubUsers = onSnapshot(usersQ, (snapshot) => {
        state.activeUsers = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
        if (state.currentView === 'social') render();
    }, (error) => {
        console.error("Erro no listener de usuários:", error);
    });

    const messagesQ = query(
        collection(db, "global_messages"),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    unsubMessages = onSnapshot(messagesQ, (snapshot) => {
        state.globalMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        if (state.currentView === 'social') {
            render();
            setTimeout(window.scrollGlobalChat, 100);
        }
    }, (error) => {
        console.error("Erro no listener de mensagens:", error);
    });
};

window.sendGlobalMessage = async () => {
    const input = document.getElementById('global-chat-input');
    const text = input.value.trim();
    if (!text || !state.currentUser) return;

    input.value = '';
    try {
        await addDoc(collection(db, "global_messages"), {
            userId: state.currentUser.uid,
            username: state.currentUser.username,
            text: text,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        showNotification("Erro ao enviar mensagem.", "error");
    }
};

window.scrollGlobalChat = () => {
    const container = document.getElementById('global-chat-container');
    if (container) container.scrollTop = container.scrollHeight;
};

window.handleProfileEdit = () => {
    state.tempProfileData = {
        phoneNumber: state.currentUser.phoneNumber || '',
        showWhatsApp: !!state.currentUser.showWhatsApp
    };
    state.showProfileModal = true;
    render();
};

window.saveProfile = async () => {
    if (!state.currentUser) return;

    state.loading = true;
    render();

    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js");
        await setDoc(doc(db, "users", state.currentUser.uid), {
            phoneNumber: state.tempProfileData.phoneNumber,
            showWhatsApp: !!state.tempProfileData.showWhatsApp
        }, { merge: true });

        state.currentUser.phoneNumber = state.tempProfileData.phoneNumber;
        state.currentUser.showWhatsApp = !!state.tempProfileData.showWhatsApp;
        state.showProfileModal = false;
        showNotification("Perfil atualizado! ✨");
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        showNotification("Erro ao salvar perfil.", "error");
    }
    state.loading = false;
    render();
};

window.performSearch = () => {
    state.searchTerm = state.searchInput;
    window.resetPagination();
    render();
};

window.loadMoreItems = () => {
    const filtered = window.getFilteredItems();
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    state.displayedItems = filtered.slice(0, end);

    if (end < filtered.length) {
        state.currentPage++;
    }
};

window.resetPagination = () => {
    state.currentPage = 1;
    state.displayedItems = [];
};

// Efeito dinâmico na scrollbar
window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    // Varia entre tons de roxo (HSL: 270-300)
    const hue = 270 + (scrollPercent * 0.3); // 270 a 300
    document.documentElement.style.setProperty('--scrollbar-color', `hsl(${hue}, 70%, 50%)`);
});

let infiniteObserver = null;
window.setupInfiniteScroll = () => {
    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (!sentinel) return;

    if (infiniteObserver) {
        infiniteObserver.disconnect();
    }

    infiniteObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !state.isLoadingMore) {
            const filteredItems = window.getFilteredItems();
            const hasMore = state.displayedItems.length < filteredItems.length;

            if (hasMore) {
                state.isLoadingMore = true;
                setTimeout(() => {
                    window.loadMoreItems();
                    state.isLoadingMore = false;
                    window.render();
                }, 100); // Pequeno delay para scroll suave
            }
        }
    }, { rootMargin: '200px' });

    infiniteObserver.observe(sentinel);
};

window.handleEdit = (id) => {
    const item = state.items.find(i => i.id === id);
    if (item) {
        state.formData = { ...item };
        state.editingId = id;
        state.showForm = true;
        state.shouldScrollToForm = true;
        window.render();
    }
};

window.resetForm = async (force = false) => {
    const hasData = state.formData.title ||
        state.formData.author ||
        state.formData.pages ||
        state.formData.rating ||
        state.formData.country ||
        (state.formData.date && state.formData.date !== '');

    if (!force && hasData) {
        const confirmed = await window.confirmPretty('Você tem alterações não salvas. Deseja realmente descartá-las?', {
            title: 'Descartar alterações?',
            confirmText: 'Descartar',
            isDanger: true
        });
        if (!confirmed) return;
    }

    state.formData = {
        title: '',
        author: '',
        pages: '',
        status: 'Quero ler/assistir',
        rating: '',
        date: '',
        category: 'Livro',
        country: ''
    };
    state.showForm = false;
    state.editingId = null;
};

window.getFilteredItems = () => {
    let filtered = state.items.filter(item => {
        const cat = item.category;
        const matchesFilter = state.filter === 'all' ||
            (state.filter === 'books' && cat === 'Livro') ||
            (state.filter === 'series' && (cat === 'Série' || cat === 'Serie')) ||
            (state.filter === 'movies' && (cat === 'Filme' || cat === 'Filmes'));

        const matchesCountry = state.countryFilter === 'all' || item.country === state.countryFilter;
        const matchesStatus = state.statusFilter === 'all' || item.status === state.statusFilter;
        const matchesRating = state.ratingFilter === 'all' || item.rating === state.ratingFilter;

        const matchesSearch = item.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            (item.author && item.author.toLowerCase().includes(state.searchTerm.toLowerCase()));

        return matchesFilter && matchesCountry && matchesStatus && matchesRating && matchesSearch;
    });

    filtered.sort((a, b) => {
        switch (state.sortBy) {
            case 'title-asc': return a.title.localeCompare(b.title);
            case 'title-desc': return b.title.localeCompare(a.title);
            case 'date-asc': return compareDates(a.date, b.date);
            case 'date-desc': return compareDates(b.date, a.date);
            case 'category': return a.category.localeCompare(b.category);
            case 'status': {
                const order = ['Quero ler/assistir', 'Lido', 'Assistido', 'Desisti'];
                return order.indexOf(a.status) - order.indexOf(b.status);
            }
            case 'rating': {
                const order = ['Maravilhoso 😍', 'Muito bom 😊', 'Bom 🙂', 'Mais ou menos 🤨', 'Ruim 🙁', 'Péssimo 😒'];
                const aIdx = a.rating ? order.indexOf(a.rating) : 999;
                const bIdx = b.rating ? order.indexOf(b.rating) : 999;
                return aIdx - bIdx;
            }
            default: return 0;
        }
    });

    return filtered;
};

window.getStats = () => {
    return {
        total: state.items.length,
        books: state.items.filter(i => i.category === 'Livro').length,
        series: state.items.filter(i => i.category === 'Série' || i.category === 'Serie').length,
        movies: state.items.filter(i => i.category === 'Filme' || i.category === 'Filmes').length,
        completed: state.items.filter(i => i.status === 'Lido' || i.status === 'Assistido').length
    };
};

window.getChartData = () => {
    const filteredItems = state.items.filter(item => {
        if (state.chartType === 'books') return item.category === 'Livro';
        if (state.chartType === 'series') return item.category === 'Série' || item.category === 'Serie';
        if (state.chartType === 'movies') return item.category === 'Filme' || item.category === 'Filmes';
        return true;
    }).filter(item => item.status === 'Lido' || item.status === 'Assistido');

    const dataMap = {};
    filteredItems.forEach(item => {
        const dateObj = toValidDate(item.date);
        if (!dateObj) return;

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        let key;
        if (state.chartPeriod === 'monthly') key = `${month}/${year}`;
        else key = year.toString();

        dataMap[key] = (dataMap[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(dataMap).sort((a, b) => {
        const parseKey = (str) => {
            const parts = str.split('/');
            if (state.chartPeriod === 'monthly') return new Date(parts[1], parts[0] - 1, 1);
            return new Date(parts[0], 0, 1);
        };
        return parseKey(a) - parseKey(b);
    });

    return sortedKeys.map(key => ({ label: key, value: dataMap[key] }));
};

window.handleRecap = () => {
    state.showRecapModal = true;
    state.recapYear = new Date().getFullYear();
    render();
};

window.getRecapData = () => {
    const yearItems = state.items.filter(i => {
        if (!i.date) return false;
        const d = toValidDate(i.date);
        return d && d.getFullYear() === state.recapYear;
    });

    const completedItems = yearItems.filter(i => i.status === 'Lido' || i.status === 'Assistido');
    const ratings = completedItems.map(i => i.rating).filter(r => r);
    const ratingCounts = {};
    ratings.forEach(r => ratingCounts[r] = (ratingCounts[r] || 0) + 1);
    const mostUsedRating = Object.entries(ratingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhuma ainda';

    const categoryCounts = {};
    completedItems.forEach(i => categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1);
    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhuma ainda';

    const books = yearItems.filter(i => i.category === 'Livro');
    const series = yearItems.filter(i => i.category === 'Série' || i.category === 'Serie');
    const movies = yearItems.filter(i => i.category === 'Filme');

    const completedBooks = books.filter(i => i.status === 'Lido');
    const completedSeries = series.filter(i => i.status === 'Assistido');

    const totalPages = completedBooks.reduce((sum, i) => sum + (parseInt(i.pages) || 0), 0);
    const totalEpisodes = completedSeries.reduce((sum, i) => sum + (parseInt(i.pages) || 0), 0);

    return {
        total: yearItems.length,
        booksCount: books.length,
        seriesCount: series.length,
        moviesCount: movies.length,
        completedBooksCount: completedBooks.length,
        completedSeriesCount: completedSeries.length,
        completedMoviesCount: movies.filter(i => i.status === 'Assistido').length,
        completedItemsCount: completedItems.length,
        totalPages,
        totalEpisodes,
        mostUsedRating,
        favoriteCategory
    };
};

window.scrollChat = () => {
    const container = document.getElementById('chat-container');
    if (container) container.scrollTop = container.scrollHeight;
};

function initSplashScreen() {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.remove(); // Remove do DOM físicamente
                state.isSplashActive = false;
                render();
            }, 800);
        }
    }, 2000); // Reduzi um pouco o tempo para ser mais ágil
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .catch(err => console.error('SW Error:', err));
        });
    }
}


// Atualiza presença a cada 5 minutos
async function updatePresence() {
    if (state.currentUser && db) {
        try {
            const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js");
            await setDoc(doc(db, "users", state.currentUser.uid), {
                username: state.currentUser.username,
                lastActive: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Erro ao atualizar presença:", e);
        }
    }
}

setTimeout(updatePresence, 3000);
setInterval(updatePresence, 5 * 60 * 1000);

initSplashScreen();
checkSavedLogin();
registerServiceWorker();
window.fetchLatestChangelog();

render();

// Fechar dropdowns ao clicar fora
document.addEventListener('click', (e) => {
    if (state.activeDropdown || state.showDatePicker) {
        if (!e.target.closest('.dropdown-portal') &&
            !e.target.closest('.calendar-container') &&
            !e.target.closest('#date-display-field') &&
            !e.target.closest('.relative')) {
            state.activeDropdown = null;
            state.showDatePicker = false;
            state.calendarView = 'days';
            window.render();
        }
    }
});
