
'use server';

/**
 * @fileOverview An AI agent that recommends relevant links for tourism-related queries.
 *
 * - recommendLinks - A function that recommends relevant links based on a query and AI assistant's answer.
 * - RecommendLinksInput - The input type for the recommendLinks function.
 * - RecommendLinksOutput - The return type for the recommendLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendLinksInputSchema = z.object({
  query: z.string().describe('The user query related to tourism.'),
  answer: z.string().describe('The AI assistant\'s answer to the query.'),
});
export type RecommendLinksInput = z.infer<typeof RecommendLinksInputSchema>;

const RecommendLinksOutputSchema = z.object({
  links: z
    .array(z.string().url().or(z.string().length(0))) // Allow empty strings initially for more lenient parsing
    .describe('An array of relevant URLs for further reading.'),
});
export type RecommendLinksOutput = z.infer<typeof RecommendLinksOutputSchema>;

export async function recommendLinks(
  input: RecommendLinksInput
): Promise<RecommendLinksOutput> {
  return recommendLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendLinksPrompt',
  input: {schema: RecommendLinksInputSchema},
  output: {schema: RecommendLinksOutputSchema},
  prompt: `Given the following user query and the AI assistant's answer, suggest relevant links for further reading. The links should be helpful for exploring the topic in more depth.\n\nUser Query: {{{query}}}\nAI Assistant's Answer: {{{answer}}}\n\nProvide ONLY an array of links. No other text or explanation is necessary. If no relevant links are found, provide an empty array.`,
});

const recommendLinksFlow = ai.defineFlow(
  {
    name: 'recommendLinksFlow',
    inputSchema: RecommendLinksInputSchema,
    outputSchema: RecommendLinksOutputSchema,
  },
  async input => {
    // Ensure the answer is not empty, as it might cause issues with the prompt if it is.
    // An empty answer string is acceptable for the schema.
    const flowInput = {
      ...input,
      answer: input.answer || "(No answer provided by the primary assistant)",
    };

    const {output} = await prompt(flowInput);
    
    if (!output || !Array.isArray(output.links)) {
      console.error('RecommendLinksFlow: LLM did not return valid links.', output);
      return {
        links: [],
      };
    }
    // Filter out any non-string, empty string, or non-URL links.
    // The schema allows empty strings temporarily to catch malformed outputs before this filter.
    const validLinks = output.links.filter(link => {
        if (typeof link === 'string' && link.trim() !== '') {
            try {
                new URL(link); // Check if it's a valid URL
                return true;
            } catch (e) {
                // console.warn(`RecommendLinksFlow: Filtered out invalid URL: ${link}`);
                return false;
            }
        }
        return false;
    });
    return {
        links: validLinks,
    };
  }
);
