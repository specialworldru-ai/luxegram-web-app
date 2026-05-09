const firebaseConfig = {
  apiKey: "AIzaSyCQlUa13e_NKzzUL-PhI4HXETKno2x029Q",
  authDomain: "luxegram-f6e9a.firebaseapp.com",
  databaseURL: "https://luxegram-f6e9a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "luxegram-f6e9a",
  storageBucket: "luxegram-f6e9a.firebasestorage.app",
  messagingSenderId: "64533495549",
  appId: "1:64533495549:web:8f60c9243ca771204b4894",
  measurementId: "G-HXDSC0YVJV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    let activeChatId = 'support';
    const container = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const notifySound = document.getElementById('notifySound');
    const sideMenu = document.getElementById('sideMenu');
    const userProfile = document.getElementById('userProfile');
    let unsubscribe = null;

    function listen() {
        if (unsubscribe) unsubscribe();
        unsubscribe = db.collection('chats').doc(activeChatId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snap => {
                container.innerHTML = '';
                snap.forEach(doc => {
                    const m = doc.data();
                    const html = `<div class="message ${m.type}">${m.text}<span style="font-size:10px; margin-left:10px; opacity:0.6">${m.time}</span></div>`;
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
            text, time, type: 'outgoing', timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        notifySound.currentTime = 0;
        notifySound.play().catch(() => {});
        input.value = "";
    }

    document.querySelectorAll('.chat-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeChatId = item.dataset.id;
            document.getElementById('currentChatName').innerText = item.dataset.name;
            listen();
        };
    });

    sendBtn.onclick = send;
    input.onkeypress = (e) => { if (e.key === 'Enter') send(); };

    // ЛОГИКА МЕНЮ
    document.getElementById('openMenuBtn').onclick = (e) => { e.stopPropagation(); sideMenu.classList.add('open'); };
    document.getElementById('openProfileTrigger').onclick = () => {
        userProfile.classList.remove('hidden');
        sideMenu.classList.remove('open');
    };
    document.getElementById('closeProfile').onclick = () => userProfile.classList.add('hidden');
    document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark-theme');

    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target)) sideMenu.classList.remove('open');
    });

    listen();
});