document.addEventListener('DOMContentLoaded', () => {
    const chatData = {
        'support': [{ text: "Система LuxeGram готова к работе!", time: "12:00", type: "incoming" }],
        'durov': [{ text: "Привет! Как продвигается разработка LuxeGram?", time: "14:20", type: "incoming" }]
    };

    let activeChatId = 'support';

    const container = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const notifySound = document.getElementById('notifySound');
    const sideMenu = document.getElementById('sideMenu');
    const userProfile = document.getElementById('userProfile');

    function renderMessages() {
        container.innerHTML = '';
        (chatData[activeChatId] || []).forEach(msg => {
            const html = `<div class="message ${msg.type}">${msg.text}<span style="font-size:10px; margin-left:10px; opacity:0.6">${msg.time}</span></div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
        container.scrollTop = container.scrollHeight;
    }

    document.querySelectorAll('.chat-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeChatId = item.getAttribute('data-id');
            document.getElementById('currentChatName').innerText = item.getAttribute('data-name');
            renderMessages();
        };
    });

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

    document.getElementById('openMenuBtn').onclick = (e) => { e.stopPropagation(); sideMenu.classList.add('open'); };
    document.getElementById('openProfileTrigger').onclick = (e) => {
        e.stopPropagation();
        userProfile.classList.remove('hidden');
        sideMenu.classList.remove('open');
    };
    document.getElementById('closeProfile').onclick = () => userProfile.classList.add('hidden');

    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target)) sideMenu.classList.remove('open');
        if (e.target === userProfile) userProfile.classList.add('hidden');
    });

    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.toggle('dark-theme');
    };

    renderMessages();
});