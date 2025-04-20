import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, FlatList, SafeAreaView } from 'react-native';

interface FeedItem {
  id: string;
  imageUrl: string;
  height: number;
}

// Generate a large array of feed items with varying heights
const generateFeedItems = (): FeedItem[] => {
  const items: FeedItem[] = [];
  for (let i = 1; i <= 50; i++) {
    items.push({
      id: `${i}`,
      imageUrl: `https://picsum.photos/600/800?random=${i}`,
      height: Math.random() * 150 + 150 // Random heights between 150-300
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
  
  // Combine into a format for FlatList
  return [
    { id: 'left', items: leftColumnItems },
    { id: 'right', items: rightColumnItems }
  ];
};

const COLUMN_WIDTH = (Dimensions.get('window').width - 40) / 2; // 40px for padding and gap

const FeedScreen = () => {
  const columnData = formatDataIntoColumns(FEED_ITEMS);

  const renderColumn = ({ item }: { item: { id: string, items: FeedItem[] } }) => (
    <View style={styles.column}>
      {item.items.map((feedItem) => (
        <TouchableOpacity key={feedItem.id} style={[styles.feedItem, { height: feedItem.height }]}>
          <Image 
            source={{ uri: feedItem.imageUrl }} 
            style={styles.feedImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </View>
      
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
  feedList: {
    padding: 8,
    paddingBottom: 100, // Increased padding for repositioned tab bar
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
    backgroundColor: '#002233',
    marginBottom: 16,
  },
  feedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default FeedScreen;
