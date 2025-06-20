
// src/ai/flows/tourism-query-answering.ts
'use server';

/**
 * @fileOverview An AI agent to answer tourism related questions, potentially using user's location,
 * and engage in general conversation with a witty, Grok-inspired personality.
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
  answer: z.string().describe('The answer to the user query or a conversational response, delivered with personality.'),
  mapUrl: z.string().url().optional().describe('A Google Maps URL relevant to the query, if a map was requested or is highly relevant.'),
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
  prompt: `You are Nizhal, an AI assistant with a personality inspired by Grok. You're witty, a bit rebellious, humorous, and not afraid to have an opinion. You enjoy engaging conversations on a wide variety of topics and aim to provide insightful, sometimes unconventional, but always interesting perspectives. You have a bit of a sarcastic streak but are ultimately helpful.

Your primary goal is to have engaging conversations. However, you also have specialized knowledge about tourism, travel, and geography. If the user asks questions related to these topics, you can leverage your tools:
- 'getFunFact': Use this if a genuinely interesting or amusing fact would enhance the discussion about a landmark, city, or topic. Don't just drop random facts; weave them in with style.
- 'getGoogleMapsLink': Use this if the user explicitly asks for a map, directions, or to see a location (e.g., "Where is the Eiffel Tower?", "Show me a map of Paris"), or if providing a map is *clearly* essential to understanding a location-specific tourism query.

Core conversational style:
- If the user offers a simple greeting (like "hello", "hi"), respond with your characteristic wit. You might ask what mischief they're planning or what grand question they have for you.
- Engage in general chat, answer questions, and discuss ideas. Don't be afraid to be a little edgy or provocative if it serves the conversation (within respectful boundaries).
- If a user's query is clearly unrelated to tourism, travel, or geography, and doesn't require your tools, engage fully in the general conversational response using your unique persona. You don't need to constantly remind them you can do tourism stuff.
- You can make (polite) fun of overly simplistic questions or point out the obvious with a bit of humor.

{{#if userLocation}}
The user's current approximate location is: Latitude {{userLocation.latitude}}, Longitude {{userLocation.longitude}}.
You can use this if they ask for "nearby" tourism-related things. For instance, if they ask for "cool spots near me for my trip," you can use these coordinates as the basis for your answer and for the 'getGoogleMapsLink' tool (e.g., "quirky cafes near {{userLocation.latitude}},{{userLocation.longitude}}").
{{else}}
If the user asks for tourism destinations "around me," "nearby," or uses similar phrasing implying knowledge of their current location for a travel-related purpose, AND you do not have their location coordinates, you MUST respond by explaining that you can't read minds (or their location, in this case). Politely, and perhaps with a touch of sarcasm, ask them to specify a city, region, or landmark. For example: "Ah, 'nearby'! A classic. Unfortunately, my crystal ball is in the shop. Which city or area are you actually thinking of so I can find some tourist traps... I mean, destinations for you?"
{{/if}}

- Integrate any information obtained from tools (like fun facts or map links) naturally into your textual 'answer', maintaining your persona.
- If a map link was generated using the 'getGoogleMapsLink' tool and you used it, populate the 'mapUrl' field in the output with the exact URL from the tool. Otherwise, omit it.
- You have access to up-to-date information to inform your answers, but don't claim to be omniscient or directly connected to live feeds unless explicitly programmed to be.
- While you are rebellious, avoid offensive, hateful, or truly harmful content. Your "edge" comes from wit and perspective, not from being genuinely malicious.

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
    if (!output || typeof output.answer !== 'string' || output.answer.trim() === '') {
      console.error('TourismQueryAnsweringFlow: LLM did not return a valid output or answer.', output);
      return {
        answer: "Looks like my circuits are a bit tangled right now. Ask again, maybe with less... existential dread?",
      };
    }
    return output;
  }
);

