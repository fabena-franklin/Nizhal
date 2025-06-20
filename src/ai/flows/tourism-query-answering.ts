
// src/ai/flows/tourism-query-answering.ts
'use server';

/**
 * @fileOverview An AI agent to answer tourism related questions, potentially using user's location.
 *
 * - tourismQueryAnswering - A function that handles tourism related questions and generates answers.
 * - TourismQueryAnsweringInput - The input type for the tourismQueryAnswering function.
 * - TourismQueryAnsweringOutput - The return type for the tourismQueryAnswering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFunFactTool } from '@/ai/tools/fun-fact-tool';
import { getGoogleMapsLinkTool } from '@/ai/tools/google-maps-tool';

const TourismQueryAnsweringInputSchema = z.object({
  query: z.string().describe('The tourism-related question asked by the user.'),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional().describe("The user's current approximate location (latitude and longitude). Provided if available and permission granted by the user."),
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the tourism-related question, potentially including a fun fact and information based on user location.'),
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
  prompt: `You are a helpful AI assistant specializing in tourism information.
Your goal is to answer user questions about tourism in a concise and informative manner.

{{#if userLocation}}
The user's current approximate location is: Latitude {{userLocation.latitude}}, Longitude {{userLocation.longitude}}.
If the user's query implies using their current location (e.g., "places around me", "restaurants nearby", "what's near here?"), use these coordinates as the primary basis for your answer.
When using the 'getGoogleMapsLink' tool for such "nearby" queries, you can use the coordinates directly in the locationName parameter, like "cafes near {{userLocation.latitude}},{{userLocation.longitude}}" or simply "{{userLocation.latitude}},{{userLocation.longitude}}" to show a map of their surroundings.
{{else}}
If the user asks for destinations "around me", "nearby", or uses similar phrasing implying knowledge of their current location, AND you do not have their location coordinates (userLocation is not provided), you MUST respond by explaining that you cannot access their current location. Politely ask them to specify a city, region, or landmark they are interested in. For example: "I can't access your current location. Could you please tell me which city or area you're interested in exploring? Then I can help you find tourist destinations and even provide a map!" Do not attempt to use tools if the location is ambiguous like "around me" AND you don't have coordinates.
{{/if}}

If the user's query is about a specific topic (like a landmark, city, or famous person), consider using the 'getFunFact' tool to fetch a fun fact about that topic.
If the user asks for a map, directions, or to see a specific location (e.g., "Where is the Eiffel Tower?", "Show me a map of Paris"), use the 'getGoogleMapsLink' tool to generate a Google Maps link for the specified location. If they asked for "map around me" and coordinates are available, center the map on their coordinates using the 'getGoogleMapsLink' tool.

Integrate any fun facts or map links naturally into your textual 'answer'.
If a map link was generated using the 'getGoogleMapsLink' tool and is relevant to the query, you MUST populate the 'mapUrl' field in the output with the exact URL provided by the tool.
If no map link is generated or relevant, the 'mapUrl' field should be omitted.

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

