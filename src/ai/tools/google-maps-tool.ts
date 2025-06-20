
'use server';
/**
 * @fileOverview A Genkit tool to provide Google Maps links for a location or coordinates.
 *
 * - getGoogleMapsLinkTool - A tool that returns a Google Maps search URL for a given location or coordinates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const getGoogleMapsLinkTool = ai.defineTool(
  {
    name: 'getGoogleMapsLink',
    description: "Provides a Google Maps link for a given location, point of interest, or coordinates. Use this tool if the user asks for a map, directions, or to see where something is. For example, if the user asks 'Where is the Louvre Museum?', 'Show me a map of Barcelona', or if coordinates like '48.8584,2.2945' are provided and a map of that area is needed.",
    inputSchema: z.object({
      locationName: z.string().describe('The name of the location, point of interest (e.g., "Eiffel Tower, Paris", "restaurants near Times Square, New York"), or comma-separated latitude and longitude coordinates (e.g., "48.8584,2.2945") for which a Google Maps link is desired. Be as specific as possible.'),
    }),
    outputSchema: z.string().url().describe('A Google Maps URL that shows the specified location. For example, "https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris" or "https://www.google.com/maps/search/?api=1&query=48.8584,2.2945".'),
  },
  async ({locationName}) => {
    if (!locationName) {
      throw new Error("Location name or coordinates are required to generate a Google Maps link.");
    }
    const encodedLocationName = encodeURIComponent(locationName);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocationName}`;
  }
);
