const firebaseConfig = {
    apiKey: "AIzaSyCQlUa13e_NKzzUL-PhI4HXETKno2x029Q",
    authDomain: "luxegram-f6e9a.firebaseapp.com",
    databaseURL: "https://luxegram-f6e9a-default-rtdb.europe-west1.firebasedatabase.app/", 
    projectId: "luxegram-f6e9a",
    storageBucket: "luxegram-f6e9a.firebasestorage.app",
    messagingSenderId: "64533495549",
    appId: "1:64533495549:web:8f60c9243ca771204b4894"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let currentUser = localStorage.getItem('luxegram_user') || "";
let activeChat = "";
let selectedMsg = null;
let activePostId = null;
let typingTimeout;

window.onload = () => {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('menu-user-name').innerText = "@" + currentUser;
        document.getElementById('menu-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        renderContacts();
    }
};

function register() {
    let name = document.getElementById('reg-name').value.trim().replace('@', '');
    if (name) { localStorage.setItem('luxegram_user', name); location.reload(); }
}

function renderContacts() {
    let list = document.getElementById('chat-list');
    list.innerHTML = "";
    // Заметки
    list.innerHTML += `<div class="chat-item" onclick="selectChat('Заметки')"><div class="chat-avatar" style="background:#7b2ff7">🔖</div><div class="chat-info"><span class="chat-name">Saved Messages</span></div></div>`;
    // Каналы
    [{n:"LuxeNews",i:"💎",c:"#f39c12"},{n:"CryptoWorld",i:"₿",c:"#2ecc71"}].forEach(ch => {
        list.innerHTML += `<div class="chat-item" onclick="selectChannel('${ch.n}')"><div class="chat-avatar" style="background:${ch.c}">${ch.i}</div><div class="chat-info"><span class="chat-name">${ch.n}</span><p class="chat-last-msg">канал</p></div></div>`;
    });
    // Контакты
    let contacts = JSON.parse(localStorage.getItem('contacts_' + currentUser) || "[]").filter(n => n.toLowerCase() !== 'news');
    contacts.forEach(n => {
        list.innerHTML += `<div class="chat-item">
            <div onclick="selectChat('${n}')" style="display:flex; align-items:center; flex:1; gap:12px;">
                <img class="chat-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${n}">
                <div class="chat-info"><span class="chat-name">${n}</span></div>
            </div>
            <button class="del-btn" onclick="deleteChat('${n}')">✕</button>
        </div>`;
    });
}

function selectChat(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = name;
    document.getElementById('inputPanel').style.display = 'flex';
    db.ref('chats/').off();
    let key = getChatKey(currentUser, activeChat);
    listenMessages(key);
    listenTyping(key);
}

function selectChannel(name) {
    activeChat = name;
    document.getElementById('current-chat-title').innerText = "📢 " + name;
    document.getElementById('inputPanel').style.display = 'flex';
    db.ref('chats/').off();
    listenMessages("channel_" + name);
    listenTyping("channel_" + name);
}

function send() {
    let input = document.getElementById('msgInput');
    let text = input.value.trim();
    if (!text) return;
    let key = activeChat.startsWith("LuxeNews") || activeChat.startsWith("Crypto") ? "channel_" + activeChat : getChatKey(currentUser, activeChat);
    db.ref('chats/' + key).push({ from: currentUser, text: text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
    input.value = '';
    db.ref(`typing/${key}/${currentUser}`).remove();
}

function listenMessages(chatKey) {
    db.ref('chats/' + chatKey).on('value', (snapshot) => {
        let div = document.getElementById('messages'); div.innerHTML = "";
        let data = snapshot.val();
        for (let id in data) {
            let msg = data[id];
            let isOwn = msg.from === currentUser;
            let comment = chatKey.startsWith("channel_") ? `<div class="comment-link" onclick="openComments('${chatKey}', '${id}')">💬 Обсудить</div>` : "";
            div.innerHTML += `<div class="msg ${isOwn ? 'own' : 'others'}" oncontextmenu="showContextMenu(event, '${chatKey}', '${id}', '${msg.text}')">
                <div class="msg-content">${msg.text}</div>${comment}<span class="msg-time">${msg.time}</span>
            </div>`;
        }
        div.scrollTop = div.scrollHeight;
    });
}

// РАБОТА С ОБСУЖДЕНИЯМИ
function openComments(chatKey, postId) {
    activePostId = postId;
    document.getElementById('comments-modal').style.display = 'block';
    let path = `comments/${chatKey.replace('.','_')}/${postId}`;
    db.ref(path).on('value', (snapshot) => {
        let div = document.getElementById('comment-messages'); div.innerHTML = "";
        let data = snapshot.val();
        for (let id in data) {
            let m = data[id];
            div.innerHTML += `<div class="msg ${m.from===currentUser?'own':'others'}"><small>${m.from}</small><br>${m.text}</div>`;
        }
        div.scrollTop = div.scrollHeight;
    });
}

function sendComment() {
    let input = document.getElementById('commentInput');
    if (!input.value.trim() || !activePostId) return;
    let chatKey = activeChat.startsWith("Luxe") || activeChat.startsWith("Crypto") ? "channel_" + activeChat : getChatKey(currentUser, activeChat);
    db.ref(`comments/${chatKey.replace('.','_')}/${activePostId}`).push({ from: currentUser, text: input.value, time: "now" });
    input.value = '';
}

function handleTyping() {
    let key = activeChat.startsWith("Luxe") || activeChat.startsWith("Crypto") ? "channel_" + activeChat : getChatKey(currentUser, activeChat);
    db.ref(`typing/${key}/${currentUser}`).set(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => db.ref(`typing/${key}/${currentUser}`).remove(), 2000);
}

function listenTyping(key) {
    db.ref(`typing/${key}`).on('value', s => {
        let t = s.val() ? Object.keys(s.val()).filter(u => u !== currentUser) : [];
        document.getElementById('typing-indicator').innerText = t.length ? t.join(', ') + " печатает..." : "";
    });
}

function editProfile() {
    let n = prompt("Новый ник:", currentUser);
    if(n) { localStorage.setItem('luxegram_user', n); location.reload(); }
}

function deleteChat(name) {
    let c = JSON.parse(localStorage.getItem('contacts_' + currentUser)).filter(i => i !== name);
    localStorage.setItem('contacts_' + currentUser, JSON.stringify(c));
    renderContacts();
}

function getChatKey(u1, u2) { return u2 === 'Заметки' ? 'notes_' + u1 : 'private_' + [u1, u2].sort().join('_'); }
function closeComments() { document.getElementById('comments-modal').style.display = 'none'; }
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); document.getElementById('menu-overlay').style.display = document.getElementById('side-menu').classList.contains('active') ? 'block' : 'none'; }

function showContextMenu(e, key, id, txt) {
    e.preventDefault(); selectedMsg = {key, id, txt};
    let m = document.getElementById('msg-menu');
    m.style.display = 'block';
    m.style.left = Math.min(e.pageX, window.innerWidth - 160) + 'px';
    m.style.top = Math.min(e.pageY, window.innerHeight - 100) + 'px';
}
window.onclick = () => document.getElementById('msg-menu').style.display = 'none';
function deleteMsg() { db.ref('chats/' + selectedMsg.key + '/' + selectedMsg.id).remove(); }
function editMsg() { let t = prompt("Edit:", selectedMsg.txt); if(t) db.ref('chats/'+selectedMsg.key+'/'+selectedMsg.id).update({text:t}); }
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