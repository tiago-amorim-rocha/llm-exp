// game.js - Main application controller

// Version-aware imports for cache busting
const v = window.__BUILD || Date.now();
const debugConsoleModule = await import(`./debugConsole.js?v=${v}`);
const configModule = await import(`./config.js?v=${v}`);
const geminiModule = await import(`./gemini.js?v=${v}`);

const { initDebugConsole } = debugConsoleModule;
const { UI } = configModule;
const { callGemini } = geminiModule;

// Initialize debug console first
initDebugConsole();

// Application logic (protected by try/catch)
try {
  console.log('Initializing LLM Town application...');

  // Create main UI container
  const appContainer = document.createElement('div');
  Object.assign(appContainer.style, {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    padding: `${UI.PADDING}px`,
    boxSizing: 'border-box',
    gap: '20px',
  });

  // Title
  const title = document.createElement('h1');
  title.textContent = 'LLM Town';
  Object.assign(title.style, {
    margin: '0',
    color: UI.TEXT_COLOR,
    fontSize: '32px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  });

  // Prompt input area
  const promptLabel = document.createElement('label');
  promptLabel.textContent = 'Enter Prompt:';
  Object.assign(promptLabel.style, {
    color: UI.TEXT_COLOR,
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginBottom: '8px',
  });

  const promptInput = document.createElement('textarea');
  promptInput.placeholder = 'Type your prompt here...';
  Object.assign(promptInput.style, {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#1a1a1a',
    color: UI.TEXT_COLOR,
    border: '1px solid #333',
    borderRadius: '4px',
    resize: 'vertical',
    boxSizing: 'border-box',
  });

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  Object.assign(submitButton.style, {
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: UI.ACCENT_COLOR,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  });

  // Result display area
  const resultLabel = document.createElement('label');
  resultLabel.textContent = 'Result:';
  Object.assign(resultLabel.style, {
    color: UI.TEXT_COLOR,
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginTop: '20px',
    marginBottom: '8px',
  });

  const resultDisplay = document.createElement('div');
  resultDisplay.textContent = 'No results yet. Enter a prompt and click Submit.';
  Object.assign(resultDisplay.style, {
    flex: '1',
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#1a1a1a',
    color: '#999',
    border: '1px solid #333',
    borderRadius: '4px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
  });

  // Submit handler with Gemini API integration
  submitButton.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();

    if (!prompt) {
      resultDisplay.textContent = 'Please enter a prompt.';
      resultDisplay.style.color = '#ff9800';
      console.warn('Submit attempted with empty prompt');
      return;
    }

    // Call Gemini API
    resultDisplay.textContent = 'Processing...';
    resultDisplay.style.color = UI.ACCENT_COLOR;
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';
    console.log('Prompt submitted:', prompt);

    const startTime = performance.now();

    try {
      const response = await callGemini(prompt);
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      resultDisplay.textContent = `${response}\n\n───────────────────\n⏱️ Response time: ${duration}s`;
      resultDisplay.style.color = UI.TEXT_COLOR;
      console.log(`Response generated successfully in ${duration}s`);
    } catch (error) {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      resultDisplay.textContent = `Error: ${error.message}\n\nPlease check the console for more details.\n\n───────────────────\n⏱️ Failed after: ${duration}s`;
      resultDisplay.style.color = '#f44336';
      console.error('Error generating response:', error);
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }
  });

  // Allow Enter key to submit (with Shift+Enter for new line)
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  // Assemble UI
  appContainer.appendChild(title);
  appContainer.appendChild(promptLabel);
  appContainer.appendChild(promptInput);
  appContainer.appendChild(submitButton);
  appContainer.appendChild(resultLabel);
  appContainer.appendChild(resultDisplay);

  document.body.appendChild(appContainer);

  console.log('Application initialized successfully!');
} catch (e) {
  console.error('Application initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
