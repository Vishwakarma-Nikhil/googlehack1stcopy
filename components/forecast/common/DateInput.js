import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatDate, addDays, parseDate } from '../../../utils/forecast/dateUtils';

const DateInput = ({ label, value, onChange, colors }) => {
  return (
    <View style={styles.formGroup}>
      <Text style={[styles.formLabel, {color: colors.textSecondary}]}>{label}</Text>
      <View style={styles.dateInputContainer}>
        <TouchableOpacity 
          style={[styles.dateActionButton, {backgroundColor: colors.primary + '20', borderRadius: 8}]}
          onPress={() => onChange(addDays(value, -1))}
        >
          <Feather name="minus" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.dateInput, {
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.background,
            textAlign: 'center',
            fontWeight: '500'
          }]}
          value={formatDate(value)}
          onChangeText={(text) => {
            const newDate = parseDate(text);
            if (newDate) {
              onChange(newDate);
            }
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
        
        <TouchableOpacity 
          style={[styles.dateActionButton, {backgroundColor: colors.primary + '20', borderRadius: 8}]}
          onPress={() => onChange(addDays(value, 1))}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.dateFormatHint, {color: colors.textSecondary}]}>
        Format: YYYY-MM-DD
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 8,
  },
  dateActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFormatHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DateInput;
