import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultCard = ({ title, data, colors }) => {
  return (
    <View style={[styles.resultContainer, {backgroundColor: colors.card}]}>
      <Text style={[styles.resultTitle, {color: colors.text}]}>{title}</Text>
      
      {data.map((item, index) => (
        <View key={index} style={styles.resultRow}>
          <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>
            {item.label}
          </Text>
          <Text style={[styles.resultValue, {color: colors.text}]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  resultLabel: {
    width: 100,
    fontSize: 16,
  },
  resultValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ResultCard;
