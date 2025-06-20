// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { ChatMessageCard } from "@/components/chat-message-card";
import { ChatInputForm } from "@/components/chat-input-form";
import { getAiChatResponse } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf } from "lucide-react";

export default function NizhalNavigatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Greet user on initial load
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Hello! I'm Nizhal, your AI tourism assistant. How can I help you plan your next adventure? Try asking for information about a place, or even 'show me a map of Tokyo'!",
        links: []
      }
    ]);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // Optional: You could add a toast here to inform the user that location was acquired
          // toast({ title: "Location Acquired", description: "Nizhal can now use your location for nearby suggestions." });
        },
        (error) => {
          let title = "Location Access Issue";
          let description = "Could not determine your location. To use 'nearby' features, please specify a city or region.";
          let variant: "default" | "destructive" = "default";

          if (error.code === error.PERMISSION_DENIED) {
            description = "Location access denied. To find 'nearby' places, please enable location services for this site in your browser settings, or specify a city/region.";
            variant = "destructive";
          }
          
          toast({
            variant: variant,
            title: title,
            description: description,
          });
          console.error("Error getting location: ", error);
        }
      );
    } else {
      toast({
        variant: "default",
        title: "Location Services Not Supported",
        description: "Your browser does not support geolocation. Please specify a city or region for 'nearby' queries.",
      });
    }
  }, [toast]);


  const handleUserSubmit = async (query: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'loading',
      text: 'Nizhal is thinking...'
    }

    setMessages((prevMessages) => [...prevMessages, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiChatResponse(query, currentLocation);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: "ai",
        text: aiResponse.answer,
        links: aiResponse.links,
        mapUrl: aiResponse.mapUrl,
      };
      setMessages((prevMessages) => [...prevMessages.filter(m => m.sender !== 'loading'), aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setMessages((prevMessages) => prevMessages.filter(m => m.sender !== 'loading'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-center p-4 border-b shadow-sm bg-background/80 backdrop-blur-sm">
        <Leaf className="h-8 w-8 mr-2 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-primary">
          Nizhal Navigator
        </h1>
      </header>

      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <ChatMessageCard key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <ChatInputForm onSubmit={handleUserSubmit} isLoading={isLoading} />
    </div>
  );
}
