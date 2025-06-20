// src/components/chat-message-card.tsx
"use client";

import type { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Bot, UserCircle, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageCardProps {
  message: ChatMessage;
}

export function ChatMessageCard({ message }: ChatMessageCardProps) {
  const isUser = message.sender === "user";
  const isAi = message.sender === "ai";
  const isLoading = message.sender === "loading";

  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-6 animate-in fade-in duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-10 w-10 border border-primary/20 shadow-sm">
          <AvatarImage src="/placeholder-bot.png" alt="Nizhal Avatar" data-ai-hint="robot assistant" />
          <AvatarFallback>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Bot className="h-5 w-5 text-primary" />}
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-xl shadow-md rounded-xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none",
          isLoading ? "bg-muted text-muted-foreground" : ""
        )}
      >
        <CardContent className="p-4">
          {isLoading ? (
             <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">{message.text}</p>
             </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
        </CardContent>
        {(isAi && ((message.links && message.links.length > 0) || message.mapUrl)) && (
          <CardFooter className="p-4 pt-2 border-t border-border/50">
            <div className="space-y-3">
              {message.mapUrl && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1.5" />
                    Location on Map:
                  </h4>
                  <a
                    href={message.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent/90 underline hover:no-underline transition-colors break-all"
                  >
                    {message.mapUrl}
                  </a>
                </div>
              )}
              {message.links && message.links.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground">Suggested Links:</h4>
                  <ul className="list-none space-y-1">
                    {message.links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:text-accent/90 underline hover:no-underline transition-colors break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
      {isUser && (
        <Avatar className="h-10 w-10 border border-primary/20 shadow-sm">
           <AvatarImage src="/placeholder-user.png" alt="User Avatar" data-ai-hint="person avatar" />
          <AvatarFallback>
            <UserCircle className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
