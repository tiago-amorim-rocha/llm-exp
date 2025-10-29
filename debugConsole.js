// debugConsole.js - Debug UI with console logging

export function initDebugConsole() {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    maxHeight: '40vh',
    background: 'rgba(0, 0, 0, 0.95)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    overflowY: 'auto',
    borderTop: '2px solid #333',
    display: 'none',
    zIndex: '10000',
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '8px 10px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const title = document.createElement('span');
  title.textContent = 'Debug Console';
  title.style.fontWeight = 'bold';

  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, {
    display: 'flex',
    gap: '8px',
  });

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy';
  Object.assign(copyBtn.style, {
    padding: '4px 8px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
  });

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  Object.assign(clearBtn.style, {
    padding: '4px 8px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
  });

  buttonContainer.appendChild(copyBtn);
  buttonContainer.appendChild(clearBtn);

  header.appendChild(title);
  header.appendChild(buttonContainer);

  const messages = document.createElement('div');
  Object.assign(messages.style, {
    padding: '10px',
    maxHeight: 'calc(40vh - 40px)',
    overflowY: 'auto',
  });

  container.appendChild(header);
  container.appendChild(messages);
  document.body.appendChild(container);

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🐛';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: '#333',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: '10001',
  });
  document.body.appendChild(toggleBtn);

  let isVisible = false;
  toggleBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    container.style.display = isVisible ? 'block' : 'none';
    toggleBtn.textContent = isVisible ? '✕' : '🐛';
  });

  copyBtn.addEventListener('click', async () => {
    const text = messages.innerText;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = '#4caf50';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#333';
      }, 2000);
    } catch (err) {
      copyBtn.textContent = 'Failed';
      copyBtn.style.background = '#f44336';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.style.background = '#333';
      }, 2000);
      console.error('Copy failed:', err);
    }
  });

  clearBtn.addEventListener('click', () => (messages.innerHTML = ''));

  function addMessage(type, args) {
    const msg = document.createElement('div');
    Object.assign(msg.style, {
      padding: '4px 0',
      borderBottom: '1px solid #222',
    });

    const timestamp = new Date().toLocaleTimeString();
    const typeColors = { log: '#aaa', warn: '#ff9800', error: '#f44336', info: '#2196f3' };

    const typeSpan = document.createElement('span');
    typeSpan.textContent = `[${timestamp}] [${type.toUpperCase()}] `;
    typeSpan.style.color = typeColors[type] || '#aaa';

    const contentSpan = document.createElement('span');
    contentSpan.textContent = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
      .join(' ');

    msg.appendChild(typeSpan);
    msg.appendChild(contentSpan);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  const orig = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  console.log = (...a) => (orig.log(...a), addMessage('log', a));
  console.warn = (...a) => (orig.warn(...a), addMessage('warn', a));
  console.error = (...a) => (orig.error(...a), addMessage('error', a));
  console.info = (...a) => (orig.info(...a), addMessage('info', a));

  window.addEventListener('error', (e) =>
    addMessage('error', [`Uncaught: ${e.message}`, `at ${e.filename}:${e.lineno}:${e.colno}`])
  );
  window.addEventListener('unhandledrejection', (e) =>
    addMessage('error', [`Unhandled Promise Rejection: ${e.reason}`])
  );

  console.log('Debug console initialized. Click 🐛 to toggle.');
  return { container, toggleBtn };
}
