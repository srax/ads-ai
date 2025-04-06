import { GoogleGenAI } from "@google/genai";
import * as FileSystem from 'expo-file-system';
import { ImageGenerationResult, GeminiContent } from './types';
import { Alert } from 'react-native';

// Hard-coded API key since the constants file was deleted
const GEMINI_API_KEY = "AIzaSyA0XTVdrDNgVDb1w05xFIcrIj_kJA7jZ7k";

/**
 * Service for handling interactions with the Gemini API for ad generation
 */
class GeminiService {
  private ai: any;
  private MODEL_NAME = "gemini-2.0-flash-exp-image-generation";
  
  constructor() {
    console.log("Initializing GeminiService with API key:", GEMINI_API_KEY ? "API key present" : "API key missing");
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // Simple test to check if API key is valid
    this.testApiConnection();
  }

  // Test the API connection
  private async testApiConnection() {
    try {
      const textModel = this.ai.models("gemini-1.5-flash");
      const testRes = await textModel.generateContent("Hello");
      console.log("API connection test successful");
    } catch (error) {
      console.error("API connection test failed:", error);
      Alert.alert(
        "API Connection Error", 
        "Could not connect to Gemini API. Please check your internet connection and API key."
      );
    }
  }

  /**
   * Generate content based on text prompt
   * @param prompt User text prompt 
   * @returns Promise with generated content
   */
  async generateAdContent(prompt: string, selectedImage?: string): Promise<ImageGenerationResult> {
    try {
      console.log("generateAdContent called with prompt:", prompt);
      console.log("Selected image:", selectedImage ? "Image selected" : "No image");
      
      let contents: any;
      
      // If an image is selected, include it in the request
      if (selectedImage) {
        console.log("Processing selected image...");
        try {
          const base64Image = await this.imageToBase64(selectedImage);
          console.log("Image converted to base64 successfully");
          contents = [
            { text: prompt },
            {
              inlineData: {
                mimeType: this.getMimeType(selectedImage),
                data: base64Image,
              },
            }
          ];
        } catch (imageError) {
          console.error("Error processing image:", imageError);
          Alert.alert("Image Error", "Failed to process the selected image. Using text-only mode.");
          contents = prompt;
        }
      } else {
        console.log("Text-only mode");
        contents = prompt;
      }

      // Make request to Gemini API
      console.log("Sending request to Gemini API...");
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: contents,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });
      
      console.log("Received response from Gemini API:", response ? "Response received" : "Empty response");
      
      if (!response || !response.candidates || !response.candidates[0] || !response.candidates[0].content) {
        console.error("Invalid response structure:", JSON.stringify(response, null, 2));
        throw new Error("Invalid response from Gemini API");
      }
      
      return await this.processResponse(response);
    } catch (error: any) {
      console.error('Error generating ad content:', error);
      Alert.alert("API Error", `Failed to generate content: ${error.message || "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Process the API response and extract text/images
   * @param response Raw API response
   * @returns Structured result with text and images
   */
  private async processResponse(response: any): Promise<ImageGenerationResult> {
    console.log("Processing response...");
    const result: ImageGenerationResult = {
      text: [],
      images: [],
      rawResponse: response
    };
    
    try {
      // Process each part in the response
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        console.error("Invalid response structure in processResponse");
        return result;
      }
      
      console.log("Response parts count:", response.candidates[0].content.parts.length);
      
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          // Add text part
          console.log("Found text part:", part.text.substring(0, 50) + "...");
          result.text.push(part.text);
        } else if (part.inlineData) {
          // Save image and add to result
          console.log("Found image part");
          const imageData = part.inlineData.data;
          const imagePath = await this.saveGeneratedImage(imageData);
          console.log("Image saved at:", imagePath);
          if (imagePath) {
            result.images.push(imagePath);
          }
        } else {
          console.log("Unknown part type:", part);
        }
      }
    } catch (error) {
      console.error("Error in processResponse:", error);
    }
    
    console.log("Final result:", 
      `${result.text.length} text parts, ${result.images.length} images`);
    return result;
  }

  /**
   * Save a generated image to local filesystem
   * @param base64Data Base64 image data
   * @returns Local URI of saved image
   */
  private async saveGeneratedImage(base64Data: string): Promise<string> {
    try {
      console.log("Saving generated image...");
      // Create unique filename
      const timestamp = Date.now();
      const filename = `gemini-ad-${timestamp}.png`;
      
      // In Expo, we need to use the correct directory path
      const directory = `${FileSystem.cacheDirectory}generated`;
      const filePath = `${directory}/${filename}`;
      
      console.log("Creating directory if needed:", directory);
      // Ensure directory exists
      try {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        console.log("Directory created or already exists");
      } catch (dirError) {
        console.log('Error creating directory:', dirError);
        // Fallback to cache directory root
        return `${FileSystem.cacheDirectory}${filename}`;
      }
      
      console.log("Writing image file to:", filePath);
      // Write file
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log("Image saved successfully");
      return filePath;
    } catch (error) {
      console.error('Error saving generated image:', error);
      // Return empty string on error
      return '';
    }
  }

  /**
   * Convert image URI to base64 encoding
   * @param uri Local image URI
   * @returns Base64 string
   */
  private async imageToBase64(uri: string): Promise<string> {
    try {
      console.log("Converting image to base64:", uri);
      // For local file URIs, read directly
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      console.log("Base64 conversion successful, length:", base64.length);
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