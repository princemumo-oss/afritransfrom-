'use server';
/**
 * @fileOverview A conversational AI chatbot flow.
 *
 * It exports:
 * - `chatWithBot` - A function that sends a message to the chatbot and gets a response.
 * - `ChatbotInput` - The input type for the chatWithBot function.
 * - `ChatbotOutput` - The return type for the chatWithBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatbotInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});

export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's response."),
});

export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatWithBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  system:
    "You are a friendly and helpful AI chatbot named Prince. You are a good listener and can talk about a wide range of topics, including science, relationships, and general knowledge. Your goal is to be a supportive and engaging conversational partner for the user.",
  prompt: `{{#each history}}
<|role|>{{role}}<|content|>{{content}}
{{/each}}
<|role|>user<|content|>{{{message}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    // If the history is empty, it's the first message from the user.
    // Prepend the introduction.
    if (input.history.length === 0) {
      const modifiedInput = {
        ...input,
        message: `(The user has just opened the chat. Greet them with: "Hello there, my name is Prince. How can I help you today?" and then respond to their first message which is: "${input.message}")`
      };
      const { output } = await chatbotPrompt(modifiedInput);
      return output!;
    }

    const { output } = await chatbotPrompt(input);
    return output!;
  }
);
