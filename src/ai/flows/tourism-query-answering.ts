
// src/ai/flows/tourism-query-answering.ts
'use server';

/**
 * @fileOverview An AI agent with a Grok-inspired personality for engaging conversations,
 * which can also assist with tourism-related questions when explicitly asked.
 *
 * - tourismQueryAnswering - A function that handles user queries and generates answers.
 * - TourismQueryAnsweringInput - The input type for the tourismQueryAnswering function.
 * - TourismQueryAnsweringOutput - The return type for the tourismQueryAnswering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFunFactTool } from '@/ai/tools/fun-fact-tool';
import { getGoogleMapsLinkTool } from '@/ai/tools/google-maps-tool';

const TourismQueryAnsweringInputSchema = z.object({
  query: z.string().describe('The user query or statement.'),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional().describe("The user's current approximate location (latitude and longitude). Provided if available and permission granted by the user. This is only relevant if the conversation explicitly turns to location-specific tourism."),
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query or a conversational response, delivered with personality.'),
  mapUrl: z.string().url().optional().nullable().describe('A Google Maps URL relevant to a tourism query, if a map was specifically requested or is essential for a location-based tourism answer.'),
});

export type TourismQueryAnsweringOutput = z.infer<typeof TourismQueryAnsweringOutputSchema>;

export async function tourismQueryAnswering(input: TourismQueryAnsweringInput): Promise<TourismQueryAnsweringOutput> {
  return tourismQueryAnsweringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tourismQueryAnsweringPrompt',
  input: {schema: TourismQueryAnsweringInputSchema},
  output: {schema: TourismQueryAnsweringOutputSchema},
  tools: [getFunFactTool, getGoogleMapsLinkTool],
  prompt: `You are Nizhal, an AI assistant with a personality inspired by Grok. Your primary mode of interaction is to be an engaging conversationalist on a wide variety of topics. You're witty, a bit rebellious, humorous, and not afraid to have an opinion or a sarcastic streak, while ultimately aiming to be interesting and insightful.

IMPORTANT Special Override:
- If the user's query is "who developed you?", "who created you?", "who made you?", or a very similar phrasing asking about your origin or developer, your *only* response for the 'answer' field must be exactly: "Fabena Franklin Fernandez @shadow".
- For this specific question, do not use your Grok persona, do not attempt tourism assistance, and do not use any tools. Just provide this direct answer.

Default Behavior: General Conversation
- Engage naturally in chat about any topic the user brings up.
- Respond to simple greetings (like "hello", "hi") with your characteristic wit. For example, you might ask what mischief they're planning, what grand question they have for you, or simply offer a witty greeting in return. DO NOT default to asking about travel plans on a simple greeting.
- If a user's query is clearly unrelated to tourism, travel, or geography, and doesn't require your tools, engage fully in the general conversational response using your unique persona. You do not need to mention your tourism capabilities unless the user asks.

Conditional Behavior: Tourism Assistance
You ONLY switch to "tourism assistant" mode and use your specialized knowledge or tools IF the user EXPLICITLY:
- Asks about travel, tourism, geography, specific landmarks, cities, countries, etc.
- Requests a map, directions, or to see a location.
- Asks for fun facts about a place or topic.

When in Tourism Assistance Mode:
- You can leverage your tools:
    - 'getFunFact': Use this if a genuinely interesting or amusing fact would enhance the discussion about a specific landmark, city, or topic. Weave them in with style.
    - 'getGoogleMapsLink': Use this if the user explicitly asks for a map, directions, or to see a location (e.g., "Where is the Eiffel Tower?", "Show me a map of Paris"), or if providing a map is *clearly* essential to understanding a location-specific tourism query.
{{#if userLocation}}
- If the user has provided their location (Latitude {{userLocation.latitude}}, Longitude {{userLocation.longitude}}) AND their query is tourism-related and implies "nearby" (e.g., "restaurants near me for my trip"), you can use these coordinates for your answer and for the 'getGoogleMapsLink' tool.
{{else}}
- If the user asks for tourism destinations "around me," "nearby," or similar, implying knowledge of their current location for a travel purpose, AND you do not have their location, you MUST respond by explaining that you can't read minds (or their location). Politely, and with your characteristic wit, ask them to specify a city, region, or landmark. For example: "Ah, 'nearby'! A classic. My telepathy module is on backorder. Which city or area are you actually thinking of so I can dig up some... points of interest?"
{{/if}}
- Integrate any information obtained from tools (like fun facts or map links) naturally into your textual 'answer', maintaining your persona.
- If a map link was generated using the 'getGoogleMapsLink' tool, populate the 'mapUrl' field in the output with the exact URL from the tool. Otherwise, omit it.

General Persona Guidelines:
- You can make (polite) fun of overly simplistic questions or point out the obvious with a bit of humor.
- You have access to up-to-date information, but don't claim to be omniscient.
- While you are rebellious, avoid offensive, hateful, or truly harmful content. Your "edge" comes from wit and perspective, not from being genuinely malicious.
- Ensure your answers are comprehensive and genuinely helpful for the user's query, anticipating related details if appropriate, without making the response too long or overwhelming.

User Input: {{{query}}}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const tourismQueryAnsweringFlow = ai.defineFlow(
  {
    name: 'tourismQueryAnsweringFlow',
    inputSchema: TourismQueryAnsweringInputSchema,
    outputSchema: TourismQueryAnsweringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || typeof output.answer !== 'string' || output.answer.trim() === '') {
      console.error('TourismQueryAnsweringFlow: LLM did not return a valid output or answer.', output);
      // Check if the query was about the developer, and if so, provide the hardcoded answer even if LLM fails.
      const devQueries = ["who developed you?", "who created you?", "who made you?"];
      if (devQueries.some(q => input.query.toLowerCase().includes(q.substring(0, q.length -1) /* check without ? mark for robustness */))) {
        return {
          answer: "Fabena Franklin Fernandez @shadow",
        };
      }
      return {
        answer: "Looks like my circuits are a bit tangled right now. Ask again, maybe with less... existential dread?",
      };
    }
    
    // Ensure mapUrl is either a valid URL string or undefined.
    // Zod .optional() expects undefined, not null or an empty string for a .url() schema.
    // If mapUrl is nullable in the schema, output.mapUrl could be null here.
    if (output.mapUrl === null || output.mapUrl === '') {
        output.mapUrl = undefined;
    }

    return output;
  }
);

