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

const TourismQueryAnsweringInputSchema = z.object({
  query: z.string().describe('The tourism-related question asked by the user.'),
});

export type TourismQueryAnsweringInput = z.infer<typeof TourismQueryAnsweringInputSchema>;

const TourismQueryAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the tourism-related question.'),
});

export type TourismQueryAnsweringOutput = z.infer<typeof TourismQueryAnsweringOutputSchema>;

export async function tourismQueryAnswering(input: TourismQueryAnsweringInput): Promise<TourismQueryAnsweringOutput> {
  return tourismQueryAnsweringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tourismQueryAnsweringPrompt',
  input: {schema: TourismQueryAnsweringInputSchema},
  output: {schema: TourismQueryAnsweringOutputSchema},
  prompt: `You are a helpful AI assistant specializing in tourism information.
  Your goal is to answer user questions about tourism in a concise and informative manner.

  Question: {{{query}}}
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
