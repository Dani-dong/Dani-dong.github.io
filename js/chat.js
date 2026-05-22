/**
 * Dani-dong Portfolio Custom Chatbot Widget
 * 100% Native, High Performance, Responsive & Theme-aware
 */

(function () {
  // 1. Get configuration
  const config = window.ChatWidgetConfig || {
    webhook: { url: '' },
    branding: {
      name: 'dang AI',
      logo: 'https://github.com/Dani-dong.png',
      welcomeText: '안녕하세요! 저에 대해 궁금한 점을 물어보세요 😊',
      responseTimeText: '잠시 후 답변드릴게요'
    },
    style: {
      primaryColor: '#5c6bc0',
      position: 'right'
    }
  };

  if (!config.webhook || !config.webhook.url) {
    console.error('ChatWidgetConfig.webhook.url is missing!');
    return;
  }

  const primaryColor = (config.style && config.style.primaryColor) || '#5c6bc0';
  const position = (config.style && config.style.position) || 'right';
  const botName = (config.branding && config.branding.name) || 'dang AI';
  const botLogo = (config.branding && config.branding.logo) || 'https://github.com/Dani-dong.png';
  const welcomeText = (config.branding && config.branding.welcomeText) || '안녕하세요! 저에 대해 궁금한 점을 물어보세요 😊';
  const responseTimeText = (config.branding && config.branding.responseTimeText) || '잠시 후 답변드릴게요';

  // Generate or retrieve Session ID for n8n memory mapping
  let sessionId = sessionStorage.getItem('portfolio_chat_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('portfolio_chat_session_id', sessionId);
  }

  // 2. Inject CSS styles
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    #custom-chat-widget {
      position: fixed;
      bottom: 25px;
      ${position}: 25px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    /* FAB Button */
    .chat-fab {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${primaryColor}, #3f51b5);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
    }
    .chat-fab:hover {
      transform: scale(1.08) rotate(5deg);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
    }
    .chat-fab svg {
      width: 26px;
      height: 26px;
      fill: #ffffff;
      transition: transform 0.3s;
    }
    .chat-fab.active svg {
      transform: rotate(90deg);
    }
    
    /* Chat Window */
    .chat-window {
      position: absolute;
      bottom: 75px;
      ${position}: 0;
      width: 370px;
      height: 520px;
      border-radius: 16px;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color, #e9ecef);
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s;
    }
    .chat-window.active {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    
    /* Header */
    .chat-header {
      padding: 16px;
      background: linear-gradient(135deg, ${primaryColor}, #3f51b5);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.8);
      background-color: #fff;
    }
    .chat-title-container {
      display: flex;
      flex-direction: column;
    }
    .chat-title {
      font-weight: 600;
      font-size: 15px;
      color: #ffffff !important;
      margin: 0 !important;
    }
    .chat-status {
      font-size: 11px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .chat-close-btn {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .chat-close-btn:hover {
      opacity: 1;
    }
    
    /* Chat Body */
    .chat-body {
      flex-grow: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background-color: var(--bg-color, #f8f9fa);
    }
    .chat-body::-webkit-scrollbar {
      width: 5px;
    }
    .chat-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .chat-body::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }
    [data-theme='dark'] .chat-body::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.15);
    }
    
    /* Messages */
    .chat-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      animation: msgFadeIn 0.25s ease forwards;
    }
    @keyframes msgFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chat-msg.bot {
      align-self: flex-start;
      background-color: var(--card-bg, #ffffff);
      color: var(--text-color, #333333);
      border: 1px solid var(--border-color, #e9ecef);
      border-top-left-radius: 2px;
    }
    .chat-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, ${primaryColor}, #3f51b5);
      color: #ffffff;
      border-top-right-radius: 2px;
    }
    
    /* Typing Indicator */
    .chat-typing {
      align-self: flex-start;
      background-color: var(--card-bg, #ffffff);
      padding: 12px 16px;
      border-radius: 14px;
      border-top-left-radius: 2px;
      border: 1px solid var(--border-color, #e9ecef);
      display: none;
      align-items: center;
      gap: 4px;
    }
    .chat-typing span {
      width: 6px;
      height: 6px;
      background-color: #888888;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .chat-typing span:nth-child(1) { animation-delay: -0.32s; }
    .chat-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
    
    /* Footer & Input */
    .chat-footer {
      padding: 12px;
      background-color: var(--card-bg, #ffffff);
      border-top: 1px solid var(--border-color, #e9ecef);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .chat-input {
      flex-grow: 1;
      border: 1px solid var(--border-color, #e9ecef);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      outline: none;
      background-color: var(--bg-color, #f8f9fa);
      color: var(--text-color, #333333);
      resize: none;
      height: 38px;
      line-height: 1.4;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    .chat-input:focus {
      border-color: ${primaryColor};
    }
    .chat-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${primaryColor}, #3f51b5);
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .chat-send-btn:hover {
      transform: scale(1.05);
    }
    .chat-send-btn svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
      margin-left: 2px;
    }
  `;
  document.head.appendChild(styleEl);

  // 3. Inject Widget HTML
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'custom-chat-widget';
  widgetContainer.innerHTML = `
    <!-- Chat Window -->
    <div class="chat-window" id="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-info">
          <img class="chat-avatar" src="${botLogo}" alt="${botName} Logo">
          <div class="chat-title-container">
            <h4 class="chat-title">${botName}</h4>
            <span class="chat-status">${responseTimeText}</span>
          </div>
        </div>
        <button class="chat-close-btn" id="chat-close">&times;</button>
      </div>
      
      <!-- Body (Messages) -->
      <div class="chat-body" id="chat-body">
        <div class="chat-msg bot">${welcomeText}</div>
        
        <!-- Typing Animation -->
        <div class="chat-typing" id="chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <!-- Footer (Input) -->
      <div class="chat-footer">
        <input type="text" class="chat-input" id="chat-input" placeholder="메시지를 입력하세요..." autocomplete="off">
        <button class="chat-send-btn" id="chat-send" aria-label="메시지 전송">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Floating Button (FAB) -->
    <div class="chat-fab" id="chat-fab" aria-label="챗봇 열기">
      <svg viewBox="0 0 24 24" id="chat-icon-open">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"></path>
      </svg>
      <svg viewBox="0 0 24 24" id="chat-icon-close" style="display: none;">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
      </svg>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 4. Widget Logic
  const fab = document.getElementById('chat-fab');
  const windowEl = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const inputEl = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const typingIndicator = document.getElementById('chat-typing');
  
  const iconOpen = document.getElementById('chat-icon-open');
  const iconClose = document.getElementById('chat-icon-close');

  // Toggle Chat
  function toggleChat() {
    const isActive = windowEl.classList.toggle('active');
    fab.classList.toggle('active');
    
    if (isActive) {
      iconOpen.style.display = 'none';
      iconClose.style.display = 'block';
      setTimeout(() => inputEl.focus(), 150);
    } else {
      iconOpen.style.display = 'block';
      iconClose.style.display = 'none';
    }
  }

  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Scroll to Bottom
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Add Message
  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', sender);
    msg.innerText = text;
    
    // Insert before typing indicator
    chatBody.insertBefore(msg, typingIndicator);
    scrollToBottom();
  }

  // Send Message to n8n Webhook
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Clear input
    inputEl.value = '';
    
    // Add user message to UI
    addMessage(text, 'user');
    
    // Show typing indicator
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    try {
      const response = await fetch(config.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          chatInput: text,
          action: 'sendMessage'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }

      const data = await response.json();
      
      // Hide typing indicator
      typingIndicator.style.display = 'none';

      // Determine answer output
      let botResponse = '';
      if (data && data.output) {
        botResponse = data.output;
      } else if (data && typeof data === 'object') {
        botResponse = data.message || JSON.stringify(data);
      } else {
        botResponse = '대답을 수신하는 데 실패했습니다.';
      }

      // Add bot response to UI
      addMessage(botResponse, 'bot');

    } catch (error) {
      console.error('Error sending message:', error);
      typingIndicator.style.display = 'none';
      addMessage('죄송합니다. 서버 통신 중 오류가 발생했습니다.', 'bot');
    }
  }

  // Bind Events
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

})();
