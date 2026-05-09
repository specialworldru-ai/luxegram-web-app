// ТВОЙ КОНФИГ FIREBASE - Обязательно вставь свой ключ в apiKey!
const firebaseConfig = {
    apiKey: "AIzaSyAs-ТВОЙ_КЛЮЧ_СЮДА", 
    authDomain: "luxeffa.firebaseapp.com",
    databaseURL: "https://luxeffa-default-rtdb.firebaseio.com",
    projectId: "luxeffa",
    storageBucket: "luxeffa.appspot.com",
    messagingSenderId: "772413625432",
    appId: "1:772413625432:web:77905396557879654"
};

// Инициализация
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = {
    nick: localStorage.getItem('luxe_nick') || "",
    user: localStorage.getItem('luxe_user') || ""
};

let activeChat = "";

window.onload = () => {
    if (currentUser.user) {
        document.getElementById('auth-screen').style.display = 'none';
        updateProfilePanel();
        renderChannels();
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

// Обновление аватарки и ника в нижнем левом углу
function updateProfilePanel() {
    document.getElementById('my-nick').innerText = currentUser.nick;
    document.getElementById('my-user').innerText = "#" + currentUser.user;
    document.getElementById('my-avatar').src = `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.user}`;
}

// Рендер каналов слева
function renderChannels() {
    const list = document.getElementById('chat-list');
    list.innerHTML = "";
    
    // Структура Дискорда: Каналы помечаются решеткой (#), Личные чаты - @
    const channels = ["LuxeNews", "CryptoWorld", "Заметки"];
    
    channels.forEach(name => {
        const isActive = activeChat === name ? 'active' : '';
        const icon = (name === "Заметки") ? "📝" : "#";
        
        list.innerHTML += `
            <div class="ds-channel ${isActive}" onclick="openChannel('${name}')">
                <span class="ds-channel-icon">${icon}</span>
                <span>${name}</span>
            </div>
        `;
    });
}

function openChannel(name) {
    activeChat = name;
    document.getElementById('chat-title').innerText = name.toLowerCase();
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('msgInput').placeholder = `Написать в #${name.toLowerCase()}`;
    
    renderChannels(); // Обновляем выделение канала

    let key = (name === "LuxeNews" || name === "CryptoWorld") ? "channel_" + name : 'notes_' + currentUser.user;
    
    db.ref('chats/' + key).on('value', (snap) => {
        const div = document.getElementById('messages');
        div.innerHTML = "";
        
        // Добавляем заглушку начала истории
        div.innerHTML = `
            <div class="ds-welcome" style="margin-top:auto; padding: 20px; text-align: left;">
                <h1 style="color: white; font-size: 32px;">Добро пожаловать в #${name.toLowerCase()}!</h1>
                <p>Это начало истории канала.</p>
            </div>
        `;

        snap.forEach(child => {
            const m = child.val();
            // В дискорде сообщения идут сверху вниз, все слева.
            div.innerHTML += `
                <div class="ds-msg">
                    <img class="ds-msg-avatar" src="https://api.dicebear.com/7.x/identicon/svg?seed=${m.from}">
                    <div class="ds-msg-content">
                        <div class="ds-msg-header">
                            <span class="ds-msg-author">${m.from}</span>
                            <span class="ds-msg-time">${m.date || ''} в ${m.time}</span>
                        </div>
                        <div class="ds-msg-text">${m.text}</div>
                    </div>
                </div>
            `;
        });
        // Скролл вниз
        div.scrollTop = div.scrollHeight;
    });
}

function send() {
    const inp = document.getElementById('msgInput');
    const text = inp.value.trim();
    if (!text || !activeChat) return;

    let key = (activeChat === "LuxeNews" || activeChat === "CryptoWorld") ? "channel_" + activeChat : 'notes_' + currentUser.user;
    
    db.ref('chats/' + key).push({
        from: currentUser.user,
        text: text,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString()
    });
    inp.value = "";
}