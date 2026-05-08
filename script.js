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
    let name = document.getElementById('reg-name').value.trim();
    if (name) {
        localStorage.setItem('luxegram_user', name);
        location.reload();
    }
}

// УПРАВЛЕНИЕ ПРОФИЛЕМ
function openProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
    document.getElementById('p-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
    document.getElementById('p-name').innerText = currentUser;
    document.getElementById('p-username').innerText = "@" + currentUser;
    document.getElementById('p-bio').value = localStorage.getItem('bio_' + currentUser) || "";
}

function closeProfile() {
    document.getElementById('profile-modal').style.display = 'none';
}

function saveProfile() {
    let bio = document.getElementById('p-bio').value;
    localStorage.setItem('bio_' + currentUser, bio);
    closeProfile();
}

// КОНТАКТЫ И ЗАМЕТКИ
function renderContacts() {
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    let listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = "";
    
    // Добавляем раздел "Заметки" (Избранное) первым
    listDiv.innerHTML += `
        <div class="chat-item special ${activeChat === 'Заметки' ? 'active' : ''}" onclick="selectChat('Заметки')">
            <div class="chat-avatar" style="background:#4ade80; display:flex; align-items:center; justify-content:center;">⭐</div>
            <span>Мои заметки</span>
        </div>
    `;

    contacts.forEach(name => {
        listDiv.innerHTML += `
            <div class="chat-item ${activeChat === name ? 'active' : ''}" onclick="selectChat('${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <span>${name}</span>
            </div>
        `;
    });
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = (name === 'Заметки') ? "📝 Личные заметки" : "Чат с " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    renderContacts();
    renderMessages();
}

function send() {
    let input = document.getElementById('msgInput');
    if (input.value.trim() && activeChat) {
        let now = new Date();
        let time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        
        let message = { from: currentUser, text: input.value, time: time };
        
        // Для заметок ключ отдельный, для чатов — парный
        let chatKey = (activeChat === 'Заметки') ? 'notes_' + currentUser : [currentUser, activeChat].sort().join('_');
        
        let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
        history.push(message);
        localStorage.setItem('chat_' + chatKey, JSON.stringify(history));
        
        input.value = '';
        renderMessages();
    }
}

function renderMessages() {
    if (!activeChat) return;
    let chatKey = (activeChat === 'Заметки') ? 'notes_' + currentUser : [currentUser, activeChat].sort().join('_');
    let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
    let messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = "";
    
    history.forEach(msg => {
        let isOwn = (activeChat === 'Заметки') || (msg.from === currentUser);
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

document.getElementById('msgInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') send() });