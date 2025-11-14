import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {FoodItem} from '../types';
import {GL_COLOR_MAP, GL_LABEL_MAP} from '../constants';
import {GLSafetyLevel} from '../constants';
import {
  calculateGLForServing,
  getGLSafetyLevel,
  getGLSafetyMessage,
} from '../utils/glCalculator';
import {
  generateConsumptionRecommendation,
  ConsumptionRecommendation,
} from '../utils/foodRecommendation';
import ConsumptionRecommendationComponent from '../components/ConsumptionRecommendation';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {useTheme} from '../contexts/ThemeContext';
import AnimatedGLValue from '../components/AnimatedGLValue';
import ColorTransitionView from '../components/ColorTransitionView';
import Icon from 'react-native-vector-icons/MaterialIcons';

type GLCalculationScreenRouteProp = RouteProp<
  RootStackParamList,
  'GLCalculation'
>;
type GLCalculationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GLCalculation'
>;

interface Props {
  navigation: GLCalculationScreenNavigationProp;
  route: GLCalculationScreenRouteProp;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const GLCalculationScreen: React.FC<Props> = ({navigation, route}) => {
  const {theme} = useTheme();
  const food = route.params?.food;
  const [servingSize, setServingSize] = useState(
    food?.standardServingSize || 100,
  );
  const [calculatedGL, setCalculatedGL] = useState(0);
  const [safetyLevel, setSafetyLevel] = useState<GLSafetyLevel>(
    GLSafetyLevel.SAFE,
  );
  const [displayGL, setDisplayGL] = useState(0);
  const [recommendation, setRecommendation] = useState<
    ConsumptionRecommendation | null
  >(null);

  const allFoods = useSelector((state: RootState) => state.food.detectedFoods);

  // 애니메이션 값
  const colorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 초기 GL 값 설정
  useEffect(() => {
    if (food && displayGL === 0) {
      const initialGL = calculateGLForServing(
        food.glycemicIndex,
        food.carbohydratesPer100g,
        food.standardServingSize || 100,
      );
      setDisplayGL(initialGL);
      setCalculatedGL(initialGL);
      setSafetyLevel(getGLSafetyLevel(initialGL));
      
      // 페이드 인 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [food]);

  // GL 계산 (섭취량 변경 시)
  useEffect(() => {
    if (food) {
      const gl = calculateGLForServing(
        food.glycemicIndex,
        food.carbohydratesPer100g,
        servingSize,
      );
      const level = getGLSafetyLevel(gl);

      setCalculatedGL(gl);
      setSafetyLevel(level);

      // 섭취 제안 생성
      const newRecommendation = generateConsumptionRecommendation(
        food,
        servingSize,
        allFoods.length > 0 ? allFoods : undefined,
      );
      setRecommendation(newRecommendation);

      // GL 값 애니메이션 (숫자 카운트업)
      const startValue = displayGL;
      const endValue = gl;
      const duration = 600;
      const steps = 40;
      const stepValue = (endValue - startValue) / steps;
      const stepDuration = duration / steps;

      // 기존 interval 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      let currentStep = 0;
      intervalRef.current = setInterval(() => {
        currentStep++;
        const newValue = Math.round(startValue + stepValue * currentStep);
        setDisplayGL(newValue);

        if (currentStep >= steps) {
          setDisplayGL(endValue);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, stepDuration);

      // 색상 및 스케일 애니메이션
      Animated.parallel([
        Animated.timing(colorAnim, {
          toValue:
            level === GLSafetyLevel.SAFE
              ? 0
              : level === GLSafetyLevel.MODERATE
              ? 1
              : 2,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [servingSize, food, displayGL, allFoods]);

  // 권장 섭취량 적용
  const handleApplyRecommendedSize = (recommendedSize: number) => {
    setServingSize(recommendedSize);
  };

  // 대체 음식 선택 시
  const handleSelectAlternativeFood = (altFood: FoodItem) => {
    navigation.replace('GLCalculation', {food: altFood});
  };

  if (!food) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.BACKGROUND}]}>
        <Text style={[styles.errorText, {color: theme.colors.DANGER}]}>
          음식 정보를 불러올 수 없습니다.
        </Text>
      </View>
    );
  }

  const carbsInServing = (food.carbohydratesPer100g * servingSize) / 100;

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      GL_COLOR_MAP[GLSafetyLevel.SAFE],
      GL_COLOR_MAP[GLSafetyLevel.MODERATE],
      GL_COLOR_MAP[GLSafetyLevel.HIGH_RISK],
    ],
  });

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.BACKGROUND}]}
      contentContainerStyle={styles.content}>
      <Animated.View style={{opacity: fadeAnim}}>
        {/* 음식 이미지 및 이름 */}
        <View style={styles.imageContainer}>
          {food.imageUrl ? (
            <Image
              source={{uri: food.imageUrl}}
              style={[
                styles.foodImage,
                {
                  backgroundColor: theme.colors.SURFACE_VARIANT,
                  ...theme.shadows.lg,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.noImageIcon,
                {
                  backgroundColor: theme.colors.SURFACE_VARIANT,
                  ...theme.shadows.lg,
                },
              ]}>
              <Icon name="restaurant" size={64} color={theme.colors.TEXT_SECONDARY} />
            </View>
          )}
          <Text
            style={[
              styles.foodNameKo,
              {color: theme.colors.TEXT_PRIMARY},
              theme.typography.h2,
            ]}>
            {food.nameKo}
          </Text>
          {food.nameEn && (
            <Text
              style={[
                styles.foodNameEn,
                {color: theme.colors.TEXT_SECONDARY},
                theme.typography.body1,
              ]}>
              {food.nameEn}
            </Text>
          )}
        </View>

        {/* 정보 카드 */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.md,
            },
          ]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon
                name="speed"
                size={24}
                color={theme.colors.PRIMARY}
                style={styles.infoIcon}
              />
              <Text style={[styles.infoLabel, {color: theme.colors.TEXT_SECONDARY}]}>
                GI
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {color: theme.colors.TEXT_PRIMARY},
                  theme.typography.h4,
                ]}>
                {food.glycemicIndex}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon
                name="grain"
                size={24}
                color={theme.colors.PRIMARY}
                style={styles.infoIcon}
              />
              <Text style={[styles.infoLabel, {color: theme.colors.TEXT_SECONDARY}]}>
                탄수화물
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {color: theme.colors.TEXT_PRIMARY},
                  theme.typography.h4,
                ]}>
                {food.carbohydratesPer100g}g
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon
                name="category"
                size={24}
                color={theme.colors.PRIMARY}
                style={styles.infoIcon}
              />
              <Text style={[styles.infoLabel, {color: theme.colors.TEXT_SECONDARY}]}>
                {food.category}
              </Text>
            </View>
          </View>
        </View>

        {/* 섭취량 조절 슬라이더 */}
        <View
          style={[
            styles.sliderCard,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.md,
            },
          ]}>
          <View style={styles.sliderHeader}>
            <Icon
              name="tune"
              size={24}
              color={theme.colors.PRIMARY}
              style={styles.sliderIcon}
            />
            <Text
              style={[
                styles.sliderLabel,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.h5,
              ]}>
              섭취량 조절
            </Text>
          </View>
          <View style={styles.sliderValueContainer}>
            <Text
              style={[
                styles.sliderValue,
                {color: theme.colors.PRIMARY},
                theme.typography.displaySmall,
              ]}>
              {servingSize}g
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={500}
            step={10}
            value={servingSize}
            onValueChange={setServingSize}
            minimumTrackTintColor={theme.colors.PRIMARY}
            maximumTrackTintColor={theme.colors.DIVIDER}
            thumbTintColor={theme.colors.PRIMARY}
          />
          <View style={styles.sliderMinMax}>
            <Text style={[styles.sliderMinMaxText, {color: theme.colors.TEXT_SECONDARY}]}>
              최소 10g
            </Text>
            <Text style={[styles.sliderMinMaxText, {color: theme.colors.TEXT_SECONDARY}]}>
              최대 500g
            </Text>
          </View>
        </View>

        {/* GL 결과 카드 (강조) */}
        <Animated.View
          style={[
            styles.glResultCard,
            {
              backgroundColor,
              transform: [{scale: scaleAnim}],
              ...theme.shadows.xl,
            },
          ]}>
          <Text
            style={[
              styles.glLabel,
              {color: theme.colors.WHITE},
              theme.typography.h5,
            ]}>
            혈당부하지수
          </Text>
          <View style={styles.glValueContainer}>
            <AnimatedGLValue value={displayGL} size="large" />
          </View>
          <View style={styles.glFormulaContainer}>
            <Text
              style={[
                styles.glFormula,
                {color: theme.colors.WHITE, opacity: 0.9},
                theme.typography.body1,
              ]}>
              GL = (GI × 탄수화물) ÷ 100
            </Text>
            <Text
              style={[
                styles.glFormulaDetail,
                {color: theme.colors.WHITE, opacity: 0.8},
                theme.typography.caption,
              ]}>
              = ({food.glycemicIndex} × {carbsInServing.toFixed(1)}) ÷ 100
            </Text>
          </View>
        </Animated.View>

        {/* 안전도 배지 */}
        <View
          style={[
            styles.safetyBadge,
            {
              backgroundColor: GL_COLOR_MAP[safetyLevel],
              ...theme.shadows.md,
            },
          ]}>
          <Icon
            name={
              safetyLevel === GLSafetyLevel.SAFE
                ? 'check-circle'
                : safetyLevel === GLSafetyLevel.MODERATE
                ? 'warning'
                : 'error'
            }
            size={28}
            color={theme.colors.WHITE}
            style={styles.safetyIcon}
          />
          <Text
            style={[
              styles.safetyText,
              {color: theme.colors.WHITE},
              theme.typography.h5,
            ]}>
            {GL_LABEL_MAP[safetyLevel]}
          </Text>
        </View>

        <Text
          style={[
            styles.safetyMessage,
            {color: theme.colors.TEXT_SECONDARY},
            theme.typography.bodyLarge,
          ]}>
          {getGLSafetyMessage(calculatedGL)}
        </Text>

        {/* 섭취 제안 컴포넌트 */}
        {recommendation && (
          <ConsumptionRecommendationComponent
            recommendation={recommendation}
            onApplyRecommendedSize={handleApplyRecommendedSize}
            onSelectAlternativeFood={handleSelectAlternativeFood}
          />
        )}

        {/* 상세 정보 */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.md,
            },
          ]}>
          <View style={styles.detailHeader}>
            <Icon
              name="info"
              size={24}
              color={theme.colors.PRIMARY}
              style={styles.detailIcon}
            />
            <Text
              style={[
                styles.detailTitle,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.h5,
              ]}>
              상세 정보
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, {color: theme.colors.TEXT_SECONDARY}]}>
              계산된 GL:
            </Text>
            <Text
              style={[
                styles.detailValue,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              {calculatedGL}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, {color: theme.colors.TEXT_SECONDARY}]}>
              섭취량:
            </Text>
            <Text
              style={[
                styles.detailValue,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              {servingSize}g
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, {color: theme.colors.TEXT_SECONDARY}]}>
              섭취량 기준 탄수화물:
            </Text>
            <Text
              style={[
                styles.detailValue,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              {carbsInServing.toFixed(1)}g
            </Text>
          </View>
          {food.caloriesPer100g && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: theme.colors.TEXT_SECONDARY}]}>
                섭취량 기준 칼로리:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {color: theme.colors.TEXT_PRIMARY},
                  theme.typography.bodyLarge,
                ]}>
                {((food.caloriesPer100g * servingSize) / 100).toFixed(0)}kcal
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foodImage: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: 20,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  noImageIcon: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodNameKo: {
    textAlign: 'center',
    marginBottom: 8,
  },
  foodNameEn: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '600',
  },
  sliderCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sliderIcon: {
    marginRight: 4,
  },
  sliderLabel: {
    fontWeight: '600',
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderValue: {
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 50,
    marginBottom: 8,
  },
  sliderMinMax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMinMaxText: {
    fontSize: 12,
  },
  glResultCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 280,
    justifyContent: 'center',
  },
  glLabel: {
    marginBottom: 16,
    fontWeight: '600',
  },
  glValueContainer: {
    marginBottom: 20,
  },
  glFormulaContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  glFormula: {
    marginBottom: 4,
  },
  glFormulaDetail: {
    fontSize: 12,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    gap: 12,
  },
  safetyIcon: {
    marginRight: 4,
  },
  safetyText: {
    fontWeight: '600',
  },
  safetyMessage: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  detailCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailTitle: {
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
});

export default GLCalculationScreen;
