let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";

// При запуске
window.onload = function() {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('display-name').innerText = "@" + currentUser;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

// Регистрация
function register() {
    let name = document.getElementById('reg-name').value.trim();
    if (name) {
        localStorage.setItem('luxegram_user', name);
        location.reload();
    }
}

// Добавить контакт в список
function addContact() {
    let contactName = document.getElementById('searchUser').value.trim();
    if (contactName && contactName !== currentUser) {
        let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
        if (!contacts.includes(contactName)) {
            contacts.push(contactName);
            localStorage.setItem('contacts_' + currentUser, JSON.stringify(contacts));
        }
        document.getElementById('searchUser').value = "";
        renderContacts();
    }
}

// Показать контакты слева
function renderContacts() {
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    let listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = "";
    
    contacts.forEach(name => {
        listDiv.innerHTML += `
            <div class="chat-item ${activeChat === name ? 'active' : ''}" onclick="selectChat('${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <span>${name}</span>
            </div>
        `;
    });
}

// Выбрать чат
function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "Чат с " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    renderContacts();
    renderMessages();
}

// Отправить сообщение
function send() {
    let input = document.getElementById('msgInput');
    if (input.value.trim() && activeChat) {
        let now = new Date();
        let time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        
        let message = { from: currentUser, to: activeChat, text: input.value, time: time };
        
        // Уникальный ключ для пары собеседников
        let chatKey = [currentUser, activeChat].sort().join('_');
        let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
        history.push(message);
        localStorage.setItem('chat_' + chatKey, JSON.stringify(history));
        
        input.value = '';
        renderMessages();
    }
}

// Показать сообщения в выбранном чате
function renderMessages() {
    if (!activeChat) return;
    let chatKey = [currentUser, activeChat].sort().join('_');
    let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
    let messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = "";
    
    history.forEach(msg => {
        let isOwn = msg.from === currentUser;
        messagesDiv.innerHTML += `
            <div class="msg ${isOwn ? 'own' : 'others'}">
                <span class="msg-author">${msg.from}</span>
                <span class="msg-text">${msg.text}</span>
                <span class="msg-time">${msg.time}</span>
            </div>
        `;
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Отправка по нажатию Enter
document.getElementById('msgInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') send();
});