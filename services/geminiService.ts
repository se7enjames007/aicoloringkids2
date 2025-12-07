import { GoogleGenAI, GenerateContentResponse as GeminiGenerateContentResponse } from "@google/genai";

/**
 * Generates a coloring book prompt from a raw transcript using a Gemini text model.
 *
 * @param transcript The raw voice transcript from the user.
 * @returns A promise that resolves with the optimized prompt string.
 */
export async function generateColoringBookPrompt(transcript: string): Promise<string> {
  // Always use `const ai = new GoogleGenAI({apiKey: process.env.API_KEY});`
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are an AI image prompt generator for a children's coloring book app.
Your goal is to convert raw voice transcripts into generic, safe, cute, and descriptive prompts.
Enforce 'black and white line art' style.
Remove any unsafe or inappropriate concepts gently by ignoring them.
Keep the subject simple and cute.
Always append these style keywords: 'thick outlines, white background, vector style, coloring book page for kids, no shading, no grayscale.'
Only output the raw prompt text.`;

  try {
    // Using the GenerateContentResponse type from @google/genai
    const response: GeminiGenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: transcript,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    // Use response.text to extract text output from GenerateContentResponse
    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini did not return a valid prompt text.");
    }
    return text;
  } catch (error) {
    console.error("Error generating coloring book prompt:", error);
    throw new Error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates two coloring book images based on an optimized prompt using a Gemini image model.
 *
 * @param prompt The optimized prompt string for image generation.
 * @returns A promise that resolves with an array of two base64 encoded image URLs.
 */
export async function generateColoringBookImage(prompt: string): Promise<string[]> {
  // Always use `const ai = new GoogleGenAI({apiKey: process.env.API_KEY});`
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageUrls: string[] = [];

  // Helper function to extract image URL from response
  const extractImageUrl = (response: GeminiGenerateContentResponse): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        if (part.inlineData.mimeType) {
          return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("Gemini did not return an image part with inlineData and mimeType.");
  };

  try {
    // Prompt variations for different styles within the coloring book theme
    const prompt1 = `${prompt}, classic comic book style, bold outlines`;
    const prompt2 = `${prompt}, playful doodle art style, slightly simplified lines`;

    // Generate the first image with a specific style modifier
    const response1: GeminiGenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt1,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
        // Rely on default randomness for distinct outputs
      },
    });
    imageUrls.push(extractImageUrl(response1));

    // Generate the second image with a different style modifier
    const response2: GeminiGenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt2,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
        // Rely on default randomness for distinct outputs
      },
    });
    imageUrls.push(extractImageUrl(response2));

    return imageUrls;

  } catch (error) {
    console.error("Error generating coloring book image:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
}