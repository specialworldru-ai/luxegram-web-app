// Проверка загрузки скрипта
console.log("Luxegram Script Loaded");

let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";

window.onload = function() {
    console.log("Window loaded, user:", currentUser);
    const authScreen = document.getElementById('auth-screen');
    
    if (currentUser) {
        if (authScreen) authScreen.style.display = 'none';
        const displayName = document.getElementById('display-name');
        const userAvatar = document.getElementById('user-avatar');
        
        if (displayName) displayName.innerText = "@" + currentUser;
        if (userAvatar) userAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

function register() {
    console.log("Register function called");
    const nameInput = document.getElementById('reg-name');
    if (!nameInput) {
        console.error("Input reg-name not found!");
        return;
    }

    let name = nameInput.value.trim();
    if (name) {
        localStorage.setItem('luxegram_user', name);
        console.log("User saved:", name);
        // Вместо сложной перезагрузки просто жестко обновляем адрес
        window.location.href = window.location.href;
    } else {
        alert("Введите ник!");
    }
}

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

function renderContacts() {
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    let listDiv = document.getElementById('chat-list');
    if (!listDiv) return;
    
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

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "Чат с " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    renderContacts();
    renderMessages();
}

function send() {
    let input = document.getElementById('msgInput');
    if (input.value.trim() && activeChat) {
        let now = new Date();
        let time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        let message = { from: currentUser, to: activeChat, text: input.value, time: time };
        
        let chatKey = [currentUser, activeChat].sort().join('_');
        let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
        history.push(message);
        localStorage.setItem('chat_' + chatKey, JSON.stringify(history));
        
        input.value = '';
        renderMessages();
    }
}

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