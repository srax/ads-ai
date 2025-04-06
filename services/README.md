# Gemini API Integration for Ad Generation

This directory contains services for integrating with Google's Gemini API to generate ad content from text prompts and images.

## Overview

The integration allows users to:
1. Generate ad images from text descriptions
2. Combine uploaded images with text to create customized ads
3. Receive both image and text responses from the Gemini model

## Files

- `geminiService.ts`: Main service that handles API communication
- `types.ts`: TypeScript interfaces for the service

## How It Works

The service uses Google's Gemini 2.0 Flash experimental image generation model to create ad content. Here's how the different scenarios are handled:

### Text-to-Image Generation

When a user enters a text prompt without an image:
```typescript
const result = await geminiService.generateAdContent("Create a sleek banner for a new smartphone");
```

### Image Editing/Enhancement

When a user provides both text and image:
```typescript
const result = await geminiService.generateAdContent("Make this product image more professional", imageUri);
```

## Response Handling

The service processes Gemini's response to extract:
- Generated images (saved to the filesystem)
- Text descriptions or captions

## Setup

1. Add your Gemini API key to `constants/ApiKeys.ts`
2. The service will automatically handle image encoding/decoding and API requests

## Error Handling

The service includes error handling for:
- API request failures
- Image processing issues
- File system operations

## Performance Considerations

- Images are processed efficiently using Expo's FileSystem API
- Base64 encoding is used for image data transfer
- Response processing is optimized for mobile performance 