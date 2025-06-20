
'use server';
/**
 * @fileOverview A Genkit tool to provide Google Maps links for a location.
 *
 * - getGoogleMapsLinkTool - A tool that returns a Google Maps search URL for a given location.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const getGoogleMapsLinkTool = ai.defineTool(
  {
    name: 'getGoogleMapsLink',
    description: "Provides a Google Maps link for a given location or point of interest. Use this tool if the user asks for a map, directions, or to see where something is. For example, if the user asks 'Where is the Louvre Museum?' or 'Show me a map of Barcelona'.",
    inputSchema: z.object({
      locationName: z.string().describe('The name of the location or point of interest for which a Google Maps link is desired, e.g., "Eiffel Tower, Paris" or "restaurants near Times Square, New York". Be as specific as possible.'),
    }),
    outputSchema: z.string().url().describe('A Google Maps URL that shows the specified location. For example, "https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris".'),
  },
  async ({locationName}) => {
    if (!locationName) {
      throw new Error("Location name is required to generate a Google Maps link.");
    }
    const encodedLocationName = encodeURIComponent(locationName);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocationName}`;
  }
);
