import { GoogleGenAI } from "@google/genai";
import * as FileSystem from 'expo-file-system';
import { ImageGenerationResult, GeminiContent } from './types';


/**
 * Service for handling interactions with the Gemini API for ad generation
 */
class GeminiService {
  private ai: any;
  private MODEL_NAME = "gemini-2.0-flash-exp-image-generation";
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: "AIzaSyA0XTVdrDNgVDb1w05xFIcrIj_kJA7jZ7k" });
  }

  /**
   * Generate content based on text prompt
   * @param prompt User text prompt 
   * @returns Promise with generated content
   */
  async generateAdContent(prompt: string, selectedImage?: string): Promise<ImageGenerationResult> {
    try {
      let contents: any;
      
      // If an image is selected, include it in the request
      if (selectedImage) {
        const base64Image = await this.imageToBase64(selectedImage);
        contents = [
          { text: prompt },
          {
            inlineData: {
              mimeType: this.getMimeType(selectedImage),
              data: base64Image,
            },
          }
        ];
      } else {
        contents = prompt;
      }

      // Make request to Gemini API
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: contents,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Error generating ad content:', error);
      throw error;
    }
  }

  /**
   * Process the API response and extract text/images
   * @param response Raw API response
   * @returns Structured result with text and images
   */
  private processResponse(response: any): ImageGenerationResult {
    const result: ImageGenerationResult = {
      text: [],
      images: [],
      rawResponse: response
    };
    
    // Process each part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        // Add text part
        result.text.push(part.text);
      } else if (part.inlineData) {
        // Save image and add to result
        const imageData = part.inlineData.data;
        const imagePath = this.saveGeneratedImage(imageData);
        result.images.push(imagePath);
      }
    }
    
    return result;
  }

  /**
   * Save a generated image to local filesystem
   * @param base64Data Base64 image data
   * @returns Local URI of saved image
   */
  private saveGeneratedImage(base64Data: string): string {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `gemini-ad-${timestamp}.png`;
      const filePath = `${FileSystem.documentDirectory}generated/${filename}`;
      
      // Ensure directory exists
      FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}generated/`, { intermediates: true })
        .catch(e => console.log('Directory already exists or creation failed'));
      
      // Write file
      FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      return filePath;
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw error;
    }
  }

  /**
   * Convert image URI to base64 encoding
   * @param uri Local image URI
   * @returns Base64 string
   */
  private async imageToBase64(uri: string): Promise<string> {
    try {
      // For local file URIs, read directly
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Get MIME type from file extension
   * @param uri File URI 
   * @returns MIME type string
   */
  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }
}

// Export as singleton
export default new GeminiService(); 