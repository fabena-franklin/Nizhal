
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

const TourismQueryAnsweringInputSchema = z.object({
  query: z.string().describe('The tourism-related question asked by the user.'),
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the tourism-related question, potentially including a fun fact.'),
});

export type TourismQueryAnsweringOutput = z.infer<typeof TourismQueryAnsweringOutputSchema>;

export async function tourismQueryAnswering(input: TourismQueryAnsweringInput): Promise<TourismQueryAnsweringOutput> {
  return tourismQueryAnsweringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tourismQueryAnsweringPrompt',
  input: {schema: TourismQueryAnsweringInputSchema},
  output: {schema: TourismQueryAnsweringOutputSchema},
  tools: [getFunFactTool],
  prompt: `You are a helpful AI assistant specializing in tourism information.
Your goal is to answer user questions about tourism in a concise and informative manner.
If the user's query is about a specific topic (like a landmark, city, or famous person), consider using the 'getFunFact' tool to fetch a fun fact about that topic.
If you use the tool and receive a fact, integrate it naturally into your answer. For example, you could say "Speaking of [topic], did you know that [fun fact]?" or a similar phrasing.
If the tool doesn't provide a specific fact, or if the query is too broad, just answer the question based on your general knowledge.

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
