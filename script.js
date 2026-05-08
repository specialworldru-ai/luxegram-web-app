let currentUser = localStorage.getItem('luxegram_user') || "";

// Проверка регистрации при загрузке
window.onload = function() {
    if (currentUser) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('display-name').innerText = currentUser;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser}`;
        loadMessages();
    }
};

function register() {
    let name = document.getElementById('reg-name').value;
    if (name.trim()) {
        localStorage.setItem('luxegram_user', name);
        location.reload(); // Перезагружаем, чтобы всё подтянулось
    }
}

function send() {
    let input = document.getElementById('msgInput');
    if (input.value.trim() !== "") {
        let now = new Date();
        let time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        
        let message = {
            author: currentUser,
            text: input.value,
            time: time
        };

        saveMessage(message);
        input.value = '';
    }
}

function saveMessage(msg) {
    let history = JSON.parse(localStorage.getItem('chat_history') || "[]");
    history.push(msg);
    localStorage.setItem('chat_history', JSON.stringify(history));
    renderMessages();
}

function renderMessages() {
    let history = JSON.parse(localStorage.getItem('chat_history') || "[]");
    let messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = "";
    
    history.forEach(msg => {
        let isOwn = msg.author === currentUser;
        messagesDiv.innerHTML += `
            <div class="msg ${isOwn ? 'own' : 'others'}">
                <span class="msg-author">${msg.author}</span>
                <span class="msg-text">${msg.text}</span>
                <span class="msg-time">${msg.time}</span>
            </div>
        `;
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function loadMessages() {
    renderMessages();
}

// Отправка по Enter
document.getElementById('msgInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') send() });