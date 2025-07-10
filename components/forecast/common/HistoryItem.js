import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

const HistoryItem = ({ item, properties, colors, imageUrl }) => {
  const [imageLoading, setImageLoading] = useState(!!imageUrl);
  const [imageError, setImageError] = useState(false);
  
  return (
    <View style={[styles.historyItem, {backgroundColor: colors.card}]}>
      {imageUrl && !imageError && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              console.error('Failed to load image:', imageUrl);
              setImageLoading(false);
              setImageError(true);
            }}
          />
          {imageLoading && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.imageLoader} 
            />
          )}
        </View>
      )}
      
      <View style={styles.contentContainer}>
        {properties.map((prop, index) => (
          <View key={index} style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, {color: colors.textSecondary}]}>
              {prop.label}
            </Text>
            <Text style={[styles.historyItemValue, {color: colors.text}]}>
              {prop.valueFormatter ? prop.valueFormatter(item[prop.key]) : item[prop.key]}
            </Text>
          </View>
        ))}
        
        <Text style={[styles.historyDate, {color: colors.textSecondary}]}>
          {new Date(item.uploaded_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 15,
    width: 80,
    height: 80,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  imageLoader: {
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
  },
  historyItemRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  historyItemLabel: {
    width: 80,
  },
  historyItemValue: {
    flex: 1,
    fontWeight: '500',
  },
  historyDate: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default HistoryItem;
