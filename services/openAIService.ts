import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import OpenAI from 'openai';

// Hard-coded API key
const OPENAI_API_KEY = "";

// Define result interface
interface ImageGenerationResult {
  text: string[];
  images: string[];
  rawResponse?: any;
}

/**
 * Service for handling interactions with the OpenAI API for landscape design generation
 */
class OpenAIService {
  private openai: OpenAI;
  private MODEL_NAME = "gpt-image-1";
  
  constructor() {
    console.log("Initializing OpenAIService with API key:", OPENAI_API_KEY ? "API key present" : "API key missing");
    this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  /**
   * Generate landscape design based on image and prompt
   * @param imageUri Local URI of the input image
   * @param prompt User text prompt
   * @returns Promise with generated content
   */
  async generateLandscapeDesign(imageUri: string, prompt: string): Promise<ImageGenerationResult> {
    try {
      console.log("generateLandscapeDesign called with prompt:", prompt);
      console.log("Input image:", imageUri ? "Image provided" : "No image");
      
      if (!imageUri) {
        throw new Error("No image provided");
      }

      // Call OpenAI API using SDK
      console.log("Sending request to OpenAI API...");
      
      // Use the standard image generation endpoint as shown in documentation
      const response = await this.openai.images.generate({
        model: this.MODEL_NAME,
        prompt: "Lawn landscaping design: " + prompt,
        n: 1,
        size: "1024x1024",
      });
      
      console.log("Received response from OpenAI API:", response ? "Response received" : "Empty response");
      
      return await this.processResponse(response);
    } catch (error: any) {
      console.error('Error generating landscape design:', error);
      Alert.alert("API Error", `Failed to generate content: ${error.message || "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Process the API response and extract images
   * @param response Raw API response
   * @returns Structured result with images
   */
  private async processResponse(response: any): Promise<ImageGenerationResult> {
    console.log("Processing response...");
    const result: ImageGenerationResult = {
      text: [],
      images: [],
      rawResponse: response
    };
    
    try {
      if (response && response.data && response.data.length > 0) {
        for (const item of response.data) {
          if (item.url) {
            console.log("Found image URL:", item.url);
            // Download image from URL and save locally
            const imagePath = await this.downloadImage(item.url);
            if (imagePath) {
              result.images.push(imagePath);
            }
          } else if (item.b64_json) {
            console.log("Found base64 image data");
            // Save base64 image directly
            const imagePath = await this.saveGeneratedImage(item.b64_json);
            if (imagePath) {
              result.images.push(imagePath);
            }
          }
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
   * Download image from URL and save locally
   * @param url Image URL
   * @returns Local URI of saved image
   */
  private async downloadImage(url: string): Promise<string> {
    try {
      console.log("Downloading image from URL:", url);
      const timestamp = Date.now();
      const filename = `openai-landscape-${timestamp}.png`;
      const directory = `${FileSystem.cacheDirectory}generated`;
      const filePath = `${directory}/${filename}`;
      
      // Ensure directory exists
      try {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      } catch (dirError) {
        console.log('Error creating directory:', dirError);
      }
      
      // Download file
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        filePath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        console.log("Image downloaded successfully to:", result.uri);
        return result.uri;
      } else {
        console.error("Download failed, no URI returned");
        return '';
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      return '';
    }
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
      const filename = `openai-landscape-${timestamp}.png`;
      
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
export default new OpenAIService(); 