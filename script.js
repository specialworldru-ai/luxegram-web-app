// В самом верху файла!
const firebaseConfig = {
  apiKey: "AIzaSyCQlUa13e_NKzzUL-PhI4HXETKno2x029Q",
  authDomain: "luxegram-f6e9a.firebaseapp.com",
  // ТУТ ВАЖНО: Проверь эту ссылку в своей панели Realtime Database
  databaseURL: "https://luxegram-f6e9a-default-rtdb.europe-west1.firebasedatabase.app/", 
  projectId: "luxegram-f6e9a",
  storageBucket: "luxegram-f6e9a.firebasestorage.app",
  messagingSenderId: "64533495549",
  appId: "1:64533495549:web:8f60c9243ca771204b4894",
  measurementId: "G-HXDSC0YVJV"
};

// Инициализация (Слова 'firebase' должны работать, т.к. мы добавили ссылки в HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ... остальной твой код (currentUser и т.д.)
};

// 2. ИНИЦИАЛИЗАЦИЯ
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";

window.onload = function() {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('display-name').innerText = "@" + currentUser;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

function register() {
    let name = document.getElementById('reg-name').value.trim().replace('@', '');
    if (name) {
        localStorage.setItem('luxegram_user', name);
        location.reload();
    }
}

// ОТПРАВКА СООБЩЕНИЯ
function send() {
    let input = document.getElementById('msgInput');
    let text = input.value.trim();
    if (!text || !activeChat) return;

    let chatKey = getChatKey(currentUser, activeChat);
    let msgData = {
        id: Date.now(),
        from: currentUser,
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: text.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'text'
    };

    db.ref('chats/' + chatKey).push(msgData);
    input.value = '';
}

// СЛУШАТЕЛЬ (ОБНОВЛЕНИЕ В РЕАЛЬНОМ ВРЕМЕНИ)
function listenMessages(chatKey) {
    db.ref('chats/' + chatKey).on('value', (snapshot) => {
        let messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = "";
        let data = snapshot.val();
        
        for (let id in data) {
            let msg = data[id];
            let isOwn = msg.from === currentUser;
            let content = msg.type === 'image' 
                ? `<img src="${msg.text}" style="max-width:200px; border-radius:10px;">` 
                : msg.text;

            messagesDiv.innerHTML += `
                <div class="msg ${isOwn ? 'own' : 'others'}">
                    <span class="msg-author">${msg.from}</span>
                    <div class="msg-content">${content}</div>
                    <span class="msg-time">${msg.time}</span>
                    ${isOwn ? `<button class="del-btn" onclick="deleteMsg('${id}')">×</button>` : ''}
                </div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// УДАЛЕНИЕ СООБЩЕНИЯ
function deleteMsg(msgFirebaseId) {
    if (confirm("Удалить сообщение для всех?")) {
        let chatKey = getChatKey(currentUser, activeChat);
        db.ref('chats/' + chatKey + '/' + msgFirebaseId).remove();
    }
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function getChatKey(user1, user2) {
    if (user2 === 'Заметки') return 'notes_' + user1;
    return 'private_' + [user1, user2].sort().join('_');
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "Чат с " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    db.ref('chats/').off(); 
    listenMessages(getChatKey(currentUser, activeChat));
}

function renderContacts() {
    let listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = `<div class="chat-item special" onclick="selectChat('Заметки')">⭐ Мои заметки</div>`;
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    contacts.forEach(name => {
        listDiv.innerHTML += `
            <div class="chat-item" onclick="selectChat('${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <span>${name}</span>
            </div>`;
    });
}

// Поиск (упрощенный для теста базы)
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