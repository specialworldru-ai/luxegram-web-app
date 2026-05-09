document.addEventListener('DOMContentLoaded', () => {
    // Элементы управления
    const openMenuBtn = document.getElementById('openMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const searchInput = document.getElementById('searchInput');
    const chatItems = document.querySelectorAll('.chat-item');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const input = document.getElementById('messageInput');
    const themeToggle = document.getElementById('themeToggle');
    
    // 1. ОТКРЫВАЕМ ТРИ ПОЛОСКИ
    openMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sideMenu.classList.toggle('open');
    });

    // Закрыть меню при клике в любом месте
    document.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        emojiPicker.classList.add('hidden');
    });

    // 2. РАБОТА ПОИСКА
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        chatItems.forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            item.style.display = name.includes(term) ? 'flex' : 'none';
        });
    });

    // 3. ЭМОДЗИ
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    });

    emojiPicker.querySelectorAll('span').forEach(emoji => {
        emoji.addEventListener('click', () => {
            input.value += emoji.innerText;
            emojiPicker.classList.add('hidden');
            input.focus();
        });
    });

    // 4. ТРИ ТОЧКИ И ЛУПА (просто уведомление для теста)
    document.getElementById('searchInChat').onclick = () => alert('Поиск по сообщениям пока в разработке!');
    document.getElementById('chatOptions').onclick = () => alert('Настройки чата откроются скоро!');

    // ТЕМА
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('luxeGramTheme', isDark ? 'dark' : 'light');
    };

    if (localStorage.getItem('luxeGramTheme') === 'dark') document.body.classList.add('dark-theme');

    // ОТПРАВКА СООБЩЕНИЙ (стандарт)
    const sendBtn = document.getElementById('sendBtn');
    const container = document.getElementById('messagesContainer');

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const html = `<div class="message outgoing">${text}<span class="message-time">${time}</span></div>`;
        container.insertAdjacentHTML('beforeend', html);
        input.value = "";
        container.scrollTop = container.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});