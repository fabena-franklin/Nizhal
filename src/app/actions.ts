// src/app/actions.ts
"use server";

import { tourismQueryAnswering, TourismQueryAnsweringInput, TourismQueryAnsweringOutput } from "@/ai/flows/tourism-query-answering";
import { recommendLinks, RecommendLinksInput, RecommendLinksOutput } from "@/ai/flows/link-recommendation";

interface GetAiResponseOutput {
  answer: string;
  links: string[];
  mapUrl?: string;
}

export async function getAiChatResponse(
  query: string,
  userLocation?: { latitude: number; longitude: number } | null
): Promise<GetAiResponseOutput> {
  try {
    const tourismInput: TourismQueryAnsweringInput = { query };
    if (userLocation) {
      tourismInput.userLocation = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    
    const tourismOutput: TourismQueryAnsweringOutput = await tourismQueryAnswering(tourismInput);
    const answer = tourismOutput.answer;
    const mapUrl = tourismOutput.mapUrl;

    const linksInput: RecommendLinksInput = { query, answer };
    const linksOutput: RecommendLinksOutput = await recommendLinks(linksInput);
    const links = linksOutput.links || [];

    return { answer, links, mapUrl };
  } catch (error) {
    console.error("Error getting AI response:", error);
    // Consider more specific error messages based on the error type
    throw new Error("Failed to get response from Nizhal. Please try again.");
  }
}
