import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for bookmarked ads
const MOCK_BOOKMARKED_ADS = [
  { id: '1', imageUrl: 'https://picsum.photos/400?1', prompt: 'Modern coffee shop advertisement with minimalist design' },
  { id: '2', imageUrl: 'https://picsum.photos/400?2', prompt: 'Sleek tech product on dark background with blue accent lighting' },
  { id: '3', imageUrl: 'https://picsum.photos/400?3', prompt: 'Organic food delivery service with fresh vegetables' },
  { id: '4', imageUrl: 'https://picsum.photos/400?4', prompt: 'Fitness app promotion with motivational quote' },
];

interface BookmarkedAd {
  id: string;
  imageUrl: string;
  prompt: string;
}

// BookmarkItem component
const BookmarkItem = ({ ad, onRemove }: { ad: BookmarkedAd; onRemove: (id: string) => void }) => {
  return (
    <View style={styles.bookmarkItem}>
      <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />
      <View style={styles.adDetails}>
        <Text style={styles.adPrompt} numberOfLines={2}>
          {ad.prompt}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onRemove(ad.id)}
          >
            <Text style={styles.actionIcon}>✕</Text>
            <Text style={styles.actionText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function BookmarksScreen() {
  const [bookmarkedAds, setBookmarkedAds] = useState<BookmarkedAd[]>(MOCK_BOOKMARKED_ADS);

  const handleRemoveBookmark = (id: string) => {
    setBookmarkedAds(prev => prev.filter(ad => ad.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {bookmarkedAds.length > 0 ? (
        <FlatList
          data={bookmarkedAds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookmarkItem ad={item} onRemove={handleRemoveBookmark} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No bookmarked ads yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your bookmarked ads will appear here. Tap the bookmark icon on any ad to save it.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bookmarkItem: {
    backgroundColor: '#000000',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  adImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
  },
  adDetails: {
    padding: 16,
  },
  adPrompt: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    color: 'white',
    fontSize: 18,
    marginBottom: 4,
  },
  actionText: {
    color: '#ccc',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    color: '#9e9e9e',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
