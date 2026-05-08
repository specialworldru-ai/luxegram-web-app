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

// ПОИСК (Переработанный)
function searchProfile() {
    let query = document.getElementById('searchUser').value.trim().replace('@', '');
    if (!query) return;

    // 1. Проверяем, не твой ли это ник
    if (query === currentUser) {
        openProfile(currentUser, true);
        return;
    }

    // 2. Ищем в списке созданных каналов
    let allChannels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
    let foundChannel = allChannels.find(c => c.link === query);

    if (foundChannel) {
        // Если это канал — сразу открываем его
        selectChat(foundChannel.link, true);
        document.getElementById('searchUser').value = "";
        return;
    }

    // 3. Ищем в списке контактов (людей)
    let allContacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    let foundContact = allContacts.includes(query);

    if (foundContact) {
        openProfile(query, false);
    } else {
        // 4. Если ничего не нашли — выводим сообщение
        alert("Пользователь или канал @" + query + " не найден");
    }
}

// Улучшенная функция открытия профиля (только для людей)
function openProfile(name, isMe) {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'flex';
    
    // Генерируем аватарку (для людей — bottts)
    document.getElementById('p-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
    document.getElementById('p-name').innerText = name;
    document.getElementById('p-username').innerText = "@" + name;
    
    let actions = document.getElementById('profile-actions');
    let bioEdit = document.getElementById('p-bio-edit');
    let bioText = document.getElementById('p-bio-text');
    
    actions.innerHTML = "";
    
    if (isMe) {
        bioEdit.style.display = "block";
        bioText.style.display = "none";
        bioEdit.value = localStorage.getItem('bio_' + name) || "";
        actions.innerHTML = `<button onclick="saveProfile()">Сохранить</button>`;
    } else {
        bioEdit.style.display = "none";
        bioText.style.display = "block";
        bioText.innerText = localStorage.getItem('bio_' + name) || "Этот пользователь еще не заполнил профиль";
        actions.innerHTML = `
            <button class="btn-action" onclick="startChat('${name}')">Написать</button>
            <button class="btn-call" onclick="alert('Звонок недоступен')">Позвонить</button>
        `;
    }
}

function openMyProfile() { openProfile(currentUser, true); }

function openProfile(name, isMe) {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'flex';
    document.getElementById('p-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
    document.getElementById('p-name').innerText = name;
    document.getElementById('p-username').innerText = "@" + name;
    
    let actions = document.getElementById('profile-actions');
    let bioEdit = document.getElementById('p-bio-edit');
    let bioText = document.getElementById('p-bio-text');
    
    actions.innerHTML = "";
    
    if (isMe) {
        bioEdit.style.display = "block";
        bioText.style.display = "none";
        bioEdit.value = localStorage.getItem('bio_' + name) || "";
        actions.innerHTML = `<button onclick="saveProfile()">Сохранить</button>`;
    } else {
        bioEdit.style.display = "none";
        bioText.style.display = "block";
        bioText.innerText = localStorage.getItem('bio_' + name) || "О себе ничего не указано";
        actions.innerHTML = `
            <button class="btn-action" onclick="startChat('${name}')">Написать</button>
            <button class="btn-call" onclick="alert('Звонок ${name}...')">Позвонить</button>
        `;
    }
}

function saveProfile() {
    let bio = document.getElementById('p-bio-edit').value;
    localStorage.setItem('bio_' + currentUser, bio);
    closeModal('profile-modal');
}

function startChat(name) {
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    if (!contacts.includes(name)) {
        contacts.push(name);
        localStorage.setItem('contacts_' + currentUser, JSON.stringify(contacts));
    }
    closeModal('profile-modal');
    selectChat(name);
}

// КАНАЛЫ
function openChannelCreator() { document.getElementById('channel-modal').style.display = 'flex'; }

function createChannel() {
    let name = document.getElementById('chan-name').value.trim();
    let link = document.getElementById('chan-link').value.trim().replace('@', '');
    
    if (name && link) {
        let channels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
        channels.push({ name, link, owner: currentUser });
        localStorage.setItem('channels_' + currentUser, JSON.stringify(channels));
        closeModal('channel-modal');
        renderContacts();
    }
}

function renderContacts() {
    let listDiv = document.getElementById('chat-list');
    listDiv.innerHTML = "";
    
    // 1. Заметки
    listDiv.innerHTML += `<div class="chat-item special" onclick="selectChat('Заметки')">⭐ Мои заметки</div>`;

    // 2. Каналы
    let channels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
    channels.forEach(c => {
        listDiv.innerHTML += `
            <div class="chat-item channel ${activeChat === c.link ? 'active' : ''}" onclick="selectChat('${c.link}', true)">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/identicon/svg?seed=${c.link}">
                <span>${c.name}</span>
            </div>`;
    });

    // 3. Контакты
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]");
    contacts.forEach(name => {
        listDiv.innerHTML += `
            <div class="chat-item ${activeChat === name ? 'active' : ''}" onclick="selectChat('${name}')">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}">
                <span>${name}</span>
            </div>`;
    });
}

function selectChat(id, isChannel = false) {
    activeChat = id;
    let channels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
    let chanObj = channels.find(c => c.link === id);
    
    document.getElementById('current-chat-title').innerText = chanObj ? "📢 " + chanObj.name : "Чат с " + id;
    
    // В канале может писать только владелец (в нашей версии)
    document.getElementById('inputPanel').style.display = 'flex'; 
    renderContacts();
    renderMessages();
}

function send() {
    let input = document.getElementById('msgInput');
    if (!input.value.trim() || !activeChat) return;

    let now = new Date();
    let time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    let chatKey = (activeChat === 'Заметки') ? 'notes_' + currentUser : [currentUser, activeChat].sort().join('_');
    
    // Если это канал, ключ просто по юзернейму канала
    let channels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
    if (channels.some(c => c.link === activeChat)) chatKey = 'chan_' + activeChat;

    let history = JSON.parse(localStorage.getItem('chat_' + chatKey) || "[]");
    history.push({ from: currentUser, text: input.value, time: time });
    localStorage.setItem('chat_' + chatKey, JSON.stringify(history));
    
    input.value = '';
    renderMessages();
}

function renderMessages() {
    if (!activeChat) return;
    let chatKey = (activeChat === 'Заметки') ? 'notes_' + currentUser : [currentUser, activeChat].sort().join('_');
    let channels = JSON.parse(localStorage.getItem('channels_' + currentUser) || "[]");
    if (channels.some(c => c.link === activeChat)) chatKey = 'chan_' + activeChat;

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
            </div>`;
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }