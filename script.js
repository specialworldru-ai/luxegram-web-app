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

let activeChat = "";
let currentFolder = "all";
let pinnedChats = JSON.parse(localStorage.getItem('pins') || "[]");
let archivedChats = JSON.parse(localStorage.getItem('archive') || "[]");

window.onload = () => {
    if (currentUser.user) {
        document.getElementById('auth-screen').style.display = 'none';
        updateUI();
        renderContacts();
    }
};

function register() {
    let nick = document.getElementById('reg-nickname').value.trim();
    let user = document.getElementById('reg-username').value.trim().toLowerCase().replace('@', '');
    if (nick && user) {
        localStorage.setItem('luxe_nick', nick);
        localStorage.setItem('luxe_user', user);
        location.reload();
    }
}

function renderContacts() {
    let list = document.getElementById('chat-list');
    list.innerHTML = "";
    // Добавляем твои стандартные чаты/каналы
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser.user) || "[]");
    let all = ["Заметки", "LuxeNews", "CryptoWorld", ...contacts];

    let filtered = all.filter(name => {
        if (currentFolder === 'archive') return archivedChats.includes(name);
        return !archivedChats.includes(name);
    });

    filtered.sort((a, b) => (pinnedChats.includes(b) ? 1 : 0) - (pinnedChats.includes(a) ? 1 : 0));

    filtered.forEach(name => {
        const isPinned = pinnedChats.includes(name);
        list.innerHTML += `
            <div class="chat-item" onclick="selectChat('${name}')" oncontextmenu="showChatMenu(event, '${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <div class="chat-name">${name} ${isPinned ? '📌' : ''}</div>
            </div>`;
    });
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = name;
    document.getElementById('inputPanel').style.display = 'flex';
    
    // Режим канала (все слева)
    const isChannel = (name === "LuxeNews" || name === "CryptoWorld");
    document.querySelector('.chat-window').classList.toggle('channel-mode', isChannel);

    let key = isChannel ? "channel_" + name : (name === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, name].sort().join('_'));
    listenMessages(key);
}

function listenMessages(key) {
    db.ref('chats/' + key).on('value', (snap) => {
        let div = document.getElementById('messages');
        div.innerHTML = "";
        snap.forEach(child => {
            let m = child.val();
            let isOwn = m.from === currentUser.user;
            div.innerHTML += `
                <div class="msg ${isOwn ? 'own' : 'others'}">
                    <div class="msg-content">${m.text}</div>
                    <div class="msg-info">
                        <span>${m.date || ''} ${m.time}</span>
                    </div>
                </div>`;
        });
        div.scrollTop = div.scrollHeight;
    });
}

function send() {
    let inp = document.getElementById('msgInput');
    if (!inp.value.trim()) return;
    let key = (activeChat === 'LuxeNews' || activeChat === 'CryptoWorld') ? "channel_" + activeChat : (activeChat === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, activeChat].sort().join('_'));
    db.ref('chats/' + key).push({
        from: currentUser.user,
        text: inp.value,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString(),
        read: false
    });
    inp.value = "";
}

function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
    document.getElementById('menu-overlay').classList.toggle('active');
}

function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }
function showUserProfile(name) { 
    if(!name || name === "Выберите чат") return;
    document.getElementById('user-profile-panel').classList.add('active'); 
    document.getElementById('profile-img').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
    document.getElementById('profile-nick').innerText = name;
    document.getElementById('profile-user').innerText = "@" + name.toLowerCase();
}
function closeRightPanel() { document.getElementById('user-profile-panel').classList.remove('active'); }
function updateUI() {
    document.getElementById('menu-nick').innerText = currentUser.nick;
    document.getElementById('menu-user').innerText = "@" + currentUser.user;
    document.getElementById('menu-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.user}`;
}
function showFolder(f) { currentFolder = f; renderContacts(); }
function toggleTheme() { document.body.classList.toggle('light-mode'); }

// Контекстное меню
function showChatMenu(e, name) {
    e.preventDefault();
    activeChat = name;
    let menu = document.getElementById('chat-context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
}
window.onclick = () => { document.getElementById('chat-context-menu').style.display = 'none'; };