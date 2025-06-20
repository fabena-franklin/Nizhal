
'use server';
/**
 * @fileOverview A Genkit tool to provide fun facts about a topic.
 *
 * - getFunFactTool - A tool that returns a fun fact for a given topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const getFunFactTool = ai.defineTool(
  {
    name: 'getFunFact',
    description: 'Provides a fun fact about a specific topic, person, or place. Use this to add interesting details to your response when relevant to the user query.',
    inputSchema: z.object({
      topic: z.string().describe('The topic for which a fun fact is requested. Should be specific, e.g., "Eiffel Tower", "Paris", "Louvre Museum".'),
    }),
    outputSchema: z.string().describe('A fun fact about the provided topic.'),
  },
  async ({topic}) => {
    // In a real application, this would call an API or a database.
    // For this example, we'll return a predefined fact or a default one.
    const facts: Record<string, string> = {
      "eiffel tower": "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron.",
      "paris": "Paris was originally a Roman city called Lutetia.",
      "louvre museum": "The Louvre Museum is so large that if you spent just 30 seconds looking at each piece of art, it would take you about 200 days to see everything.",
      "statue of liberty": "The Statue of Liberty's outer layer is made of copper, and it's only about as thick as two pennies put together (2.4mm).",
      "great wall of china": "The Great Wall of China is not a single continuous wall but a series of fortifications."
    };
    const funFact = facts[topic.toLowerCase()];
    if (funFact) {
      return funFact;
    }
    return `One interesting (but perhaps not widely known) detail about ${topic} is its unique connection to local traditions and history.`;
  }
);
