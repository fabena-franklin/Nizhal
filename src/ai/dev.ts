import { config } from 'dotenv';
config();

import '@/ai/flows/tourism-query-answering.ts';
import '@/ai/flows/link-recommendation.ts';
import '@/ai/tools/fun-fact-tool.ts';
import '@/ai/tools/google-maps-tool.ts';
