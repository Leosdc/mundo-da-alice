import { state, render } from './state.js';
import { showNotification, formatDate, toValidDate } from './utils.js';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from './app.js';

export const listeners = {
    items: null,
    users: null
};
export function loadData() {
    if (!state.currentUser) return;

    if (listeners.items) listeners.items();

    state.loading = true;
    render();

    const q = query(
        collection(db, "items"),
        where("userId", "==", state.currentUser.uid)
    );

    listeners.items = onSnapshot(q, (querySnapshot) => {
        state.items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            title: doc.data().title || '',
            author: doc.data().author || '',
            pages: doc.data().pages || '',
            status: doc.data().status || '',
            rating: doc.data().rating || '',
            date: doc.data().date || '',
            category: doc.data().category || 'Livro',
            country: doc.data().country || ''
        }));

        window.resetPagination();
        window.loadMoreItems();
        state.loading = false;
        render();
    }, (error) => {
        console.error('Erro no listener do Firestore:', error);
        showNotification('Erro ao carregar seus dados.', 'error');
        state.loading = false;
        render();
    });
}

export async function handleSubmit() {
    if (!state.currentUser) return;
    if (!state.formData.title) {
        showNotification('O título é obrigatório!', 'error');
        return;
    }

    state.loading = true;
    render();

    const itemData = {
        userId: state.currentUser.uid,
        title: state.formData.title,
        author: state.formData.author,
        pages: state.formData.pages,
        status: state.formData.status,
        rating: state.formData.rating,
        date: state.formData.date ? formatDate(state.formData.date) : '',
        category: state.formData.category,
        country: state.formData.country,
        updatedAt: serverTimestamp()
    };

    try {
        if (state.editingId !== null) {
            const docRef = doc(db, "items", state.editingId);
            await updateDoc(docRef, itemData);
            showNotification('✨ Item atualizado com sucesso!');
        } else {
            itemData.createdAt = serverTimestamp();
            await addDoc(collection(db, "items"), itemData);
            showNotification('✨ Item adicionado com sucesso!');
        }

        window.resetForm(true);
    } catch (error) {
        console.error('Erro ao salvar no Firestore:', error);
        showNotification('Erro ao salvar os dados.', 'error');
        state.loading = false;
        render();
    }
}

export async function handleDelete(id) {
    const confirmed = await window.confirmPretty('Deseja realmente excluir este item?', {
        title: 'Excluir Item',
        confirmText: 'Excluir',
        isDanger: true
    });
    if (confirmed) {
        state.loading = true;
        render();
        try {
            await deleteDoc(doc(db, "items", id));
            showNotification('🗑️ Item excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir do Firestore:', error);
            showNotification('Erro ao excluir o item.', 'error');
            state.loading = false;
            render();
        }
    }
}

// export let usersUnsubscribe = null; // Removed in favor of listeners object
export function fetchAllUsers() {
    if (state.currentUser?.role !== 'admin') return;

    if (listeners.users) listeners.users();

    const q = query(collection(db, "users"), orderBy("username", "asc"));

    listeners.users = onSnapshot(q, (querySnapshot) => {
        state.allUsers = querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
        render();
    }, (error) => {
        console.error("Erro no listener de usuários:", error);
        showNotification("Erro ao carregar lista de usuários.", "error");
    });
}

export async function fetchUserItems(uid) {
    if (state.currentUser?.role !== 'admin') return;

    state.loading = true;
    render();

    try {
        const q = query(collection(db, "items"), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        const userItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        state.items = userItems;
        state.adminTargetUser = state.allUsers.find(u => u.uid === uid);
        state.currentView = 'dashboard';

        window.resetPagination();
        window.loadMoreItems();
    } catch (error) {
        console.error("Erro ao carregar itens do usuário:", error);
        showNotification("Erro ao carregar registros do usuário.", "error");
    }
    state.loading = false;
    render();
}

export async function updateUserPermissions(uid, field, value) {
    if (state.currentUser?.role !== 'admin') return;

    try {
        await updateDoc(doc(db, "users", uid), {
            [field]: value
        });
        showNotification("Permissões atualizadas! ✨");
    } catch (error) {
        console.error("Erro ao atualizar permissões:", error);
        showNotification("Erro ao atualizar permissões. Verifique as regras do Firestore.", "error");
    }
}

export async function sendGlobalNotification(text) {
    if (state.currentUser?.role !== 'admin') return;

    try {
        await addDoc(collection(db, "global_messages"), {
            userId: 'system',
            username: '📢 Notificação do Sistema',
            text: text,
            type: 'notification',
            createdAt: serverTimestamp()
        });
        showNotification("Notificação enviada! 🚀");
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        showNotification("Erro ao enviar notificação.", "error");
    }
}
export async function findLegacyData(searchTerm) {
    if (state.currentUser?.role !== 'admin') return;

    state.loading = true;
    render();

    try {
        let legacyItems = [];
        const qUid = query(collection(db, "items"), where("userId", "==", searchTerm));
        const snapUid = await getDocs(qUid);
        legacyItems = snapUid.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (legacyItems.length === 0) {
            const qTitle = query(collection(db, "items"), where("title", "==", searchTerm));
            const snapTitle = await getDocs(qTitle);
            legacyItems = snapTitle.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        if (legacyItems.length > 0) {
            const foundUid = legacyItems[0].userId;
            state.items = legacyItems;
            state.adminTargetUser = {
                username: `RECUPERADO: ${searchTerm}`,
                uid: foundUid,
                role: 'legacy'
            };
            state.currentView = 'dashboard';
            showNotification(`✨ Encontrados ${legacyItems.length} registros (UID: ${foundUid})!`);
        } else {
            showNotification(`Nenhum registro encontrado para "${searchTerm}".`, "error");
        }
    } catch (error) {
        console.error("Erro na busca legacy:", error);
        showNotification("Erro ao buscar dados legados.", "error");
    }
    state.loading = false;
    render();
}

export async function migrateItems(oldUid, newUid) {
    if (state.currentUser?.role !== 'admin') return;
    if (!oldUid || !newUid) return showNotification("IDs inválidos", "error");

    state.loading = true;
    render();

    try {
        const q = query(collection(db, "items"), where("userId", "==", oldUid));
        const querySnapshot = await getDocs(q);

        const batch = writeBatch(db);
        querySnapshot.docs.forEach(itemDoc => {
            batch.update(doc(db, "items", itemDoc.id), {
                userId: newUid,
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
        showNotification(`✅ ${querySnapshot.size} itens migrados com sucesso!`);

        state.adminTargetUser = null;
    } catch (error) {
        console.error("Erro na migração:", error);
        showNotification("Erro ao migrar itens.", "error");
    }
    state.loading = false;
    render();
}
