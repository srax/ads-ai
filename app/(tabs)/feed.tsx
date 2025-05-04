import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, FlatList, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface FeedItem {
  id: string;
  imageSource: any;
  height: number;
  isLocalImage?: boolean;
  prompt?: string;
}

// Generate feed items with local images and random placeholders
const generateFeedItems = (): FeedItem[] => {
  const items: FeedItem[] = [];
  
  // Sample prompts for the images
  const samplePrompts = [
    "A serene Japanese forest with soft sunlight",
    "Minimalist portrait of a person looking away",
    "Dreamy landscape with pastel colors",
    "Abstract composition with geometric shapes",
    "Retro anime style character design",
    "Mystical forest scene with magical elements",
  ];
  
  // Add local images from assets/Feed_images folder
  const localImages = [
    { source: require('../../assets/Feed_images/arietti.jpg'), height: 280, prompt: samplePrompts[0] },
    { source: require('../../assets/Feed_images/Women.jpg'), height: 250, prompt: samplePrompts[1] },
    { source: require('../../assets/Feed_images/9ca645bab9fe891939fd75c0f130ee31.jpg'), height: 240, prompt: samplePrompts[2] },
    { source: require('../../assets/Feed_images/31d9b6e82f124a6674923b88680b9ff8.jpg'), height: 220, prompt: samplePrompts[3] },
    { source: require('../../assets/Feed_images/5d957b7687a565fe5a345ed078a06517.jpg'), height: 300, prompt: samplePrompts[4] },
    { source: require('../../assets/Feed_images/12082d516103bd912249a2b2e049a379.jpg'), height: 260, prompt: samplePrompts[5] },
  ];
  
  // Add local images first
  localImages.forEach((img, index) => {
    items.push({
      id: `local-${index}`,
      imageSource: img.source,
      height: img.height,
      isLocalImage: true,
      prompt: img.prompt
    });
  });
  
  // Then add placeholder images to get to 50 total
  const remainingCount = 50 - localImages.length;
  for (let i = 1; i <= remainingCount; i++) {
    items.push({
      id: `remote-${i}`,
      imageSource: `https://picsum.photos/600/800?random=${i}`,
      height: Math.random() * 150 + 150,
      isLocalImage: false,
      prompt: `Random image prompt #${i}`
    });
  }
  
  return items;
};

const FEED_ITEMS = generateFeedItems();

// Divide items into two columns
const formatDataIntoColumns = (data: FeedItem[]) => {
  const leftColumnItems: FeedItem[] = [];
  const rightColumnItems: FeedItem[] = [];
  
  data.forEach((item, index) => {
    if (index % 2 === 0) {
      leftColumnItems.push(item);
    } else {
      rightColumnItems.push(item);
    }
  });
  
  return [
    { id: 'left', items: leftColumnItems },
    { id: 'right', items: rightColumnItems }
  ];
};

const COLUMN_WIDTH = (Dimensions.get('window').width - 40) / 2;

const FeedScreen = () => {
  const columnData = formatDataIntoColumns(FEED_ITEMS);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderItem = (feedItem: FeedItem) => {
    const isSelected = selectedItem && selectedItem.id === feedItem.id && isModalOpen;

    // Handle click on an image
    const handlePress = () => {
      if (isSelected) {
        // Close if already selected
        setIsModalOpen(false);
        setSelectedItem(null);
      } else {
        // Open with this item
        setSelectedItem(feedItem);
        setIsModalOpen(true);
      }
    };

    return (
      <View key={feedItem.id} style={[styles.feedItem, { height: feedItem.height }]}>
        <TouchableOpacity 
          style={styles.imageContainer}
          activeOpacity={0.9}
          onPress={handlePress}
        >
          <Image 
            source={feedItem.isLocalImage ? feedItem.imageSource : { uri: feedItem.imageSource }}
            style={styles.feedImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Overlay that appears when selected */}
        {isSelected && (
          <Animated.View
            style={styles.promptOverlay}
            entering={FadeIn.springify().damping(15).stiffness(150)}
            exiting={FadeOut.duration(200)}
          >
            <TouchableOpacity 
              style={styles.promptContainer}
              activeOpacity={0.9}
              onPress={handlePress}
            >
              <Text style={styles.promptLabel}>prompt:</Text>
              <Text style={styles.promptText}>{feedItem.prompt}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderColumn = ({ item }: { item: { id: string, items: FeedItem[] } }) => (
    <View style={styles.column}>
      {item.items.map(renderItem)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={columnData}
        renderItem={renderColumn}
        keyExtractor={item => item.id}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  feedList: {
    padding: 8,
    paddingBottom: 100, // Extra space for tab bar
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  feedItem: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 16,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  feedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  promptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promptContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  promptLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promptText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default FeedScreen;
