import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Alert, View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import geminiService from '../../services/geminiService';

// Define interfaces for component props
interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  onAddImage: () => void;
  isGenerating: boolean;
}

// Chat input component for entering prompts
const ChatInput = ({ onSubmit, onAddImage, isGenerating }: ChatInputProps) => {
  const [prompt, setPrompt] = useState('');
  
  return (
    <View style={chatStyles.inputContainer}>
      <View style={chatStyles.ovalContainer}>
        <TouchableOpacity onPress={onAddImage} style={chatStyles.addButtonContainer} disabled={isGenerating}>
          <Text style={chatStyles.addButton}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={chatStyles.inputField}
          placeholder="Describe your ad..."
          placeholderTextColor="#9e9e9e"
          value={prompt}
          onChangeText={setPrompt}
          multiline={true}
          numberOfLines={1}
          editable={!isGenerating}
        />
        <TouchableOpacity 
          onPress={() => {
            if (prompt.trim()) {
              onSubmit(prompt);
              setPrompt('');
            }
          }}
          disabled={!prompt.trim() || isGenerating}
          style={[
            chatStyles.sendButton,
            (!prompt.trim() || isGenerating) && chatStyles.disabledButton
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={chatStyles.sendButtonText}>→</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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

// Interface for chat messages
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string | string[];
  images?: string[];
  userImage?: string;
}

// Main ad generation screen
export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Handle ad generation
  const handleGenerateAd = async (prompt: string) => {
    try {
      // Add user message to chat
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: prompt,
        userImage: selectedImage || undefined
      };
      
      setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
      setIsGenerating(true);
      console.log("Generating ad with prompt:", prompt);
      
      // Clear the selected image after sending
      const imageCopy = selectedImage;
      setSelectedImage(null);
      
      // Call Gemini service to generate ad content
      const result = await geminiService.generateAdContent(prompt, imageCopy || undefined);
      console.log("Generation result:", result);
      
      // Add AI response to chat
      if (result && (result.images.length > 0 || result.text.length > 0)) {
        const newAIMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: result.text,
          images: result.images
        };
        
        setChatMessages(prevMessages => [...prevMessages, newAIMessage]);
        console.log("Updated chat with AI response");
      } else {
        // Add error message if no content generated
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: ["I couldn't generate any content for this prompt. Please try again with a different description."]
        };
        
        setChatMessages(prevMessages => [...prevMessages, errorMessage]);
        console.log("No content was generated");
      }
    } catch (error) {
      console.error('Error generating ad:', error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: ["Sorry, I encountered an error. Please try again."]
      };
      
      setChatMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle adding an image
  const handleAddImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to grant camera roll permissions to upload images.');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ads.ai</Text>
        </View>
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardVisible && { paddingBottom: 10 }
            ]}
          >
            {chatMessages.length === 0 ? (
              <View style={chatStyles.welcomeContainer}>
                <Text style={chatStyles.welcomeText}>Welcome to Ads.ai</Text>
                <Text style={chatStyles.subText}>
                  Describe the ad you want to create. You can also add images for reference.
                </Text>
              </View>
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
            
            {isGenerating && (
              <View style={chatStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#0080ff" />
                <Text style={chatStyles.loadingText}>Generating your ad...</Text>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.selectedImagePreview}>
          {selectedImage && (
            <View style={chatStyles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={chatStyles.previewImage} />
              <TouchableOpacity 
                style={chatStyles.removePreviewButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={chatStyles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ChatInput
          onSubmit={handleGenerateAd}
          onAddImage={handleAddImage}
          isGenerating={isGenerating}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Main app styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001219',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#002233',
    backgroundColor: '#001219',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#001219',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  selectedImagePreview: {
    padding: 8,
    paddingBottom: 0,
    backgroundColor: '#001219',
  },
});

// Chat-specific styles
const chatStyles = StyleSheet.create({
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginVertical: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    padding: 8,
    paddingTop: 6,
    paddingBottom: 26,
    backgroundColor: '#001219',
    borderTopWidth: 2,
    borderTopColor: '#002233',
    marginBottom: 30, // Add this new line
  },
  ovalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002233',
    borderRadius: 24,
    padding: 8,
  },
  addButtonContainer: {
    marginRight: 4,
  },
  addButton: {
    color: 'white',
    fontSize: 20,
    width: 40,
    height: 40,
    backgroundColor: '#003344',
    borderRadius: 20,
    textAlign: 'center',
    lineHeight: 34,
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: '#0080ff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
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
    backgroundColor: '#002233',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#bbb',
    marginTop: 8,
  },
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginVertical: 4,
    marginHorizontal: 4,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removePreviewButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
