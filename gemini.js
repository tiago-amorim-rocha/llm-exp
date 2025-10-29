// gemini.js - Gemini API integration

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCpWEffL6jIpkSkUfZu-jj3BC_btV-piRk';
const GEMINI_MODEL = 'gemini-2.5-flash'; // Fast, simple model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Call Gemini API with a prompt and return the generated text
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise<string>} The generated response text
 * @throws {Error} If the API call fails
 */
export async function callGemini(prompt) {
  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 50) + '...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the text from the response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Unexpected response format:', data);
      throw new Error('Unexpected response format from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
