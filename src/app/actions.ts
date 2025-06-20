
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
    
    const tourismOutput: TourismQueryAnsweringOutput | undefined = await tourismQueryAnswering(tourismInput);

    if (!tourismOutput || typeof tourismOutput.answer !== 'string' || tourismOutput.answer.trim() === '') {
      console.error("Tourism flow did not return a valid or non-empty answer:", tourismOutput);
      answer = TOURISM_FLOW_ERROR_MESSAGE;
      mapUrl = undefined;
      links = [];
    } else {
      answer = tourismOutput.answer;
      mapUrl = tourismOutput.mapUrl;

      // Only attempt to get links if the primary answer was successful and not our error message
      if (answer !== TOURISM_FLOW_ERROR_MESSAGE) {
        try {
          const linksInput: RecommendLinksInput = { query, answer };
          const linksOutput: RecommendLinksOutput | undefined = await recommendLinks(linksInput);
          
          if (linksOutput && Array.isArray(linksOutput.links)) {
            links = linksOutput.links;
          } else {
            console.error("RecommendLinks flow did not return valid links:", linksOutput);
            links = [];
          }
        } catch (linkError) {
          console.error("Error in recommendLinks flow:", linkError);
          links = []; // Default to empty links on error
        }
      }
    }
    
    return { answer, links, mapUrl };

  } catch (error) {
    console.error("Critical error in getAiChatResponse:", error);
    // Ensure the error message is a string
    const errorMessageString = error instanceof Error ? error.message : "An unknown error occurred with the AI service.";
    // This error will be caught by the page component and displayed as a toast
    throw new Error(`Nizhal is unable to respond right now. Details: ${errorMessageString}`);
  }
}
