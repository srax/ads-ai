import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Define interfaces for component props
interface ChatInputProps {
  onSubmit: () => void;
  onAddImage: () => void;
  isGenerating: boolean;
}

// Mock components and API service since files were deleted
const ChatInput = ({ onSubmit, onAddImage, isGenerating }: ChatInputProps) => {
  const [prompt, setPrompt] = useState('');
  
  return (
    <View style={mockStyles.inputContainer}>
      <View style={mockStyles.ovalContainer}>
        <TouchableOpacity onPress={onAddImage} style={mockStyles.addButtonContainer}>
          <Text style={mockStyles.addButton}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={mockStyles.inputField}
          placeholder="Describe your ad.."
          placeholderTextColor="#9e9e9e"
          value={prompt}
          onChangeText={setPrompt}
          multiline={false}
        />
        <TouchableOpacity 
          onPress={() => {
            if (prompt.trim()) {
              onSubmit();
              setPrompt('');
            }
          }}
          disabled={!prompt.trim()}
        >
          <View style={[
            mockStyles.generateButton,
            !prompt.trim() && mockStyles.disabledButton
          ]}>
            <Text style={mockStyles.generateText}>Generate Ad</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InspirationScroll = () => (
  <View style={mockStyles.inspirationContainer}>
    <Text style={mockStyles.emptyText}>Your generated ads will appear here</Text>
  </View>
);

// Mock ad generation screen
export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerateAd = () => {
    Alert.alert('Generate Ad', 'Ad generation functionality would go here');
  };

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
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert('Image Selected', 'Image has been selected and will be used for ad generation.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={mockStyles.welcomeContainer}>
          <Text style={mockStyles.welcomeText}>Ads.ai</Text>
          <Text style={mockStyles.subText}>
            Use the input below to describe the ad you want to create.
            Your generated ads will appear here.
          </Text>
        </View>
        
        {selectedImage && (
          <View style={mockStyles.selectedImageContainer}>
            <Image 
              source={{ uri: selectedImage }} 
              style={mockStyles.selectedImage} 
            />
            <TouchableOpacity 
              style={mockStyles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={mockStyles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <InspirationScroll />
      </ScrollView>

      <ChatInput
        onSubmit={handleGenerateAd}
        onAddImage={handleAddImage}
        isGenerating={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212529',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#212529',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#212529',
  },
});

// Styles for our mock components
const mockStyles = StyleSheet.create({
  inputContainer: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: '#212529',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  ovalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 8,
  },
  addButtonContainer: {
    marginRight: 4,
  },
  addButton: {
    color: 'white',
    fontSize: 20,
    width: 30,
    height:34,
    backgroundColor: '#555',
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  placeholder: {
    color: '#9e9e9e',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#4e4e4e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inspirationContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyText: {
    color: '#9e9e9e',
    fontSize: 16,
    textAlign: 'center',
  },
  welcomeContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  selectedImageContainer: {
    position: 'relative',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
