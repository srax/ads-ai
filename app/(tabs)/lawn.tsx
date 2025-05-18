import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LucideIcon } from '@/components/LucideIcons';
import openAIService from '../../services/openAIService';

export default function LawnScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Check file size (5MB limit)
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        // Use type assertion for size property which exists at runtime but not in types
        const fileSize = (fileInfo as any).size;
        if (fileSize && fileSize > 5 * 1024 * 1024) {
          Alert.alert("File too large", "Please select an image under 5MB");
          return;
        }
        
        setSelectedImage(result.assets[0].uri);
        setResultImage(null); // Clear any previous result
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Camera access is needed to take photos");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setResultImage(null); // Clear any previous result
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Generate landscape design
  const generateDesign = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select or take a photo first");
      return;
    }

    setIsLoading(true);
    try {
      // Default prompt for lawn landscaping
      const prompt = "Do some landscaping and show me how to make it better";
      
      // Call OpenAI service
      const result = await openAIService.generateLandscapeDesign(selectedImage, prompt);
      
      if (result && result.images && result.images.length > 0) {
        setResultImage(result.images[0]);
      } else {
        Alert.alert("Generation Failed", "Could not generate landscape design");
      }
    } catch (error) {
      console.error("Error generating design:", error);
      Alert.alert("Error", "Failed to generate landscape design");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Lawn Designer</Text>
          <Text style={styles.subtitle}>
            Upload your yard photo and we'll suggest landscape improvements
          </Text>
        </View>

        {/* Image Selection Area */}
        {!selectedImage ? (
          <View style={styles.uploadContainer}>
            <LucideIcon name="tree" size={60} color="#4CAF50" />
            <Text style={styles.uploadText}>Upload yard photo</Text>
            <Text style={styles.uploadSubtext}>
              JPEG, PNG • Max size 5MB
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                <LucideIcon name="download" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Select Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <LucideIcon name="share" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imagePreviewContainer}>
            {/* Selected Image */}
            <View style={styles.imageCard}>
              <Text style={styles.imageLabel}>Your Photo</Text>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.changeButton} 
                onPress={pickImage}
              >
                <Text style={styles.changeButtonText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Generate Button */}
            {!resultImage && !isLoading && (
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateDesign}
              >
                <Text style={styles.generateButtonText}>Generate Design</Text>
              </TouchableOpacity>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Creating your design...</Text>
              </View>
            )}

            {/* Result Image */}
            {resultImage && (
              <View style={styles.imageCard}>
                <Text style={styles.imageLabel}>Landscape Design</Text>
                <Image 
                  source={{ uri: resultImage }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.generateButton}
                  onPress={generateDesign}
                >
                  <Text style={styles.generateButtonText}>Generate Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  uploadContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 300,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flex: 1,
  },
  cameraButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewImage: {
    width: '100%',
    height: 250,
  },
  changeButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  changeButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 20,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
}); 