// Твой конфиг, который мы использовали для проекта luxeffa
const firebaseConfig = {
  apiKey: "AIzaSyAs-ТВОЙ_КЛЮЧ", // Я скрыл символы для безопасности, 
  authDomain: "luxeffa.firebaseapp.com", // но в коде используй свой полный ключ
  databaseURL: "https://luxeffa-default-rtdb.firebaseio.com",
  projectId: "luxeffa",
  storageBucket: "luxeffa.appspot.com",
  messagingSenderId: "772413625432",
  appId: "1:772413625432:web:77905396557879654"
};

// Инициализация
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
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

// Регистрация с поддержкой Ника и Юзернейма
function register() {
    let nick = document.getElementById('reg-nickname').value.trim();
    let user = document.getElementById('reg-username').value.trim().toLowerCase().replace('@', '');
    if (nick && user) {
        localStorage.setItem('luxe_nick', nick);
        localStorage.setItem('luxe_user', user);
        location.reload();
    }
}

// Рендер контактов с учетом закрепов и архива
function renderContacts() {
    let list = document.getElementById('chat-list');
    list.innerHTML = "";
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser.user) || "[]");
    let all = ["Заметки", "LuxeNews", "CryptoWorld", ...contacts];

    let filtered = all.filter(name => {
        if (currentFolder === 'archive') return archivedChats.includes(name);
        return !archivedChats.includes(name);
    });

    // Сортировка: закрепленные всегда сверху
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
    
    // Включаем режим канала (сообщения слева) для LuxeNews и CryptoWorld
    const isChannel = (name === "LuxeNews" || name === "CryptoWorld");
    document.querySelector('.chat-window').classList.toggle('channel-mode', isChannel);

    let key = isChannel ? "channel_" + name : (name === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, name].sort().join('_'));
    listenMessages(key);
}

// Слушатель сообщений с галочками и датой
function listenMessages(key) {
    db.ref('chats/' + key).on('value', (snap) => {
        let div = document.getElementById('messages');
        div.innerHTML = "";
        snap.forEach(child => {
            let m = child.val();
            let isOwn = m.from === currentUser.user;
            
            // Если сообщение не наше и не прочитано — читаем его
            if (!isOwn && !m.read) db.ref(`chats/${key}/${child.key}`).update({read: true});

            div.innerHTML += `
                <div class="msg ${isOwn ? 'own' : 'others'}">
                    <div class="msg-content">${m.text}</div>
                    <div class="msg-info">
                        <span>${m.date || ''} ${m.time}</span>
                        ${isOwn ? `<span class="ticks ${m.read ? 'read' : ''}">${m.read ? '✓✓' : '✓'}</span>` : ''}
                    </div>
                </div>`;
        });
        div.scrollTop = div.scrollHeight;
    });
}

function send() {
    let inp = document.getElementById('msgInput');
    let text = inp.value.trim();
    if (!text) return;

    let key = (activeChat === 'LuxeNews' || activeChat === 'CryptoWorld') ? "channel_" + activeChat : (activeChat === 'Заметки' ? 'notes_' + currentUser.user : 'private_' + [currentUser.user, activeChat].sort().join('_'));
    
    db.ref('chats/' + key).push({
        from: currentUser.user,
        text: text,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString(),
        read: false
    });
    inp.value = "";
}

// Контекстное меню для закрепа и архива
function showChatMenu(e, name) {
    e.preventDefault();
    activeChat = name;
    let menu = document.getElementById('chat-context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    document.getElementById('pin-opt').innerText = pinnedChats.includes(name) ? "📍 Открепить" : "📌 Закрепить";
}

function togglePin() {
    pinnedChats.includes(activeChat) ? pinnedChats = pinnedChats.filter(n => n !== activeChat) : pinnedChats.push(activeChat);
    localStorage.setItem('pins', JSON.stringify(pinnedChats));
    renderContacts();
}

function toggleArchive() {
    archivedChats.includes(activeChat) ? archivedChats = archivedChats.filter(n => n !== activeChat) : archivedChats.push(activeChat);
    localStorage.setItem('archive', JSON.stringify(archivedChats));
    renderContacts();
}

// Настройки и Профиль
function showUserProfile(name) {
    if (!name || name === "Выберите чат") return;
    document.getElementById('user-profile-panel').classList.add('active');
    document.getElementById('profile-img').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
    document.getElementById('profile-nick').innerText = name;
    document.getElementById('profile-user').innerText = "@" + name.toLowerCase();
}

function updateProfile(type) {
    let val = type === 'nick' ? document.getElementById('edit-nick').value : document.getElementById('edit-user').value;
    if (!val) return;
    if (type === 'nick') { currentUser.nick = val; localStorage.setItem('luxe_nick', val); }
    else { currentUser.user = val; localStorage.setItem('luxe_user', val); }
    updateUI();
    alert('Профиль обновлен!');
}

function updateUI() {
    document.getElementById('menu-nick').innerText = currentUser.nick;
    document.getElementById('menu-user').innerText = "@" + currentUser.user;
    document.getElementById('menu-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.user}`;
}

// Вспомогательные функции
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function openSettings() { document.getElementById('settings-modal').style.display = 'block'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }
function closeRightPanel() { document.getElementById('user-profile-panel').classList.remove('active'); }
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function showFolder(folder) { currentFolder = folder; renderContacts(); }

window.onclick = () => { document.getElementById('chat-context-menu').style.display = 'none'; };