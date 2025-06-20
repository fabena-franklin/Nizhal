
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'production') {
  // This warning is primarily for local development. In a deployed Firebase environment,
  // API keys might be injected or configured differently.
  console.warn(
    `\n🔴 Nizhal Navigator Alert: GEMINI_API_KEY or GOOGLE_API_KEY is not set.` +
    `\n   AI features will not work until this is configured.` +
    `\n   Please create a .env file in the root of your project (if it doesn't exist) and add:` +
    `\n   GEMINI_API_KEY=your_actual_api_key_here` +
    `\n   For more details on Genkit and Google AI, see https://firebase.google.com/docs/genkit/plugins/google-genai\n`
  );
}

export const ai = genkit({
  plugins: [
    // The googleAI plugin will internally look for GEMINI_API_KEY or GOOGLE_API_KEY
    // from process.env if not explicitly provided or if an empty options object is passed.
    // We pass the apiKey explicitly if found to ensure it's used, otherwise,
    // we pass an empty object to let the plugin attempt its default environment variable lookup.
    googleAI(apiKey ? { apiKey } : {}),
  ],
  model: 'googleai/gemini-2.0-flash',
});
