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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";
let selectedMsg = null;

window.onload = function() {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('menu-user-name').innerText = "@" + currentUser;
        document.getElementById('menu-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

function toggleMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    menu.classList.toggle('active');
    overlay.style.display = menu.classList.contains('active') ? 'block' : 'none';
}

function register() {
    let name = document.getElementById('reg-name').value.trim().replace('@', '');
    if (name) { localStorage.setItem('luxegram_user', name); location.reload(); }
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = name === 'Заметки' ? "⭐ Saved Messages" : name;
    document.getElementById('inputPanel').style.display = 'flex';
    if(document.getElementById('side-menu').classList.contains('active')) toggleMenu();
    db.ref('chats/').off();
    listenMessages(getChatKey(currentUser, activeChat));
}

function selectChannel(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "📢 " + name;
    document.getElementById('inputPanel').style.display = 'flex'; // Всем разрешено писать для теста
    if(document.getElementById('side-menu').classList.contains('active')) toggleMenu();
    db.ref('chats/').off();
    listenMessages("channel_" + name);
}

function send() {
    let input = document.getElementById('msgInput');
    let text = input.value.trim();
    if (!text || !activeChat) return;
    let key = activeChat.startsWith("LuxeNews") || activeChat.startsWith("Crypto") ? "channel_" + activeChat : getChatKey(currentUser, activeChat);
    db.ref('chats/' + key).push({
        from: currentUser,
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    input.value = '';
}

// 2. ОТРИСОВКА СООБЩЕНИЙ С КОММЕНТАРИЯМИ
function listenMessages(chatKey) {
    db.ref('chats/' + chatKey).on('value', (snapshot) => {
        let div = document.getElementById('messages');
        div.innerHTML = "";
        let data = snapshot.val();
        
        for (let id in data) {
            let msg = data[id];
            let isOwn = msg.from === currentUser;
            
            // Если это канал, добавляем кнопку "Обсудить"
            let commentHtml = chatKey.startsWith("channel_") 
                ? `<div class="comment-link" onclick="event.stopPropagation(); alert('Тут будут комментарии!')">💬 Обсудить</div>` 
                : "";

            div.innerHTML += `
                <div class="msg ${isOwn ? 'own' : 'others'}" 
                     oncontextmenu="showContextMenu(event, '${chatKey}', '${id}', '${msg.text}')">
                    <div class="msg-content">${msg.text}</div>
                    ${commentHtml}
                    <span class="msg-time">${msg.time}</span>
                </div>`;
        }
        div.scrollTop = div.scrollHeight;
    });
}

function showContextMenu(e, chatKey, msgId, text) {
    e.preventDefault();
    selectedMsg = { key: chatKey, id: msgId, text: text };
    
    let menu = document.getElementById('msg-menu');
    menu.style.display = 'block';

    // Размеры меню и экрана
    let menuWidth = menu.offsetWidth;
    let menuHeight = menu.offsetHeight;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Проверка правой границы
    let x = e.pageX;
    let y = e.pageY;

    if ((x + menuWidth) > windowWidth) {
        x = windowWidth - menuWidth - 10; // Отступаем 10px от края
    }

    // Проверка нижней границы
    if ((y + menuHeight) > windowHeight) {
        y = windowHeight - menuHeight - 10;
    }

    menu.style.top = y + 'px';
    menu.style.left = x + 'px';
}

window.onclick = () => document.getElementById('msg-menu').style.display = 'none';

function deleteMsg() { if(selectedMsg) db.ref('chats/' + selectedMsg.key + '/' + selectedMsg.id).remove(); }
function editMsg() {
    let t = prompt("Изменить:", selectedMsg.text);
    if(t) db.ref('chats/' + selectedMsg.key + '/' + selectedMsg.id).update({text: t});
}

function getChatKey(u1, u2) {
    if (u2 === 'Заметки') return 'notes_' + u1;
    return 'private_' + [u1, u2].sort().join('_');
}

// 1. РЕНДЕР СПИСКА КОНТАКТОВ И КАНАЛОВ
function renderContacts() {
    let list = document.getElementById('chat-list');
    list.innerHTML = ""; // Чистим список перед отрисовкой

    // Блок Избранного (Заметки)
    list.innerHTML += `
        <div class="chat-item special" onclick="selectChat('Заметки')">
            <div class="chat-avatar" style="background:#7b2ff7; color:white;">🔖</div>
            <div class="chat-info">
                <span class="chat-name">Saved Messages</span>
                <p class="chat-last-msg">Личные заметки</p>
            </div>
        </div>`;

    // Блок Каналов
    const myChannels = [
        {n:"LuxeNews", i:"💎", c:"#f39c12"},
        {n:"CryptoWorld", i:"₿", c:"#2ecc71"}
    ];
    
    myChannels.forEach(ch => {
        list.innerHTML += `
            <div class="chat-item" onclick="selectChannel('${ch.n}')">
                <div class="chat-avatar" style="background:${ch.c}; color:white;">${ch.i}</div>
                <div class="chat-info">
                    <span class="chat-name">${ch.n}</span>
                    <p class="chat-last-msg">официальный канал</p>
                </div>
            </div>`;
    });

    // Блок Пользователей (Контакты)
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    
    // Фильтруем список, чтобы убрать системный мусор и дубли каналов
    contacts = contacts.filter(n => 
        n.toLowerCase() !== 'news' && 
        n !== 'LuxeNews' && 
        n !== 'CryptoWorld'
    );

    contacts.forEach(n => {
        list.innerHTML += `
            <div class="chat-item" onclick="selectChat('${n}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${n}">
                <div class="chat-info">
                    <span class="chat-name">${n}</span>
                    <p class="chat-last-msg">написать сообщение...</p>
                </div>
            </div>`;
    });
}

function searchProfile() {
    let q = document.getElementById('searchUser').value.trim();
    if(q && q !== currentUser) {
        let c = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
        if(!c.includes(q)) c.push(q);
        localStorage.setItem('contacts_' + currentUser, JSON.stringify(c));
        renderContacts();
        selectChat(q);
    }
}