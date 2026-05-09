document.addEventListener('DOMContentLoaded', () => {
    const chatData = {
        'support': [{ text: "Привет! Это LuxeGram Support.", time: "12:00", type: "incoming" }],
        'durov': [{ text: "Стена возвращена.", time: "14:20", type: "incoming" }]
    };

    let activeChatId = 'support';

    const container = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const notifySound = document.getElementById('notifySound');
    const chatItems = document.querySelectorAll('.chat-item');
    const sideMenu = document.getElementById('sideMenu');
    const userProfile = document.getElementById('userProfile');
    const emojiPicker = document.getElementById('emojiPicker');

    // ФУНКЦИЯ ОТРИСОВКИ
    function renderMessages() {
        container.innerHTML = '';
        (chatData[activeChatId] || []).forEach(msg => {
            const html = `<div class="message ${msg.type}">${msg.text}<span class="message-time">${msg.time}</span></div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
        container.scrollTop = container.scrollHeight;
    }

    // КЛИК ПО ЧАТАМ
    chatItems.forEach(item => {
        item.onclick = () => {
            chatItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeChatId = item.getAttribute('data-id');
            document.getElementById('currentChatName').innerText = item.getAttribute('data-name');
            renderMessages();
        };
    });

    // ОТПРАВКА
    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatData[activeChatId].push({ text, time, type: 'outgoing' });
        
        notifySound.currentTime = 0;
        notifySound.play().catch(() => {});

        input.value = "";
        renderMessages();
    }
    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    // ЛОГИКА МЕНЮ И ПРОФИЛЯ
    document.getElementById('openMenuBtn').onclick = (e) => {
        e.stopPropagation();
        sideMenu.classList.add('open');
    };

    document.getElementById('openProfileTrigger').onclick = (e) => {
        e.stopPropagation();
        userProfile.classList.remove('hidden');
        sideMenu.classList.remove('open'); // ЗАКРЫВАЕМ МЕНЮ ПРИ ОТКРЫТИИ ПРОФИЛЯ
    };

    document.getElementById('closeProfile').onclick = () => userProfile.classList.add('hidden');

    // ЗАКРЫТИЕ ВСЕГО ПРИ КЛИКЕ ВНЕ
    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target)) sideMenu.classList.remove('open');
        if (e.target === userProfile) userProfile.classList.add('hidden');
        if (!emojiPicker.contains(e.target) && e.target !== document.getElementById('emojiBtn')) {
            emojiPicker.classList.add('hidden');
        }
    });

    // ТЕМА
    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('luxeGramTheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    };

    // ЭМОДЗИ
    document.getElementById('emojiBtn').onclick = (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    };
    emojiPicker.querySelectorAll('span').forEach(s => {
        s.onclick = () => { input.value += s.innerText; input.focus(); };
    });

    if (localStorage.getItem('luxeGramTheme') === 'dark') document.body.classList.add('dark-theme');
    renderMessages();
});