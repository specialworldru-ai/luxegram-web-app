const firebaseConfig = {
  apiKey: "AIzaSyAs-ТВОЙ_КЛЮЧ", 
  authDomain: "luxeffa.firebaseapp.com",
  databaseURL: "https://luxeffa-default-rtdb.firebaseio.com",
  projectId: "luxeffa",
  storageBucket: "luxeffa.appspot.com",
  messagingSenderId: "772413625432",
  appId: "1:772413625432:web:77905396557879654"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = {
    nick: localStorage.getItem('luxe_nick') || "",
    user: localStorage.getItem('luxe_user') || ""
};

let activeChat = "";

window.onload = () => {
    if (currentUser.user) {
        document.getElementById('auth-screen').style.display = 'none';
        updateMyProfileUI();
        renderChatList();
    }
};

function register() {
    let nick = document.getElementById('reg-nickname').value.trim();
    let user = document.getElementById('reg-username').value.trim().toLowerCase().replace('@','');
    if(nick && user) {
        localStorage.setItem('luxe_nick', nick);
        localStorage.setItem('luxe_user', user);
        location.reload();
    }
}

function renderChatList() {
    const list = document.getElementById('chat-list');
    list.innerHTML = "";
    // Твои стандартные каналы и контакты
    const apps = ["Заметки", "LuxeNews", "CryptoWorld"]; 
    const contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser.user) || "[]");
    const all = [...apps, ...contacts];

    all.forEach(name => {
        const isActive = activeChat === name ? 'active' : '';
        list.innerHTML += `
            <div class="chat-item ${isActive}" onclick="openChat('${name}')">
                <img class="c-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <div class="c-info">
                    <div class="c-name">${name}</div>
                    <div class="c-last-msg" id="last-${name}">Нажмите, чтобы открыть чат</div>
                </div>
            </div>
        `;
    });
}

function openChat(name) {
    activeChat = name;
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('active-chat-window').style.display = 'flex';
    document.getElementById('chat-title').innerText = name;
    document.getElementById('header-avatar').style.backgroundImage = `url(https://api.dicebear.com/7.x/bottts/svg?seed=${name})`;
    document.getElementById('header-avatar').style.backgroundSize = 'cover';

    renderChatList(); // Обновляем выделение

    const isChannel = (name === "LuxeNews" || name === "CryptoWorld");
    let key = isChannel ? "channel_" + name : (name === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, name].sort().join('_'));
    
    listenToMessages(key);
}

function listenToMessages(key) {
    db.ref('chats/' + key).on('value', (snap) => {
        const div = document.getElementById('messages');
        div.innerHTML = "";
        snap.forEach(child => {
            const m = child.val();
            const isOwn = m.from === currentUser.user;
            div.innerHTML += `
                <div class="msg-bubble ${isOwn ? 'own' : 'other'}">
                    <div class="text">${m.text}</div>
                    <div class="msg-time">${m.time}</div>
                </div>
            `;
        });
        div.scrollTop = div.scrollHeight;
    });
}

function send() {
    const inp = document.getElementById('msgInput');
    if (!inp.value.trim() || !activeChat) return;

    let key = (activeChat === 'LuxeNews' || activeChat === 'CryptoWorld') ? "channel_" + activeChat : (activeChat === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, activeChat].sort().join('_'));
    
    db.ref('chats/' + key).push({
        from: currentUser.user,
        text: inp.value,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString()
    });
    inp.value = "";
}

function toggleSidebar() {
    document.getElementById('main-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function updateMyProfileUI() {
    document.getElementById('my-nick').innerText = currentUser.nick;
    document.getElementById('my-user').innerText = "@" + currentUser.user;
    document.getElementById('my-avatar').style.backgroundImage = `url(https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.user})`;
    document.getElementById('my-avatar').style.backgroundSize = 'cover';
}

function toggleTheme() { document.body.classList.toggle('light-mode'); }