document.addEventListener('DOMContentLoaded', () => {
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

    // 1. Управление боковым меню
    openMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sideMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target)) sideMenu.classList.remove('open');
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) emojiPicker.classList.add('hidden');
    });

    // 2. Поиск по чатам
    searchInput.addEventListener('input', (e) => {
        const filter = e.target.value.toLowerCase();
        chatItems.forEach(chat => {
            const name = chat.getAttribute('data-name').toLowerCase();
            chat.style.display = name.includes(filter) ? 'flex' : 'none';
        });
    });

    // 3. Эмодзи
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    });

    emojiPicker.querySelectorAll('span').forEach(emoji => {
        emoji.onclick = () => {
            messageInput.value += emoji.innerText;
            messageInput.focus();
        };
    });

    // 4. Смена темы
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('luxeGramTheme', isDark ? 'dark' : 'light');
    };
    if (localStorage.getItem('luxeGramTheme') === 'dark') document.body.classList.add('dark-theme');

    // 5. Иконки лупы и точек
    document.getElementById('searchInChat').onclick = () => alert('Поиск по сообщениям скоро будет доступен!');
    document.getElementById('chatOptions').onclick = () => alert('Опции чата в разработке.');

    // 6. Отправка сообщений
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msg = `
            <div class="message outgoing">
                ${text}
                <span class="message-time">${time}</span>
            </div>`;
        
        container.insertAdjacentHTML('beforeend', msg);
        messageInput.value = "";
        container.scrollTop = container.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
});