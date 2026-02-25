import { state, render } from './state.js';
import { showNotification } from './utils.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateEmail,
    verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { auth, db } from './app.js';
import { listeners } from './database.js';

export async function handleLogin() {
    if (!state.loginData.username || !state.loginData.password) {
        showNotification('Preencha e-mail e senha!', 'error');
        return;
    }

    state.loading = true;
    render();

    try {
        const email = state.loginData.username.trim();

        if (!email || !email.includes('@')) {
            showNotification('Digite um e-mail válido!', 'error');
            state.loading = false;
            render();
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, state.loginData.password);
        const user = userCredential.user;

        state.currentUser = {
            username: user.email.split('@')[0],
            uid: user.uid
        };

        await setDoc(doc(db, "users", user.uid), {
            lastActive: serverTimestamp()
        }, { merge: true });

        showNotification('✨ Login realizado com sucesso!');
        window.loadData();
    } catch (error) {
        console.error('Erro no login Firebase:', error);
        let msg = 'Erro ao fazer login.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msg = 'Usuário ou senha incorretos!';
        } else if (error.code === 'auth/invalid-email') {
            msg = 'E-mail inválido!';
        }
        showNotification(msg, 'error');
        state.loading = false;
        render();
    }
}

export async function handleRegister() {
    if (!state.loginData.username || !state.loginData.password) {
        showNotification('Preencha usuário e senha!', 'error');
        return;
    }

    if (state.loginData.password.length < 6) {
        showNotification('A senha deve ter no mínimo 6 caracteres para o Firebase!', 'error');
        return;
    }

    state.loading = true;
    render();

    try {
        const email = state.loginData.username.trim();

        if (!email || !email.includes('@')) {
            showNotification('Digite um e-mail válido para o melhor funcionamento do app!', 'error');
            state.loading = false;
            render();
            return;
        }

        const username = email.split('@')[0];

        const userCredential = await createUserWithEmailAndPassword(auth, email, state.loginData.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username,
            role: 'user',
            email: email,
            phoneNumber: state.phoneNumber || '',
            showWhatsApp: false,
            canUseAIChat: false,
            canUseCuriosities: false,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
        });

        state.currentUser = {
            uid: user.uid,
            username: username,
            role: 'user'
        };

        showNotification('✨ Cadastro realizado com sucesso!');
        window.loadData();
    } catch (error) {
        console.error('Erro no cadastro Firebase:', error);
        let msg = 'Erro ao cadastrar.';
        if (error.code === 'auth/email-already-in-use') {
            msg = 'Este usuário/e-mail já está em uso!';
        } else if (error.code === 'auth/weak-password') {
            msg = 'A senha é muito fraca!';
        }
        showNotification(msg, 'error');
        state.loading = false;
        render();
    }
}

export async function handleLogout() {
    try {
        if (listeners.items) listeners.items();
        if (listeners.users) listeners.users();
        listeners.items = null;
        listeners.users = null;

        await signOut(auth);
        state.currentUser = null;
        state.items = [];
        state.loginData = { username: '', password: '' };
        state.chatOpen = false;
        state.chatMessages = [
            { role: 'assistant', content: 'Olá! Sou a Alice. Posso te ajudar a registrar um livro, série ou filme. O que vamos registrar hoje?' }
        ];
        showNotification('Você saiu da conta!');
        render();
    } catch (error) {
        console.error('Erro ao sair:', error);
        showNotification('Erro ao sair da conta.', 'error');
    }
}

export async function fetchProfile(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            state.currentUser = {
                ...state.currentUser,
                username: data.username || state.currentUser.username,
                phoneNumber: data.phoneNumber || '',
                showWhatsApp: data.showWhatsApp || false,
                role: data.role || 'user',
                hasLinkedEmail: data.hasLinkedEmail || false
            };

            state.userPermissions = {
                canUseAIChat: data.role === 'admin' || data.canUseAIChat === true,
                canUseCuriosities: data.role === 'admin' || data.canUseCuriosities === true
            };

            if (data.role === 'admin') {
                state.currentUser.role = 'admin';
            }

            const user = auth.currentUser;
            if (user && user.email.endsWith('@mundoalice.com') && !data.hasLinkedEmail) {
                state.needsEmailLinking = true;
            }

            render();
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}

export function handleForgotPassword() {
    state.forgotPasswordEmail = '';
    state.showForgotPasswordModal = true;
    render();
}

export async function submitForgotPassword() {
    const email = state.forgotPasswordEmail.trim();
    if (!email) {
        showNotification('Digite seu e-mail!', 'error');
        return;
    }

    state.loading = true;
    render();

    try {
        await sendPasswordResetEmail(auth, email);
        showNotification('✨ Link de recuperação enviado para seu e-mail!');
        state.showForgotPasswordModal = false;
    } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        let msg = 'Erro ao enviar e-mail.';
        if (error.code === 'auth/user-not-found') {
            msg = 'E-mail não encontrado!';
        } else if (error.code === 'auth/invalid-email') {
            msg = 'E-mail inválido!';
        }
        showNotification(msg, 'error');
    }
    state.loading = false;
    render();
}

export async function handleEmailLinking() {
    if (!state.currentUser) return;
    const input = document.getElementById('linking-email-input');
    const newEmail = input ? input.value.trim() : null;

    if (!newEmail || !newEmail.includes('@')) {
        showNotification("E-mail inválido!", "error");
        return;
    }

    state.loading = true;
    render();

    try {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

        await setDoc(doc(db, "users", state.currentUser.uid), {
            requestedEmail: newEmail,
            hasLinkedEmail: true
        }, { merge: true });

        state.needsEmailLinking = false;
        showNotification("✨ Link de verificação enviado! Verifique seu novo e-mail para concluir.");
    } catch (error) {
        console.error("Erro ao vincular e-mail:", error);
        let msg = "Erro ao vincular e-mail.";
        if (error.code === 'auth/requires-recent-login') {
            msg = "Por segurança, você precisa fazer login novamente (Sair e Entrar) para vincular o e-mail.";
        }
        showNotification(msg, "error");
    }
    state.loading = false;
    render();
}

export function checkSavedLogin() {
    onAuthStateChanged(auth, async (user) => {
        state.isAuthInitialized = true;
        if (user) {
            state.currentUser = {
                username: user.email.split('@')[0],
                uid: user.uid
            };

            try {
                await setDoc(doc(db, "users", user.uid), {
                    lastActive: serverTimestamp()
                }, { merge: true });
            } catch (e) {
                console.error("Erro ao garantir documento do usuário:", e);
            }

            fetchProfile(user.uid);
            window.loadData();
        } else {
            state.currentUser = null;
            render();
        }
    });
}
