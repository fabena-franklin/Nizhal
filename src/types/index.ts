export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'loading';
  text: string;
  links?: string[];
  mapUrl?: string;
}
