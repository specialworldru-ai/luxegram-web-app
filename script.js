const firebaseConfig = {
  apiKey: "AIzaSyCQlUa13e_NKzzUL-PhI4HXETKno2x029Q",
  authDomain: "luxegram-f6e9a.firebaseapp.com",
  databaseURL: "https://luxegram-f6e9a-default-rtdb.europe-west1.firebasedatabase.app/", 
  projectId: "luxegram-f6e9a",
  storageBucket: "luxegram-f6e9a.firebasestorage.app",
  messagingSenderId: "64533495549",
  appId: "1:64533495549:web:8f60c9243ca771204b4894",
  measurementId: "G-HXDSC0YVJV"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";

window.onload = function() {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('menu-user-name').innerText = "@" + currentUser;
        document.getElementById('menu-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

// Открыть/Закрыть меню
function toggleMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    menu.classList.toggle('active');
    overlay.style.display = menu.classList.contains('active') ? 'block' : 'none';
}

function register() {
    let name = document.getElementById('reg-name').value.trim().replace('@', '');
    if (name) {
        localStorage.setItem('luxegram_user', name);
        location.reload();
    }
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = name === 'Заметки' ? "⭐ Избранное" : "Чат с " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    
    if(document.getElementById('side-menu').classList.contains('active')) toggleMenu();

    db.ref('chats/').off(); 
    listenMessages(getChatKey(currentUser, activeChat));
}

function send() {
    let input = document.getElementById('msgInput');
    let text = input.value.trim();
    if (!text || !activeChat) return;

    let chatKey = getChatKey(currentUser, activeChat);
    let msgData = {
        from: currentUser,
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: 'text'
    };

    db.ref('chats/' + chatKey).push(msgData);
    input.value = '';
}

function listenMessages(chatKey) {
    db.ref('chats/' + chatKey).on('value', (snapshot) => {
        let messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = "";
        let data = snapshot.val();
        for (let id in data) {
            let msg = data[id];
            let isOwn = msg.from === currentUser;
            messagesDiv.innerHTML += `
                <div class="msg ${isOwn ? 'own' : 'others'}">
                    <div class="msg-content">${msg.text}</div>
                    <span class="msg-time">${msg.time}</span>
                </div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

function getChatKey(user1, user2) {
    if (user2 === 'Заметки') return 'notes_' + user1;
    return 'private_' + [user1, user2].sort().join('_');
}

function renderContacts() {
    let listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = ""; // Очищаем

    // 1. Сначала всегда идут "Заметки" (Saved Messages)
    listDiv.innerHTML += `
        <div class="chat-item special" onclick="selectChat('Заметки')">
            <div class="chat-avatar" style="display:flex; align-items:center; justify-content:center; background:#7b2ff7; color:white; font-size:20px;">🔖</div>
            <div class="chat-info">
                <span class="chat-name">Saved Messages</span>
                <p class="chat-last-msg">Личные заметки</p>
            </div>
        </div>`;

    // 2. Затем твои любимые КАНАЛЫ (добавляем их вручную)
    const channels = ["LuxeNews", "CryptoWorld"]; // Названия твоих каналов
    channels.forEach(chan => {
        listDiv.innerHTML += `
            <div class="chat-item channel" onclick="selectChat('${chan}')">
                <div class="chat-avatar" style="display:flex; align-items:center; justify-content:center; background:#444; color:white; font-size:20px;">📢</div>
                <div class="chat-info">
                    <span class="chat-name">${chan}</span>
                    <p class="chat-last-msg">канал</p>
                </div>
            </div>`;
    });

    // 3. А потом уже все остальные контакты из поиска
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    contacts.forEach(name => {
        if (!channels.includes(name)) { // Чтобы не дублировать, если канал в контактах
            listDiv.innerHTML += `
                <div class="chat-item" onclick="selectChat('${name}')">
                    <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                    <div class="chat-info">
                        <span class="chat-name">${name}</span>
                        <p class="chat-last-msg">написать сообщение...</p>
                    </div>
                </div>`;
        }
    });
}

function searchProfile() {
    let query = document.getElementById('searchUser').value.trim().replace('@', '');
    if (query && query !== currentUser) {
        let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
        if (!contacts.includes(query)) contacts.push(query);
        localStorage.setItem('contacts_' + currentUser, JSON.stringify(contacts));
        renderContacts();
        selectChat(query);
    }
}