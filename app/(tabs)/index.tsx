import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Alert, View, Text, Image, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import geminiService from '../../services/geminiService';

// Interface for chat messages
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string | string[];
  images?: string[];
  userImage?: string;
}

// Chat bubble for user messages
const UserBubble = ({ message, image }: { message: string, image?: string }) => (
  <View style={chatStyles.userBubbleContainer}>
    {image && (
      <View style={chatStyles.userImageContainer}>
        <Image source={{ uri: image }} style={chatStyles.bubbleImage} />
      </View>
    )}
    <View style={chatStyles.userBubble}>
      <Text style={chatStyles.userBubbleText}>{message}</Text>
    </View>
  </View>
);

// Chat bubble for AI responses
const AIBubble = ({ text, images }: { text: string[], images: string[] }) => (
  <View style={chatStyles.aiBubbleContainer}>
    <View style={chatStyles.aiBubble}>
      {text.map((content, index) => (
        <Text key={`ai-text-${index}`} style={chatStyles.aiBubbleText}>
          {content}
        </Text>
      ))}
      
      {images.map((imageUri, index) => (
        <View key={`ai-image-${index}`} style={chatStyles.aiImageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={chatStyles.bubbleImage} 
            resizeMode="contain"
          />
        </View>
      ))}
    </View>
  </View>
);

// Interface for gallery items
interface GalleryItem {
  id: string;
  imageUrl: string;
}

// Updated Pinterest-style gallery with consistent image sizes
const PinterestGallery = () => {
  // Sample data - replace with your actual image data
  const galleryItems: GalleryItem[] = [
    { id: '1', imageUrl: 'https://picsum.photos/600/800?1' },
    { id: '2', imageUrl: 'https://picsum.photos/600/800?2' },
    { id: '3', imageUrl: 'https://picsum.photos/600/800?3' },
    { id: '4', imageUrl: 'https://picsum.photos/600/800?4' },
    { id: '5', imageUrl: 'https://picsum.photos/600/800?5' },
    { id: '6', imageUrl: 'https://picsum.photos/600/800?6' },
  ];

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity style={styles.galleryItem}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        data={galleryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
      />
    </View>
  );
};

// Second horizontal gallery with consistent image sizes
const SecondGallery = () => {
  // Sample data - replace with your actual image data
  const galleryItems: GalleryItem[] = [
    { id: '1', imageUrl: 'https://picsum.photos/600/800?7' },
    { id: '2', imageUrl: 'https://picsum.photos/600/800?8' },
    { id: '3', imageUrl: 'https://picsum.photos/600/800?9' },
    { id: '4', imageUrl: 'https://picsum.photos/600/800?10' },
    { id: '5', imageUrl: 'https://picsum.photos/600/800?11' },
    { id: '6', imageUrl: 'https://picsum.photos/600/800?12' },
  ];

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity style={styles.galleryItem}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        data={galleryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
      />
    </View>
  );
};

// Main ad generation screen
export default function HomeScreen() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [chatMessages]);
  
  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollToBottom();
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
          {/* First Pinterest Gallery */}
          <PinterestGallery />
          
          {/* Second Gallery */}
          <SecondGallery />
          
          {chatMessages.length === 0 ? (
            null
          ) : (
            chatMessages.map(message => (
              message.type === 'user' ? (
                <UserBubble 
                  key={message.id} 
                  message={message.text as string} 
                  image={message.userImage}
                />
              ) : (
                <AIBubble 
                  key={message.id} 
                  text={message.text as string[]} 
                  images={message.images || []}
                />
              )
            ))
          )}
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
    marginBottom: 12, // Reduced margin
    height: 150, // Smaller fixed height
  },
  galleryList: {
    paddingRight: 16,
  },
  galleryItem: {
    width: 150, // Consistent width
    height: 120, // Consistent height
    marginRight: 12,
    borderRadius: 16, // Curved edges
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16, // Ensure image has same curved edges
  },
});

// Chat-specific styles
const chatStyles = StyleSheet.create({
  userBubbleContainer: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#0080ff',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 12,
    marginVertical: 4,
  },
  userBubbleText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  userImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  aiBubbleContainer: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    marginVertical: 8,
  },
  aiBubble: {
    backgroundColor: '#000000',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginVertical: 4,
  },
  aiBubbleText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  aiImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  bubbleImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
  },
});
