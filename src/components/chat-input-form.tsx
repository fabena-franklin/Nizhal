// src/components/chat-input-form.tsx
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, Loader2 } from "lucide-react";

const chatInputSchema = z.object({
  query: z.string().min(1, "Message cannot be empty.").max(500, "Message too long."),
});

type ChatInputFormValues = z.infer<typeof chatInputSchema>;

interface ChatInputFormProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInputForm({ onSubmit, isLoading }: ChatInputFormProps) {
  const form = useForm<ChatInputFormValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      query: "",
    },
  });

  const handleFormSubmit: SubmitHandler<ChatInputFormValues> = async (data) => {
    await onSubmit(data.query);
    form.reset();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      form.handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex items-start gap-2 p-4 bg-secondary sticky bottom-0"
      >
        <Avatar className="h-9 w-9 self-start mt-1.5 mr-1 bg-gray-800 flex-shrink-0">
          <AvatarFallback className="text-white text-base font-medium bg-transparent">
            N
          </AvatarFallback>
        </Avatar>
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Textarea
                  placeholder="Hello!i am here for you"
                  className="resize-none min-h-[52px] max-h-[150px] rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 bg-card border-border"
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          className="h-[52px] w-[52px] rounded-xl bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm flex-shrink-0"
          disabled={isLoading}
          aria-label={isLoading ? "Sending..." : "Send message"}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5" />
          )}
        </Button>
      </form>
    </Form>
  );
}
