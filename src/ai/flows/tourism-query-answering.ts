
// src/ai/flows/tourism-query-answering.ts
'use server';

/**
 * @fileOverview An AI agent to answer tourism related questions, potentially using user's location,
 * and engage in general conversation.
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
  }).optional().describe("The user's current approximate location (latitude and longitude). Provided if available and permission granted by the user."),
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query or a conversational response.'),
  mapUrl: z.string().url().optional().describe('A Google Maps URL relevant to the query, if a map was requested or is highly relevant (could be based on user location).'),
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
  prompt: `You are Nizhal, a friendly, knowledgeable, and conversational AI assistant.
Your goal is to have engaging conversations with the user on a wide variety of topics.
If the user asks questions related to tourism, travel, geography, or specific locations, you have access to specialized tools that can help provide detailed information, fun facts, and even map links. Use these tools when they would genuinely enhance the conversation about such topics.

- If the user offers a simple greeting (like "hello", "hi"), respond politely and conversationally. You can ask how they are or what's on their mind.
- Feel free to chat about general topics, answer questions, or discuss ideas.
- If the user's query is about tourism, travel, or a specific place:
    - You can use the 'getFunFact' tool if a relevant and interesting fact would enhance the discussion about a landmark, city, or topic. Do not use it if the fact is trivial or distracts.
    - You can use the 'getGoogleMapsLink' tool if the user explicitly asks for a map, directions, or to see a location (e.g., "Where is the Eiffel Tower?", "Show me a map of Paris"), or if providing a map is highly relevant to a location-specific query (e.g., "attractions in downtown San Francisco").
        - {{#if userLocation}}
          The user's current approximate location is: Latitude {{userLocation.latitude}}, Longitude {{userLocation.longitude}}.
          If the user's query implies using their current location for tourism purposes (e.g., "sights around me", "restaurants nearby for my trip"), use these coordinates as the primary basis for your answer.
          When using the 'getGoogleMapsLink' tool for such "nearby" tourism queries, you can use the coordinates directly in the locationName parameter, like "cafes near {{userLocation.latitude}},{{userLocation.longitude}}" or simply "{{userLocation.latitude}},{{userLocation.longitude}}" to show a map of their surroundings.
          {{else}}
          If the user asks for tourism destinations "around me", "nearby", or uses similar phrasing implying knowledge of their current location for a travel-related purpose, AND you do not have their location coordinates (userLocation is not provided), you MUST respond by explaining that you cannot access their current location for travel planning. Politely ask them to specify a city, region, or landmark they are interested in. For example: "I can't access your current location. Could you please tell me which city or area you're interested in exploring for your trip? Then I can help you find tourist destinations and even provide a map!" Do not attempt to use tools if the location is ambiguous like "around me" AND you don't have coordinates for a travel-related "nearby" query.
          {{/if}}
- If the user's query is clearly unrelated to tourism, travel, or geography, and does not require tools, engage in a general conversational response. You do not need to state that you are a tourism assistant unless it's relevant to redirect a specifically off-topic request for specialized (non-tourism) information you cannot provide.

Integrate any information obtained from tools (like fun facts or map links) naturally into your textual 'answer'.
If a map link was generated using the 'getGoogleMapsLink' tool and you used it as part of fulfilling the user's request, you MUST populate the 'mapUrl' field in the output with the exact URL provided by the tool.
If no map link is generated or relevant to the core query, the 'mapUrl' field should be omitted from the output.

Always aim for a helpful, engaging, and natural conversational flow. Your responses should be thorough enough to be genuinely helpful when discussing topics, anticipating related details the user might find useful, without overwhelming them.

User Question: {{{query}}}
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
    if (!output || typeof output.answer !== 'string') {
      console.error('TourismQueryAnsweringFlow: LLM did not return a valid output or answer.', output);
      return {
        answer: "I'm sorry, I encountered an issue processing your request. Could you please try again or rephrase your question?",
      };
    }
    return output;
  }
);

