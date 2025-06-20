
// src/app/actions.ts
"use server";

import { tourismQueryAnswering, TourismQueryAnsweringInput, TourismQueryAnsweringOutput } from "@/ai/flows/tourism-query-answering";
import { recommendLinks, RecommendLinksInput, RecommendLinksOutput } from "@/ai/flows/link-recommendation";

interface GetAiResponseOutput {
  answer: string;
  links: string[];
  mapUrl?: string;
}

const TOURISM_FLOW_ERROR_MESSAGE = "I'm sorry, I encountered an issue processing your request. Could you please try again or rephrase your question?";

export async function getAiChatResponse(
  query: string,
  userLocation?: { latitude: number; longitude: number } | null
): Promise<GetAiResponseOutput> {
  let answer: string;
  let mapUrl: string | undefined;
  let links: string[] = [];

  try {
    const tourismInput: TourismQueryAnsweringInput = { query };
    if (userLocation) {
      tourismInput.userLocation = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    
    const tourismOutput: TourismQueryAnsweringOutput = await tourismQueryAnswering(tourismInput);
    answer = tourismOutput.answer; 
    mapUrl = tourismOutput.mapUrl;

    if (typeof answer !== 'string') {
        console.error("Tourism flow returned a non-string answer prior to link recommendation:", answer);
        answer = TOURISM_FLOW_ERROR_MESSAGE; // Fallback to ensure 'answer' is a string
    }

    if (answer !== TOURISM_FLOW_ERROR_MESSAGE) {
      try {
        const linksInput: RecommendLinksInput = { query, answer };
        const linksOutput: RecommendLinksOutput = await recommendLinks(linksInput);
        links = linksOutput.links || [];
      } catch (linkError) {
        console.error("Error in recommendLinks flow:", linkError);
      }
    }
    
    return { answer, links, mapUrl };

  } catch (error) {
    console.error("Critical error in getAiChatResponse:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the AI service.";
    throw new Error(`Nizhal is unable to respond right now. Details: ${errorMessage}`);
  }
}
