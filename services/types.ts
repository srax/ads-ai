/**
 * Types for Gemini API integration
 */

export interface ImageGenerationResult {
  text: string[];
  images: string[];
  rawResponse: any;
}

export interface GeminiContent {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiRequestOptions {
  model: string;
  contents: string | GeminiContent[];
  config?: {
    responseModalities?: string[];
    [key: string]: any;
  };
} 