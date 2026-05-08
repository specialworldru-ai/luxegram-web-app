function send() {
    let input = document.getElementById('msgInput');
    if (input.value) {
        let div = document.createElement('div');
        div.className = 'msg';
        div.textContent = input.value;
        document.getElementById('messages').appendChild(div);
        input.value = '';
    }
}