import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FoodItem} from '../types';
import {ConsumptionRecommendation} from '../utils/foodRecommendation';
import {COLORS} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ConsumptionRecommendationProps {
  recommendation: ConsumptionRecommendation;
  currentServingSize: number;
  onApplyRecommendedSize?: (size: number) => void;
}

const ConsumptionRecommendationComponent: React.FC<
  ConsumptionRecommendationProps
> = ({recommendation, currentServingSize, onApplyRecommendedSize}) => {
  const navigation = useNavigation<NavigationProp>();

  const getWarningColor = () => {
    switch (recommendation.warningLevel) {
      case 'safe':
        return COLORS.SAFE;
      case 'moderate':
        return COLORS.WARNING;
      case 'high':
        return COLORS.DANGER;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getWarningIcon = () => {
    switch (recommendation.warningLevel) {
      case 'safe':
        return 'check-circle';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleAlternativeFoodPress = (food: FoodItem) => {
    navigation.navigate('GLCalculation', {food});
  };

  return (
    <View style={styles.container}>
      {/* 메인 메시지 */}
      <View
        style={[
          styles.messageCard,
          {borderLeftColor: getWarningColor(), borderLeftWidth: 4},
        ]}>
        <View style={styles.messageHeader}>
          <Icon
            name={getWarningIcon()}
            size={24}
            color={getWarningColor()}
            style={styles.icon}
          />
          <Text style={[styles.message, {color: getWarningColor()}]}>
            {recommendation.message}
          </Text>
        </View>
      </View>

      {/* 권장 섭취량 (위험/매우 위험인 경우) */}
      {recommendation.recommendedServingSize &&
        recommendation.recommendedServingSize !== currentServingSize &&
        recommendation.warningLevel !== 'safe' && (
          <View style={styles.recommendedSizeCard}>
            <Text style={styles.recommendedSizeLabel}>권장 섭취량</Text>
            <View style={styles.recommendedSizeRow}>
              <Text style={styles.recommendedSizeValue}>
                {recommendation.recommendedServingSize}g
              </Text>
              {onApplyRecommendedSize && (
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() =>
                    onApplyRecommendedSize(
                      recommendation.recommendedServingSize!,
                    )
                  }>
                  <Text style={styles.applyButtonText}>적용</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.recommendedSizeNote}>
              현재: {currentServingSize}g → 권장: {recommendation.recommendedServingSize}g
            </Text>
          </View>
        )}

      {/* 대체 음식 (매우 위험인 경우) */}
      {recommendation.alternativeFoods &&
        recommendation.alternativeFoods.length > 0 && (
          <View style={styles.alternativeCard}>
            <Text style={styles.alternativeTitle}>
              <Icon name="restaurant" size={18} color={COLORS.PRIMARY} />{' '}
              대체 음식 추천
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.alternativeList}>
              {recommendation.alternativeFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.alternativeItem}
                  onPress={() => handleAlternativeFoodPress(food)}>
                  <Text style={styles.alternativeFoodName}>{food.nameKo}</Text>
                  <Text style={styles.alternativeFoodGL}>
                    GL: {food.calculatedGL}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      {/* 팁 */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.tipsTitle}>섭취 팁</Text>
        </View>
        {recommendation.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Icon
              name="check"
              size={16}
              color={COLORS.SAFE}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  messageCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  recommendedSizeCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendedSizeLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  recommendedSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedSizeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedSizeNote: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  alternativeCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  alternativeList: {
    flexDirection: 'row',
  },
  alternativeItem: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  alternativeFoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  alternativeFoodGL: {
    fontSize: 12,
    color: COLORS.SAFE,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    lineHeight: 20,
  },
});

export default ConsumptionRecommendationComponent;

