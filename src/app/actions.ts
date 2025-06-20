// src/app/actions.ts
"use server";

import { tourismQueryAnswering, TourismQueryAnsweringInput, TourismQueryAnsweringOutput } from "@/ai/flows/tourism-query-answering";
import { recommendLinks, RecommendLinksInput, RecommendLinksOutput } from "@/ai/flows/link-recommendation";

interface GetAiResponseOutput {
  answer: string;
  links: string[];
}

export async function getAiChatResponse(query: string): Promise<GetAiResponseOutput> {
  try {
    const tourismInput: TourismQueryAnsweringInput = { query };
    const tourismOutput: TourismQueryAnsweringOutput = await tourismQueryAnswering(tourismInput);
    const answer = tourismOutput.answer;

    const linksInput: RecommendLinksInput = { query, answer };
    const linksOutput: RecommendLinksOutput = await recommendLinks(linksInput);
    const links = linksOutput.links || [];

    return { answer, links };
  } catch (error) {
    console.error("Error getting AI response:", error);
    // Consider more specific error messages based on the error type
    throw new Error("Failed to get response from Nizhal. Please try again.");
  }
}
