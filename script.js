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
    listDiv.innerHTML = ""; 

    // 1. Saved Messages
    listDiv.innerHTML += `
        <div class="chat-item special" onclick="selectChat('Заметки')">
            <div class="chat-avatar" style="display:flex; align-items:center; justify-content:center; background:#7b2ff7; color:white; font-size:20px;">🔖</div>
            <div class="chat-info">
                <span class="chat-name">Saved Messages</span>
                <p class="chat-last-msg">Личные заметки</p>
            </div>
        </div>`;

    // 2. Твои КАНАЛЫ
    const channels = [
        { name: "LuxeNews", icon: "💎", color: "#f39c12" },
        { name: "CryptoWorld", icon: "₿", color: "#2ecc71" }
    ]; 
    
    channels.forEach(chan => {
        listDiv.innerHTML += `
            <div class="chat-item channel" onclick="selectChannel('${chan.name}')">
                <div class="chat-avatar" style="display:flex; align-items:center; justify-content:center; background:${chan.color}; color:white; font-size:20px;">${chan.icon}</div>
                <div class="chat-info">
                    <span class="chat-name">${chan.name}</span>
                    <p class="chat-last-msg">официальный канал</p>
                </div>
            </div>`;
    });

    // 3. Контакты (Чистим News здесь)
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    const channelNames = channels.map(c => c.name);

    // Удаляем 'news' или 'LuxeNews' из массива контактов, если они там завалялись
    contacts = contacts.filter(name => name.toLowerCase() !== 'news' && !channelNames.includes(name));
    localStorage.setItem('contacts_' + currentUser, JSON.stringify(contacts));

    contacts.forEach(name => {
        listDiv.innerHTML += `
            <div class="chat-item" onclick="selectChat('${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <div class="chat-info">
                    <span class="chat-name">${name}</span>
                    <p class="chat-last-msg">написать сообщение...</p>
                </div>
            </div>`;
    });
}

function selectChannel(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "📢 " + name;
    
    // РАЗРЕШАЕМ ПИСАТЬ ВСЕМ (пока ты тестируешь)
    document.getElementById('inputPanel').style.display = "flex"; 
    
    db.ref('chats/').off();
    listenMessages("channel_" + name);
}

function selectChannel(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "📢 " + name;
    
    // РАЗРЕШАЕМ ПИСАТЬ ВСЕМ (пока ты тестируешь)
    document.getElementById('inputPanel').style.display = "flex"; 
    
    db.ref('chats/').off();
    listenMessages("channel_" + name);
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