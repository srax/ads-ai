import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import geminiService from '../../services/geminiService';
import { TEMPLATE_IMAGES, TemplateImage, getTemplatesByCategory } from '../../data/imageTemplates';

// Interface for gallery items
interface GalleryItem {
  id: string;
  imageUrl: string;
}

// Gallery component to display template images by category
const TemplateGallery = ({ category, title }: { category: string, title: string }) => {
  // Get template images for this category
  const templates = getTemplatesByCategory(category as any);

  const renderItem = ({ item }: { item: TemplateImage }) => (
    <TouchableOpacity 
      style={styles.galleryItem}
      onPress={() => console.log('Template selected:', item.id, item.defaultPrompt)}
    >
      <Image 
        source={item.uri} 
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.galleryContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
      />
    </View>
  );
};

// Main screen component
export default function HomeScreen() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && { paddingBottom: 10 }
          ]}
        >
          {/* Artistic Templates Gallery */}
          <TemplateGallery category="artistic" title="Artistic" />
          
          {/* Cartoon Templates Gallery */}
          <TemplateGallery category="cartoon" title="Cartoon" />
          
          {/* Additional categories can be added as needed */}
          <TemplateGallery category="portrait" title="Portrait" />
          <TemplateGallery category="abstract" title="Abstract" />
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// Main app styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100, // Increased padding to account for the tab bar
  },
  galleryContainer: {
    marginBottom: 20, // Increased margin between galleries
    height: 220, // Increased container height to accommodate title and images
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  galleryList: {
    paddingRight: 16,
  },
  galleryItem: {
    width: 110, // Wider images
    height: 185, // Significantly taller images
    marginRight: 16, // Slightly more spacing between items
    borderRadius: 8, // Less curved corners
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Match border radius with container
  },
});
