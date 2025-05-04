/**
 * Template image data structure
 * Maps each image to its metadata including default prompts for Gemini API
 */

// Define image template interface
export interface TemplateImage {
  id: string;
  uri: any; // Local require() for better performance
  thumbnailUri?: any; // Optional thumbnail for faster loading
  category: string;
  defaultPrompt: string;
  title?: string; // Optional title for the template
}

// Define categories
export type TemplateCategory = 'artistic' | 'cartoon' | 'portrait' | 'abstract';

// Create template data structure
export const TEMPLATE_IMAGES: TemplateImage[] = [
  // Artistic category
  {
    id: 'arietti',
    uri: require('../assets/Container_images/arietti.jpg'),
    category: 'artistic',
    defaultPrompt: 'Create an anime-style illustration with soft lighting and detailed character design similar to Studio Ghibli',
    title: 'Anime Style'
  },
  {
    id: 'GoK6ovUWIAA-yKY',
    uri: require('../assets/Container_images/GoK6ovUWIAA-yKY.jpeg'),
    category: 'artistic',
    defaultPrompt: 'Create a detailed painterly image with colorful brush strokes and atmospheric lighting',
    title: 'Painterly Art'
  },
  {
    id: 'Gm_ZUAkWoAAqPre',
    uri: require('../assets/Container_images/Gm_ZUAkWoAAqPre.jpeg'),
    category: 'artistic',
    defaultPrompt: 'Create a dreamy artistic scene with soft lighting and vibrant colors',
    title: 'Dreamy Artwork'
  },
  
  // Cartoon category
  {
    id: 'mushroom',
    uri: require('../assets/Container_images/Mushroom Cartoonish.jpeg'),
    category: 'cartoon',
    defaultPrompt: 'Create a cute cartoon mushroom character with vibrant colors and playful style',
    title: 'Cartoon Mushroom'
  },
  {
    id: 'bear',
    uri: require('../assets/Container_images/Bear Cartoonish.jpeg'),
    category: 'cartoon',
    defaultPrompt: 'Create a cartoon bear character with rounded features and a friendly expression',
    title: 'Cartoon Bear'
  },
  {
    id: 'crying_emoji',
    uri: require('../assets/Container_images/Crying emoji (cartoon ).jpeg'),
    category: 'cartoon',
    defaultPrompt: 'Create a cartoon crying emoji with expressive features and blue tears',
    title: 'Crying Emoji'
  },
  
  // Portrait category
  {
    id: 'women',
    uri: require('../assets/Container_images/Women.jpg'),
    category: 'portrait',
    defaultPrompt: 'Create a stylized portrait with soft lighting and a clean minimalist background',
    title: 'Minimalist Portrait'
  },
  {
    id: 'women2',
    uri: require('../assets/Container_images/women2.jpg'),
    category: 'portrait',
    defaultPrompt: 'Create a modern artistic portrait with vibrant colors and stylized features',
    title: 'Artistic Portrait'
  },
  {
    id: 'GqCua7_WcAAsO3G',
    uri: require('../assets/Container_images/GqCua7_WcAAsO3G.jpeg'),
    category: 'portrait',
    defaultPrompt: 'Create a detailed character portrait with dramatic lighting and atmospheric effects',
    title: 'Character Portrait'
  },
  
  // Abstract category
  {
    id: '9ca645bab9fe891939fd75c0f130ee31',
    uri: require('../assets/Container_images/9ca645bab9fe891939fd75c0f130ee31.jpg'),
    category: 'abstract',
    defaultPrompt: 'Create an abstract geometric design with vibrant colors and clean lines',
    title: 'Geometric Abstract'
  },
  {
    id: '31d9b6e82f124a6674923b88680b9ff8',
    uri: require('../assets/Container_images/31d9b6e82f124a6674923b88680b9ff8.jpg'),
    category: 'abstract',
    defaultPrompt: 'Create an abstract composition with fluid shapes and a minimalist color palette',
    title: 'Fluid Abstract'
  },
  {
    id: 'Gp8iCzoWMAASrPJ',
    uri: require('../assets/Container_images/Gp8iCzoWMAASrPJ.jpeg'),
    category: 'abstract',
    defaultPrompt: 'Create a vibrant abstract digital artwork with flowing shapes and a dynamic composition',
    title: 'Digital Abstract'
  },
];

// Helper functions to get templates by category
export const getTemplatesByCategory = (category: TemplateCategory): TemplateImage[] => {
  return TEMPLATE_IMAGES.filter(template => template.category === category);
};

// Get all available categories
export const getCategories = (): TemplateCategory[] => {
  const categories = new Set(TEMPLATE_IMAGES.map(template => template.category)) as Set<TemplateCategory>;
  return Array.from(categories);
};

// Get template by ID
export const getTemplateById = (id: string): TemplateImage | undefined => {
  return TEMPLATE_IMAGES.find(template => template.id === id);
}; 