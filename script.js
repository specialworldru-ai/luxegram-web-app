document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const container = document.getElementById('messagesContainer');

    function sendMessage() {
        const text = input.value.trim();
        if (text === "") return;

        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" + 
                     now.getMinutes().toString().padStart(2, '0');

        const messageHtml = `
            <div class="message outgoing">
                <div class="message-content">
                    ${text}
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', messageHtml);
        input.value = "";
        
        // Автопрокрутка вниз
        container.scrollTop = container.scrollHeight;

        // Имитация ответа (опционально)
        setTimeout(() => {
            botReply();
        }, 1000);
    }

    function botReply() {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const replyHtml = `
            <div class="message incoming">
                <div class="message-content">
                    Это автоматический ответ LuxeGram. Выглядит круто!
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', replyHtml);
        container.scrollTop = container.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});