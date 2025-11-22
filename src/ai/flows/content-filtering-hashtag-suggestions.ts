'use server';

/**
 * @fileOverview This file defines a Genkit flow for content filtering and hashtag suggestions.
 *
 * It exports:
 * - `filterContentAndSuggestHashtags` -  A function that filters content for disallowed material and suggests hashtags.
 * - `ContentFilteringAndHashtagSuggestionsInput` - The input type for the filterContentAndSuggestHashtags function.
 * - `ContentFilteringAndHashtagSuggestionsOutput` - The output type for the filterContentAndSuggestHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentFilteringAndHashtagSuggestionsInputSchema = z.object({
  content: z.string().describe('The text content of the post.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo included in the post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ContentFilteringAndHashtagSuggestionsInput = z.infer<
  typeof ContentFilteringAndHashtagSuggestionsInputSchema
>;

const ContentFilteringAndHashtagSuggestionsOutputSchema = z.object({
  isContentAllowed: z.boolean().describe('Whether the content is allowed or not.'),
  filteredContent: z.string().describe('The content after filtering (if any).'),
  suggestedHashtags: z.array(z.string()).describe('Suggested hashtags for the post.'),
});

export type ContentFilteringAndHashtagSuggestionsOutput = z.infer<
  typeof ContentFilteringAndHashtagSuggestionsOutputSchema
>;

export async function filterContentAndSuggestHashtags(
  input: ContentFilteringAndHashtagSuggestionsInput
): Promise<ContentFilteringAndHashtagSuggestionsOutput> {
  return contentFilteringAndHashtagSuggestionsFlow(input);
}

const contentFilterAndHashtagPrompt = ai.definePrompt({
  name: 'contentFilterAndHashtagPrompt',
  input: {schema: ContentFilteringAndHashtagSuggestionsInputSchema},
  output: {schema: ContentFilteringAndHashtagSuggestionsOutputSchema},
  prompt: `You are a content moderation and hashtag suggestion tool.

  Analyze the following content and determine if it is appropriate for a social media platform.  If it violates any content policies, set isContentAllowed to false.  The platform prohibits hate speech, harassment, sexually explicit content, dangerous content, and content that violates civic integrity. If the content is allowed, set isContentAllowed to true and return the original content in the filteredContent field.

  Suggest relevant hashtags to increase the post's discoverability. Return them as an array of strings in the suggestedHashtags field.  Only suggest hashtags that are directly relevant to the content. Don't include generic hashtags like #instagood or #photooftheday.

  Content: {{{content}}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  `,
});

const contentFilteringAndHashtagSuggestionsFlow = ai.defineFlow(
  {
    name: 'contentFilteringAndHashtagSuggestionsFlow',
    inputSchema: ContentFilteringAndHashtagSuggestionsInputSchema,
    outputSchema: ContentFilteringAndHashtagSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await contentFilterAndHashtagPrompt(input);
    return output!;
  }
);
