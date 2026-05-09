// Твой Firebase Config для luxeffa
const firebaseConfig = {
  apiKey: "AIzaSyAs-ТВОЙ_КЛЮЧ", 
  authDomain: "luxeffa.firebaseapp.com",
  databaseURL: "https://luxeffa-default-rtdb.firebaseio.com",
  projectId: "luxeffa",
  storageBucket: "luxeffa.appspot.com",
  messagingSenderId: "772413625432",
  appId: "1:772413625432:web:77905396557879654"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = {
    nick: localStorage.getItem('luxe_nick') || "",
    user: localStorage.getItem('luxe_user') || ""
};

window.onload = () => {
    if (currentUser.user) {
        document.getElementById('auth-screen').style.display = 'none';
        renderChatList();
        updateProfileUI();
    }
};

function renderChatList() {
    const list = document.getElementById('chat-list');
    list.innerHTML = "";
    // Твои проекты и чаты
    const all = ["Заметки", "LuxeNews", "CryptoWorld"]; 
    
    all.forEach(name => {
        list.innerHTML += `
            <div class="chat-item" onclick="openChat('${name}')">
                <img class="c-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <div class="c-info">
                    <div class="c-name">${name}</div>
                    <div style="font-size:12px; color:gray;">Нажмите, чтобы открыть</div>
                </div>
            </div>`;
    });
}

function openChat(name) {
    activeChat = name;
    document.getElementById('active-chat-window').style.display = 'flex';
    document.getElementById('chat-title').innerText = name;
    
    let key = (name === "LuxeNews" || name === "CryptoWorld") ? "channel_" + name : (name === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, name].sort().join('_'));
    
    db.ref('chats/' + key).on('value', (snap) => {
        const div = document.getElementById('messages');
        div.innerHTML = "";
        snap.forEach(child => {
            const m = child.val();
            const isOwn = m.from === currentUser.user;
            div.innerHTML += `<div class="msg-bubble ${isOwn ? 'own' : 'other'}">${m.text}</div>`;
        });
        div.scrollTop = div.scrollHeight;
    });
}

function toggleSidebar() {
    document.getElementById('main-sidebar').classList.toggle('active');
}