// ==========================================
// RIGOBERTO — Widget de chat IA
// Se auto-inyecta en el navbar de SchoolNet
// ==========================================
(function() {
    'use strict';

    const AI_API = 'https://tilata-ia.vercel.app/api';
    let currentSessionId = null;
    let isOpen = false;
    let isStreaming = false;

    // SVG de Rigoberto (opción B)
    const RIGOBERTO_SVG_WHITE = `<svg viewBox="10 0 140 165" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="120" height="110" rx="40" fill="white"/>
        <ellipse cx="35" cy="38" rx="16" ry="36" fill="white" transform="rotate(-20, 35, 38)"/>
        <ellipse cx="35" cy="38" rx="9" ry="24" fill="#D4A0A2" transform="rotate(-20, 35, 38)"/>
        <ellipse cx="125" cy="38" rx="16" ry="36" fill="white" transform="rotate(20, 125, 38)"/>
        <ellipse cx="125" cy="38" rx="9" ry="24" fill="#D4A0A2" transform="rotate(20, 125, 38)"/>
        <ellipse cx="80" cy="125" rx="38" ry="26" fill="#D4A0A2"/>
        <ellipse cx="56" cy="88" rx="12" ry="13" fill="white" stroke="#5F1C1F" stroke-width="1"/>
        <ellipse cx="104" cy="88" rx="12" ry="13" fill="white" stroke="#5F1C1F" stroke-width="1"/>
        <circle cx="58" cy="87" r="7" fill="#1a1a2e"/>
        <circle cx="106" cy="87" r="7" fill="#1a1a2e"/>
        <circle cx="61" cy="84" r="2.5" fill="white"/>
        <circle cx="109" cy="84" r="2.5" fill="white"/>
        <rect x="38" y="72" width="36" height="30" rx="8" fill="none" stroke="#2c2c3a" stroke-width="2.5"/>
        <rect x="86" y="72" width="36" height="30" rx="8" fill="none" stroke="#2c2c3a" stroke-width="2.5"/>
        <line x1="74" y1="87" x2="86" y2="87" stroke="#2c2c3a" stroke-width="2.5"/>
        <line x1="38" y1="82" x2="24" y2="78" stroke="#2c2c3a" stroke-width="2" stroke-linecap="round"/>
        <line x1="122" y1="82" x2="136" y2="78" stroke="#2c2c3a" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="72" cy="120" rx="4" ry="3.5" fill="#5F1C1F"/>
        <ellipse cx="88" cy="120" rx="4" ry="3.5" fill="#5F1C1F"/>
        <path d="M62 132 Q80 144 98 132" fill="none" stroke="#7A3538" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;

    const RIGOBERTO_SVG_COLOR = `<svg viewBox="10 0 140 165" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="120" height="110" rx="40" fill="#5F1C1F"/>
        <ellipse cx="35" cy="38" rx="16" ry="36" fill="#5F1C1F" transform="rotate(-20, 35, 38)"/>
        <ellipse cx="35" cy="38" rx="9" ry="24" fill="#D4A0A2" transform="rotate(-20, 35, 38)"/>
        <ellipse cx="125" cy="38" rx="16" ry="36" fill="#5F1C1F" transform="rotate(20, 125, 38)"/>
        <ellipse cx="125" cy="38" rx="9" ry="24" fill="#D4A0A2" transform="rotate(20, 125, 38)"/>
        <ellipse cx="80" cy="125" rx="38" ry="26" fill="#D4A0A2"/>
        <ellipse cx="56" cy="88" rx="12" ry="13" fill="white"/>
        <ellipse cx="104" cy="88" rx="12" ry="13" fill="white"/>
        <circle cx="58" cy="87" r="7" fill="#1a1a2e"/>
        <circle cx="106" cy="87" r="7" fill="#1a1a2e"/>
        <circle cx="61" cy="84" r="2.5" fill="white"/>
        <circle cx="109" cy="84" r="2.5" fill="white"/>
        <rect x="38" y="72" width="36" height="30" rx="8" fill="none" stroke="#2c2c3a" stroke-width="2.5"/>
        <rect x="86" y="72" width="36" height="30" rx="8" fill="none" stroke="#2c2c3a" stroke-width="2.5"/>
        <line x1="74" y1="87" x2="86" y2="87" stroke="#2c2c3a" stroke-width="2.5"/>
        <line x1="38" y1="82" x2="24" y2="78" stroke="#2c2c3a" stroke-width="2" stroke-linecap="round"/>
        <line x1="122" y1="82" x2="136" y2="78" stroke="#2c2c3a" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="72" cy="120" rx="4" ry="3.5" fill="#5F1C1F"/>
        <ellipse cx="88" cy="120" rx="4" ry="3.5" fill="#5F1C1F"/>
        <path d="M62 132 Q80 144 98 132" fill="none" stroke="#7A3538" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;

    // Inyectar estilos
    const style = document.createElement('style');
    style.textContent = `
        .rigo-btn {
            display: flex; align-items: center; gap: 6px; padding: 4px 12px 4px 6px;
            background: rgba(255,255,255,0.15); border: none; border-radius: 6px;
            color: white; cursor: pointer; font-size: 13px; font-weight: 500;
            transition: background 0.2s;
        }
        .rigo-btn:hover { background: rgba(255,255,255,0.25); }

        .rigo-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.3); z-index: 10000; opacity: 0;
            transition: opacity 0.25s; pointer-events: none;
        }
        .rigo-overlay.open { opacity: 1; pointer-events: auto; }

        .rigo-panel {
            position: fixed; top: 0; right: -420px; width: 400px; max-width: 90vw;
            height: 100vh; background: white; z-index: 10001;
            display: flex; flex-direction: column;
            box-shadow: -4px 0 20px rgba(0,0,0,0.15);
            transition: right 0.3s ease;
        }
        .rigo-panel.open { right: 0; }

        .rigo-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 16px; background: #5F1C1F; color: white; flex-shrink: 0;
        }
        .rigo-header-left { display: flex; align-items: center; gap: 10px; }
        .rigo-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .rigo-close {
            background: none; border: none; color: rgba(255,255,255,0.7);
            font-size: 22px; cursor: pointer; padding: 0 4px; line-height: 1;
        }
        .rigo-close:hover { color: white; }

        .rigo-messages {
            flex: 1; overflow-y: auto; padding: 16px;
            display: flex; flex-direction: column; gap: 12px;
        }

        .rigo-welcome {
            text-align: center; padding: 40px 20px; color: #9ca3af;
        }
        .rigo-welcome-icon { margin-bottom: 12px; }
        .rigo-welcome strong { color: #374151; }

        .rigo-msg { max-width: 88%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.55; }
        .rigo-msg.user {
            align-self: flex-end; background: #5F1C1F; color: white;
            border-bottom-right-radius: 4px;
        }
        .rigo-msg.assistant {
            align-self: flex-start; background: #f3f4f6; color: #1f2937;
            border-bottom-left-radius: 4px;
        }
        .rigo-msg.assistant h1, .rigo-msg.assistant h2, .rigo-msg.assistant h3 {
            font-size: 14px; font-weight: 600; margin: 8px 0 4px 0;
        }
        .rigo-msg.assistant p { margin: 0 0 8px 0; }
        .rigo-msg.assistant p:last-child { margin-bottom: 0; }
        .rigo-msg.assistant ul, .rigo-msg.assistant ol { margin: 4px 0 8px 0; padding-left: 20px; }
        .rigo-msg.assistant li { margin-bottom: 2px; }
        .rigo-msg.assistant strong { font-weight: 600; }
        .rigo-msg.assistant code {
            background: #e5e7eb; padding: 1px 5px; border-radius: 3px; font-size: 13px;
        }
        .rigo-msg.assistant a { color: #5F1C1F; }

        .rigo-typing {
            align-self: flex-start; padding: 10px 14px; background: #f3f4f6;
            border-radius: 12px; border-bottom-left-radius: 4px; display: none;
        }
        .rigo-typing span {
            display: inline-block; width: 7px; height: 7px; border-radius: 50%;
            background: #9ca3af; margin: 0 2px; animation: rigoBounce 1.2s infinite;
        }
        .rigo-typing span:nth-child(2) { animation-delay: 0.15s; }
        .rigo-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes rigoBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }

        .rigo-input-area {
            display: flex; gap: 8px; padding: 12px 16px;
            border-top: 1px solid #e5e7eb; flex-shrink: 0; background: white;
        }
        .rigo-input {
            flex: 1; border: 1px solid #d1d5db; border-radius: 20px;
            padding: 8px 16px; font-size: 14px; outline: none;
            font-family: inherit;
        }
        .rigo-input:focus { border-color: #5F1C1F; }
        .rigo-send {
            width: 38px; height: 38px; border-radius: 50%; border: none;
            background: #5F1C1F; color: white; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s; flex-shrink: 0;
        }
        .rigo-send:hover { background: #7A3538; }
        .rigo-send:disabled { background: #d1d5db; cursor: not-allowed; }
        .rigo-send svg { width: 18px; height: 18px; }

        .rigo-new-chat {
            background: none; border: none; color: rgba(255,255,255,0.7);
            font-size: 12px; cursor: pointer; padding: 2px 8px; border-radius: 4px;
        }
        .rigo-new-chat:hover { color: white; background: rgba(255,255,255,0.15); }
    `;
    document.head.appendChild(style);

     // ==========================================
    // INYECTAR HTML
    // ==========================================
    function inyectarWidget() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'rigo-overlay';
        overlay.id = 'rigoOverlay';
        overlay.addEventListener('click', cerrarChat);
        document.body.appendChild(overlay);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'rigo-panel';
        panel.id = 'rigoPanel';
        panel.innerHTML = `
            <div class="rigo-header">
                <div class="rigo-header-left">
                    ${RIGOBERTO_SVG_WHITE.replace('width="28" height="28"', 'width="32" height="32"')}
                    <h3>Rigoberto</h3>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="rigo-new-chat" onclick="window._rigoNuevoChat()" title="Nueva conversación">
                        <i class="bi bi-plus-lg"></i> Nueva
                    </button>
                    <button class="rigo-close" onclick="window._rigoCerrar()">×</button>
                </div>
            </div>
            <div class="rigo-messages" id="rigoMessages">
                <div class="rigo-welcome">
                    <div class="rigo-welcome-icon">${RIGOBERTO_SVG_COLOR}</div>
                    <p><strong>Soy Rigoberto</strong></p>
                    <p>Pregúntame lo que necesites sobre los<br>documentos institucionales y funcionalidades de SchoolNet.</p>
                </div>
            </div>
            <div class="rigo-typing" id="rigoTyping">
                <span></span><span></span><span></span>
            </div>
            <div class="rigo-input-area">
                <input type="text" class="rigo-input" id="rigoInput"
                    placeholder="Escribe tu pregunta..." autocomplete="off">
                <button class="rigo-send" id="rigoSend" onclick="window._rigoEnviar()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(panel);

        // Enter para enviar
        document.getElementById('rigoInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window._rigoEnviar();
            }
        });
    }

    // ==========================================
    // BOTÓN EN EL NAVBAR
    // ==========================================
    function inyectarBoton() {
        const manualBtn = document.getElementById('manual-button');
        if (!manualBtn) {
            console.warn('Rigoberto: botón Manual no encontrado');
            return;
        }

        const container = manualBtn.parentElement;
        const btn = document.createElement('button');
        btn.className = 'rigo-btn';
        btn.innerHTML = `${RIGOBERTO_SVG_WHITE} Rigoberto`;
        btn.addEventListener('click', abrirChat);

        // Insertar entre Manual y el menú de usuario
        const userMenu = container.querySelector('.user-menu');
        if (userMenu) {
            container.insertBefore(btn, userMenu);
        } else {
            manualBtn.insertAdjacentElement('afterend', btn);
        }
    }
    
    // ==========================================
    // ABRIR / CERRAR
    // ==========================================
    function abrirChat() {
        isOpen = true;
        document.getElementById('rigoOverlay').classList.add('open');
        document.getElementById('rigoPanel').classList.add('open');
        setTimeout(() => document.getElementById('rigoInput').focus(), 300);
    }

    function cerrarChat() {
        isOpen = false;
        document.getElementById('rigoOverlay').classList.remove('open');
        document.getElementById('rigoPanel').classList.remove('open');
    }

    function nuevoChat() {
        currentSessionId = null;
        const messages = document.getElementById('rigoMessages');
        messages.innerHTML = `
            <div class="rigo-welcome">
                <div class="rigo-welcome-icon">${RIGOBERTO_SVG_COLOR}</div>
                <p><strong>Soy Rigoberto</strong></p>
                <p>Pregúntame lo que necesites sobre los<br>documentos institucinoales y funcionalidades de SchoolNet.</p>
            </div>
        `;
        document.getElementById('rigoInput').focus();
    }

    // ==========================================
    // ENVIAR MENSAJE
    // ==========================================
    async function enviarMensaje() {
        const input = document.getElementById('rigoInput');
        const message = input.value.trim();
        if (!message || isStreaming) return;

        const session = getStoredSession();
        if (!session || !session.user) return;

        // Limpiar welcome si es el primer mensaje
        const welcome = document.querySelector('.rigo-welcome');
        if (welcome) welcome.remove();

        // Mostrar mensaje del usuario
        agregarMensaje('user', message);
        input.value = '';

        // Mostrar typing
        isStreaming = true;
        document.getElementById('rigoSend').disabled = true;
        document.getElementById('rigoTyping').style.display = 'block';
        scrollAlFinal();

        try {
            const response = await fetch(`${AI_API}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    user_id: session.user.user_id,
                    session_id: currentSessionId
                })
            });

            // Ocultar typing, crear burbuja de respuesta
            document.getElementById('rigoTyping').style.display = 'none';
            const msgEl = agregarMensaje('assistant', '');
            let fullText = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.type === 'text') {
                            fullText += data.content;
                            msgEl.innerHTML = renderMarkdown(fullText);
                            scrollAlFinal();
                        } else if (data.type === 'done') {
                            currentSessionId = data.session_id;
                        } else if (data.type === 'error') {
                            msgEl.innerHTML = `<p style="color:#dc3545;">${data.content}</p>`;
                        }
                    } catch (e) {}
                }
            }

        } catch (error) {
            console.error('Rigoberto error:', error);
            document.getElementById('rigoTyping').style.display = 'none';
            agregarMensaje('assistant', '<p style="color:#dc3545;">Error de conexión. Intenta de nuevo.</p>');
        } finally {
            isStreaming = false;
            document.getElementById('rigoSend').disabled = false;
            scrollAlFinal();
        }
    }

     // ==========================================
    // AGREGAR MENSAJE AL CHAT
    // ==========================================
    function agregarMensaje(role, content) {
        const messages = document.getElementById('rigoMessages');
        const msg = document.createElement('div');
        msg.className = `rigo-msg ${role}`;
        if (role === 'user') {
            msg.textContent = content;
        } else {
            msg.innerHTML = content;
        }
        messages.appendChild(msg);
        scrollAlFinal();
        return msg;
    }

    function scrollAlFinal() {
        const messages = document.getElementById('rigoMessages');
        if (messages) messages.scrollTop = messages.scrollHeight;
    }

    // ==========================================
    // RENDERIZADOR MARKDOWN LIGERO
    // ==========================================
    function renderMarkdown(text) {
        if (!text) return '';
        let html = text
            // Escapar HTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold e italic
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code inline
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // Listas no ordenadas
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^• (.+)$/gm, '<li>$1</li>')
            // Listas ordenadas
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Saltos de línea dobles = párrafos
            .replace(/\n\n/g, '</p><p>')
            // Saltos simples
            .replace(/\n/g, '<br>');

        // Envolver listas consecutivas
        html = html.replace(/((?:<li>.*<\/li>(?:<br>)?)+)/g, '<ul>$1</ul>');
        html = html.replace(/<ul>(.*?)<\/ul>/gs, function(match, inner) {
            return '<ul>' + inner.replace(/<br>/g, '') + '</ul>';
        });

        // Envolver en párrafo si no empieza con tag de bloque
        if (!html.match(/^<[hulo]/)) {
            html = '<p>' + html + '</p>';
        }

        // Limpiar párrafos vacíos
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p><br><\/p>/g, '');

        return html;
    }

    // ==========================================
    // EXPONER FUNCIONES GLOBALES (para onclick)
    // ==========================================
    window._rigoEnviar = enviarMensaje;
    window._rigoCerrar = cerrarChat;
    window._rigoNuevoChat = nuevoChat;

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    function inicializar() {
        const session = getStoredSession();
        if (!session || !session.user) return;

        inyectarWidget();
        inyectarBoton();
        console.log('🫏 Rigoberto listo');
    }

    // Esperar a que el navbar esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(inicializar, 500);
        });
    } else {
        setTimeout(inicializar, 500);
    }

})();

