import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MealType} from '../types';
import {COLORS} from '../constants';
import {mealRecordService} from '../services/mealRecordService';

interface MealTypeSelectorProps {
  selectedType: MealType;
  onSelect: (type: MealType) => void;
}

const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return 'wb-sunny';
      case 'lunch':
        return 'restaurant';
      case 'dinner':
        return 'dinner-dining';
      case 'snack':
        return 'local-cafe';
      default:
        return 'restaurant';
    }
  };

  return (
    <View style={styles.container}>
      {mealTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.mealTypeButton,
            selectedType === type && styles.mealTypeButtonActive,
          ]}
          onPress={() => onSelect(type)}>
          <Icon
            name={getMealIcon(type)}
            size={24}
            color={selectedType === type ? COLORS.WHITE : COLORS.PRIMARY}
          />
          <Text
            style={[
              styles.mealTypeText,
              selectedType === type && styles.mealTypeTextActive,
            ]}>
            {mealRecordService.getMealTypeLabel(type)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  mealTypeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  mealTypeTextActive: {
    color: COLORS.WHITE,
  },
});

export default MealTypeSelector;

