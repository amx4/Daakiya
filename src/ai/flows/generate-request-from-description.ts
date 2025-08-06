'use server';

/**
 * @fileOverview An AI agent that helps users fill in the URL parameters, headers, and request body based on a natural language description.
 *
 * - generateRequestFromDescription - A function that handles the request generation process.
 * - GenerateRequestFromDescriptionInput - The input type for the generateRequestFromDescription function.
 * - GenerateRequestFromDescriptionOutput - The return type for the generateRequestFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRequestFromDescriptionInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired API request.'),
});
export type GenerateRequestFromDescriptionInput = z.infer<typeof GenerateRequestFromDescriptionInputSchema>;

const GenerateRequestFromDescriptionOutputSchema = z.object({
  url: z.string().describe('The URL for the API request.'),
  headers: z.record(z.string()).describe('The headers for the API request.'),
  body: z.string().describe('The request body (JSON format) for the API request.'),
});
export type GenerateRequestFromDescriptionOutput = z.infer<typeof GenerateRequestFromDescriptionOutputSchema>;

export async function generateRequestFromDescription(input: GenerateRequestFromDescriptionInput): Promise<GenerateRequestFromDescriptionOutput> {
  return generateRequestFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRequestFromDescriptionPrompt',
  input: {schema: GenerateRequestFromDescriptionInputSchema},
  output: {schema: GenerateRequestFromDescriptionOutputSchema},
  prompt: `You are an AI assistant that helps users construct API requests based on their descriptions.

  Based on the following description, please provide the URL, headers, and request body.

  Description: {{{description}}}

  Ensure the request body is valid JSON.
`,
});

const generateRequestFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateRequestFromDescriptionFlow',
    inputSchema: GenerateRequestFromDescriptionInputSchema,
    outputSchema: GenerateRequestFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
