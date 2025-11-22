'use server';
/**
 * @fileOverview A story generation AI flow.
 *
 * It exports:
 * - `generateStory` - A function that generates a short story from a prompt.
 * - `GenerateStoryInput` - The input type for the generateStory function.
 * - `GenerateStoryOutput` - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe('The prompt for the story.'),
});

export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story.'),
});

export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(
  input: GenerateStoryInput
): Promise<GenerateStoryOutput> {
  return storyGeneratorFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'storyPrompt',
  input: { schema: GenerateStoryInputSchema },
  output: { schema: GenerateStoryOutputSchema },
  prompt: `Write a short, creative story based on the following prompt.

Prompt: {{{prompt}}}

Return the story in the 'story' field.`,
});

const storyGeneratorFlow = ai.defineFlow(
  {
    name: 'storyGeneratorFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async (input) => {
    const { output } = await storyPrompt(input);
    return output!;
  }
);
