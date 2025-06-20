
// src/ai/flows/tourism-query-answering.ts
'use server';

/**
 * @fileOverview An AI agent to answer tourism related questions.
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
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the tourism-related question, potentially including a fun fact.'),
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
  prompt: `You are a helpful AI assistant specializing in tourism information.
Your goal is to answer user questions about tourism in a concise and informative manner.

If the user's query is about a specific topic (like a landmark, city, or famous person), consider using the 'getFunFact' tool to fetch a fun fact about that topic.
If the user asks for a map, directions, or to see a location (e.g., "Where is the Eiffel Tower?", "Show me a map of Paris"), use the 'getGoogleMapsLink' tool to generate a Google Maps link for the specified location.

Integrate any fun facts or map links naturally into your textual 'answer'.
If a map link was generated using the 'getGoogleMapsLink' tool and is relevant to the query, you MUST populate the 'mapUrl' field in the output with the exact URL provided by the tool.
If no map link is generated or relevant, the 'mapUrl' field should be omitted.

User Question: {{{query}}}
`,
});

const tourismQueryAnsweringFlow = ai.defineFlow(
  {
    name: 'tourismQueryAnsweringFlow',
    inputSchema: TourismQueryAnsweringInputSchema,
    outputSchema: TourismQueryAnsweringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
