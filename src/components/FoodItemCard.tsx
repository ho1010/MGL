import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {FoodItem} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import GLBadge from './GLBadge';
import {getGLSafetyLevel} from '../utils/glCalculator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FoodItemCardProps {
  food: FoodItem;
  onPress?: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({food, onPress}) => {
  const {theme} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const safetyLevel = getGLSafetyLevel(food.calculatedGL);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('GLCalculation', {food});
    }
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.SURFACE,
            ...theme.shadows.md,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
      <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text
              style={[
                styles.foodName,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.h5,
              ]}>
              {food.nameKo}
            </Text>
            {food.nameEn && (
              <Text
                style={[
                  styles.foodNameEn,
                  {color: theme.colors.TEXT_SECONDARY},
                  theme.typography.body2,
                ]}>
                {food.nameEn}
              </Text>
            )}
          </View>
          <GLBadge gl={food.calculatedGL} safetyLevel={safetyLevel} />
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.infoText,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.body2,
            ]}>
            GI: {food.glycemicIndex}
          </Text>
          <Text
            style={[
              styles.infoText,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.body2,
            ]}>
            탄수화물: {food.carbohydratesPer100g}g/100g
          </Text>
          <Text
            style={[
              styles.infoText,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.body2,
            ]}>
            제공량: {food.standardServingSize}g
          </Text>
        </View>
        <View
          style={[
            styles.categoryContainer,
            {borderTopColor: theme.colors.DIVIDER},
          ]}>
          <Text
            style={[
              styles.categoryText,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.caption,
            ]}>
            {food.category}
          </Text>
          <Text
            style={[
              styles.classificationText,
              {color: theme.colors.PRIMARY},
              theme.typography.caption,
            ]}>
            {food.glClassification === 'SAFE' && '안전'}
            {food.glClassification === 'MODERATE' && '위험'}
            {food.glClassification === 'HIGH_RISK' && '매우 위험'}
          </Text>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  foodNameEn: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  info: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BACKGROUND,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  classificationText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default FoodItemCard;

