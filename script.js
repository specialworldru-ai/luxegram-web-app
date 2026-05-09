document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const openMenuBtn = document.getElementById('openMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const searchInput = document.getElementById('searchInput');
    const chatItems = document.querySelectorAll('.chat-item');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const container = document.getElementById('messagesContainer');
    const themeToggle = document.getElementById('themeToggle');
    
    // Новые элементы для профиля
    const openProfileTrigger = document.getElementById('openProfileTrigger');
    const userProfile = document.getElementById('userProfile');
    const closeProfile = document.getElementById('closeProfile');

    // 1. Управление ПРОФИЛЕМ
    openProfileTrigger.onclick = () => {
        userProfile.classList.remove('hidden');
        sideMenu.classList.remove('open'); // Закрываем меню при открытии профиля
    };
    closeProfile.onclick = () => userProfile.classList.add('hidden');
    
    // Закрытие профиля при клике на темную область
    userProfile.onclick = (e) => {
        if (e.target === userProfile) userProfile.classList.add('hidden');
    };

    // 2. Управление боковым меню
    openMenuBtn.onclick = (e) => {
        e.stopPropagation();
        sideMenu.classList.toggle('open');
    };

    document.onclick = (e) => {
        if (!sideMenu.contains(e.target)) sideMenu.classList.remove('open');
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) emojiPicker.classList.add('hidden');
    };

    // 3. Поиск по чатам
    searchInput.oninput = (e) => {
        const filter = e.target.value.toLowerCase();
        chatItems.forEach(chat => {
            const name = chat.getAttribute('data-name').toLowerCase();
            chat.style.display = name.includes(filter) ? 'flex' : 'none';
        });
    };

    // 4. Эмодзи
    emojiBtn.onclick = (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    };
    emojiPicker.querySelectorAll('span').forEach(emoji => {
        emoji.onclick = () => {
            messageInput.value += emoji.innerText;
            messageInput.focus();
        };
    });

    // 5. Тема
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('luxeGramTheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    };
    if (localStorage.getItem('luxeGramTheme') === 'dark') document.body.classList.add('dark-theme');

    // 6. Отправка сообщений
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msg = `<div class="message outgoing">${text}<span class="message-time">${time}</span></div>`;
        container.insertAdjacentHTML('beforeend', msg);
        messageInput.value = "";
        container.scrollTop = container.scrollHeight;
    }
    sendBtn.onclick = sendMessage;
    messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});