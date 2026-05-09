document.addEventListener('DOMContentLoaded', () => {
    // База данных сообщений (временная)
    const chatData = {
        'support': [
            { text: "Привет! Это поддержка LuxeGram.", time: "12:00", type: "incoming" }
        ],
        'durov': [
            { text: "Привет, это Павел. Как проект?", time: "14:20", type: "incoming" }
        ]
    };

    let activeChatId = 'support';

    const container = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const notifySound = document.getElementById('notifySound');
    const chatItems = document.querySelectorAll('.chat-item');
    const chatNameHeader = document.getElementById('currentChatName');

    // 1. ПЕРЕКЛЮЧЕНИЕ ЧАТОВ
    chatItems.forEach(item => {
        item.onclick = () => {
            // Убираем активный класс у всех и даем текущему
            chatItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            activeChatId = item.getAttribute('data-id');
            chatNameHeader.innerText = item.getAttribute('data-name');
            
            renderMessages();
        };
    });

    // Функция отрисовки сообщений
    function renderMessages() {
        container.innerHTML = '';
        const messages = chatData[activeChatId] || [];
        messages.forEach(msg => {
            const html = `
                <div class="message ${msg.type}">
                    ${msg.text}
                    <span class="message-time">${msg.time}</span>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
        container.scrollTop = container.scrollHeight;
    }

    // 2. ЗВУК И ОТПРАВКА
    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Сохраняем в базу текущего чата
        if (!chatData[activeChatId]) chatData[activeChatId] = [];
        chatData[activeChatId].push({ text, time, type: 'outgoing' });

        // Воспроизводим звук
        notifySound.currentTime = 0;
        notifySound.play().catch(e => console.log("Звук заблокирован браузером"));

        input.value = "";
        renderMessages();
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    // 3. ПРОФИЛЬ, МЕНЮ, ЭМОДЗИ (сохранено из прошлых версий)
    const openMenuBtn = document.getElementById('openMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const userProfile = document.getElementById('userProfile');
    
    document.getElementById('openProfileTrigger').onclick = () => {
        userProfile.classList.remove('hidden');
        sideMenu.classList.remove('open');
    };
    document.getElementById('closeProfile').onclick = () => userProfile.classList.add('hidden');
    openMenuBtn.onclick = (e) => { e.stopPropagation(); sideMenu.classList.toggle('open'); };
    
    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('luxeGramTheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    };

    document.getElementById('emojiBtn').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('emojiPicker').classList.toggle('hidden');
    };

    document.querySelectorAll('#emojiPicker span').forEach(s => {
        s.onclick = () => { input.value += s.innerText; input.focus(); };
    });

    // Поиск
    document.getElementById('searchInput').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        chatItems.forEach(chat => {
            chat.style.display = chat.getAttribute('data-name').toLowerCase().includes(val) ? 'flex' : 'none';
        });
    };

    // Первый запуск
    if (localStorage.getItem('luxeGramTheme') === 'dark') document.body.classList.add('dark-theme');
    renderMessages();
});