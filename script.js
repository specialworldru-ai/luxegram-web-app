const firebaseConfig = {
  apiKey: "AIzaSyCQlUa13e_NKzzUL-PhI4HXETKno2x029Q",
  authDomain: "luxegram-f6e9a.firebaseapp.com",
  projectId: "luxegram-f6e9a",
  storageBucket: "luxegram-f6e9a.firebasestorage.app",
  messagingSenderId: "64533495549",
  appId: "1:64533495549:web:8f60c9243ca771204b4894"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const MY_USERNAME = "LuxeGram User";

document.addEventListener('DOMContentLoaded', () => {
    let activeChatId = 'support';
    const container = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sideMenu = document.getElementById('sideMenu');
    let unsubscribe = null;

    function listen() {
        if (unsubscribe) unsubscribe();
        unsubscribe = db.collection('chats').doc(activeChatId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snap => {
                container.innerHTML = '';
                snap.forEach(doc => {
                    const m = doc.data();
                    const isOut = m.sender === MY_USERNAME;
                    const html = `
                        <div class="message ${isOut ? 'outgoing' : ''}">
                            <span class="msg-user">${m.sender}</span>
                            <span>${m.text}</span>
                            <span class="msg-time">${m.time || ''}</span>
                        </div>`;
                    container.insertAdjacentHTML('beforeend', html);
                });
                container.scrollTop = container.scrollHeight;
            });
    }

    async function send() {
        const text = input.value.trim();
        if (!text) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        await db.collection('chats').doc(activeChatId).collection('messages').add({
            text, time, sender: MY_USERNAME, timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = "";
    }

    // Обработчики кликов
    document.getElementById('sendBtn').onclick = send;
    input.onkeypress = (e) => { if (e.key === 'Enter') send(); };
    
    document.getElementById('openMenuBtn').onclick = (e) => {
        e.stopPropagation();
        sideMenu.classList.toggle('open');
    };

    document.querySelectorAll('.chat-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeChatId = item.dataset.id;
            document.getElementById('currentChatName').innerText = item.dataset.name;
            listen();
        };
    });

    document.addEventListener('click', () => sideMenu.classList.remove('open'));
    
    listen();
});