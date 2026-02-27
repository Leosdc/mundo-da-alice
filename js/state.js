import { bookQuotes } from './constants.js';

export const state = {
    currentQuote: bookQuotes[Math.floor(Math.random() * bookQuotes.length)],
    theme: localStorage.getItem('theme') || 'light',
    isSplashActive: true,
    isAuthInitialized: false,
    currentView: 'dashboard',
    currentUser: null,
    isLoginMode: true,
    items: [],
    displayedItems: [],
    itemsPerPage: 10,
    currentPage: 1,
    showForm: false,
    shouldScrollToForm: false,
    activeDropdown: null, // 'category', 'status', 'rating', 'country'
    countrySearch: '',
    countryFilter: 'all',
    statusFilter: 'all',
    ratingFilter: 'all',
    filter: 'all',
    searchTerm: '',
    searchInput: '',
    editingId: null,
    showCharts: false,
    chartPeriod: 'monthly',
    chartType: 'all',
    loading: false,
    isLoadingMore: false,
    sortBy: 'date-desc',
    showSortMenu: false,
    showSortMenuMobile: false,
    loginData: {
        username: '',
        password: ''
    },
    chatOpen: false,
    chatMessages: [
        { role: 'assistant', content: 'Olá! Sou a Alice. Posso te ajudar a registrar um livro, série ou filme. O que vamos registrar hoje?' }
    ],
    isChatLoading: false,
    showInsight: false,
    insightMessage: '',
    isGeneratingInsight: false,
    formData: {
        title: '',
        author: '',
        pages: '',
        status: 'Quero ler',
        rating: '',
        date: '',
        category: 'Livro',
        country: ''
    },
    showRecapModal: false,
    recapYear: new Date().getFullYear(),
    showProfileModal: false,
    tempProfileData: {
        phoneNumber: '',
        showWhatsApp: false
    },
    activeUsers: [],
    globalMessages: [],
    isGlobalChatLoading: false,
    phoneNumber: '',

    allUsers: [],
    adminTargetUser: null,
    needsEmailLinking: false,
    userPermissions: {
        canUseAIChat: true,
        canUseCuriosities: true
    },
    showForgotPasswordModal: false,
    forgotPasswordEmail: '',
    showChangelogModal: false,
    latestChangelog: {
        version: '',
        date: '',
        content: ''
    },
    // Custom DatePicker State
    showDatePicker: false,
    datePickerMonth: new Date().getMonth(),
    datePickerYear: new Date().getFullYear(),
    calendarView: 'days', // 'days', 'months', 'years'
    confirmModal: {
        show: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isDanger: false,
        resolve: null
    }
};

let renderer = null;

export function setRenderer(fn) {
    renderer = fn;
}

export function render() {
    if (renderer) renderer();
}

export function updateState(newState) {
    Object.assign(state, newState);
    render();
}
