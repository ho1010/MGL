import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {useTheme} from '../contexts/ThemeContext';
import {loadDailyStats, loadAllMealRecords} from '../store/slices/mealSlice';
import {userSettingsService} from '../services/userSettingsService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GLProgressBar from '../components/GLProgressBar';
import DonutChart from '../components/DonutChart';
import {MealType, MEAL_TYPE_LABELS} from '../types';
import {GL_COLOR_MAP} from '../constants';
import {GLSafetyLevel} from '../constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// 카테고리별 색상 매핑
const CATEGORY_COLORS: {[key: string]: string} = {
  아침: '#FF6B6B',
  점심: '#4ECDC4',
  저녁: '#45B7D1',
  간식: '#FFA07A',
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {theme} = useTheme();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.user);
  const dailyStats = useSelector((state: RootState) => state.meal.dailyStats);
  const mealRecords = useSelector((state: RootState) => state.meal.records);
  const [dailyGLTarget, setDailyGLTarget] = React.useState(80);
  const [userName, setUserName] = React.useState('사용자');

  // 오늘 날짜
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 이 달의 남은 일수 계산
  const daysLeftInMonth = useMemo(() => {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.getDate() - today.getDate();
  }, []);

  // 사용자 정보 및 설정 로드
  useEffect(() => {
    if (user) {
      setUserName(user.name || '사용자');
      userSettingsService
        .getUserSettings(user.id)
        .then((settings) => {
          setDailyGLTarget(settings.dailyGLTarget || 80);
        })
        .catch(() => {
          setDailyGLTarget(80);
        });
    }
  }, [user]);

  // 오늘의 통계 및 식사 기록 로드
  useEffect(() => {
    dispatch(loadDailyStats(today));
    dispatch(loadAllMealRecords());
  }, [dispatch]);

  // 오늘의 GL 값
  const currentGL = dailyStats?.totalGL || 0;
  const remainingGL = Math.max(0, dailyGLTarget - currentGL);
  const usedPercentage = dailyGLTarget > 0 ? (currentGL / dailyGLTarget) * 100 : 0;

  // 카테고리별 GL 분포 계산 (식사 타입별)
  const categoryData = useMemo(() => {
    if (!dailyStats || !dailyStats.meals) return [];

    const categoryMap: {[key: string]: number} = {};
    dailyStats.meals.forEach((meal) => {
      const category = MEAL_TYPE_LABELS[meal.mealType];
      categoryMap[category] = (categoryMap[category] || 0) + meal.totalGL;
    });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];

    return Object.entries(categoryMap)
      .map(([label, value]) => ({
        label,
        value: Math.round(value),
        color: CATEGORY_COLORS[label] || theme.colors.PRIMARY,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [dailyStats, theme.colors.PRIMARY]);

  // 최근 식사 기록 (최대 5개)
  const recentMeals = useMemo(() => {
    return mealRecords
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [mealRecords]);

  // 식사 타입 아이콘
  const getMealIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'breakfast':
        return 'breakfast-dining';
      case 'lunch':
        return 'lunch-dining';
      case 'dinner':
        return 'dinner-dining';
      case 'snack':
        return 'restaurant-menu';
      default:
        return 'restaurant';
    }
  };

  // 시간 포맷팅 (오늘, 어제, 날짜)
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7)
      return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'});
  };

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.BACKGROUND},
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 헤더 - 인사말 */}
        <View style={styles.header}>
          <Text style={[styles.greeting, {color: theme.colors.TEXT_PRIMARY}]}>
            안녕하세요, {userName}님!
          </Text>
          <Text
            style={[
              styles.subtitle,
              {color: theme.colors.TEXT_SECONDARY},
            ]}>
            혈당 관리를 현명하게
          </Text>
        </View>

        {/* 오늘의 총 GL 카드 */}
        <View
          style={[
            styles.glCard,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.lg,
            },
          ]}>
          <Text
            style={[styles.glCardLabel, {color: theme.colors.TEXT_SECONDARY}]}>
            오늘의 총 GL
          </Text>
          <View style={styles.glValueContainer}>
            <Text
              style={[
                styles.glValue,
                {color: theme.colors.TEXT_PRIMARY},
              ]}>
              {currentGL.toFixed(0)}
            </Text>
            <Text
              style={[
                styles.glTarget,
                {color: theme.colors.TEXT_SECONDARY},
              ]}>
              / {dailyGLTarget}
            </Text>
          </View>
          <View style={styles.glInfoRow}>
            <Text
              style={[
                styles.remainingText,
                {
                  color:
                    remainingGL > 0
                      ? theme.colors.SAFE
                      : theme.colors.DANGER,
                },
              ]}>
              {remainingGL > 0
                ? `${remainingGL.toFixed(0)} 남음`
                : `${Math.abs(remainingGL).toFixed(0)} 초과`}
            </Text>
            <Text
              style={[
                styles.daysLeftText,
                {color: theme.colors.TEXT_SECONDARY},
              ]}>
              {daysLeftInMonth}일 남음
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <GLProgressBar
              currentGL={currentGL}
              targetGL={dailyGLTarget}
              height={12}
              showLabel={false}
            />
            <View style={styles.progressInfo}>
              <Text
                style={[
                  styles.progressPercentage,
                  {
                    color:
                      usedPercentage > 100
                        ? theme.colors.DANGER
                        : theme.colors.TEXT_SECONDARY,
                  },
                ]}>
                {Math.min(usedPercentage, 100).toFixed(1)}% 사용
              </Text>
            </View>
          </View>
        </View>

        {/* 식사별 GL 분포 */}
        {categoryData.length > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.SURFACE,
                ...theme.shadows.md,
              },
            ]}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.TEXT_PRIMARY},
                ]}>
                식사별 GL 분포
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  {color: theme.colors.TEXT_SECONDARY},
                ]}>
                {today.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <DonutChart data={categoryData} total={currentGL} />
          </View>
        )}

        {/* 최근 식사 기록 */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.md,
            },
          ]}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {color: theme.colors.TEXT_PRIMARY},
              ]}>
              최근 식사
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('History')}>
              <Text
                style={[
                  styles.viewAllText,
                  {color: theme.colors.PRIMARY},
                ]}>
                전체보기
              </Text>
            </TouchableOpacity>
          </View>

          {recentMeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="restaurant"
                size={48}
                color={theme.colors.TEXT_SECONDARY}
              />
              <Text
                style={[
                  styles.emptyText,
                  {color: theme.colors.TEXT_SECONDARY},
                ]}>
                아직 식사 기록이 없습니다
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {backgroundColor: theme.colors.PRIMARY},
                ]}
                onPress={() => navigation.navigate('Camera')}>
                <Icon name="add" size={20} color={theme.colors.WHITE} />
                <Text
                  style={[styles.addButtonText, {color: theme.colors.WHITE}]}>
                  식사 추가
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {recentMeals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={[
                    styles.mealItem,
                    {
                      backgroundColor: theme.colors.BACKGROUND,
                      borderColor: theme.colors.DIVIDER,
                    },
                  ]}
                  onPress={() => {
                    // 식사 상세 보기로 이동 (필요시 구현)
                  }}>
                  <View style={styles.mealItemLeft}>
                    <View
                      style={[
                        styles.mealIconContainer,
                        {
                          backgroundColor: CATEGORY_COLORS[
                            MEAL_TYPE_LABELS[meal.mealType]
                          ] || theme.colors.PRIMARY,
                        },
                      ]}>
                      <Icon
                        name={getMealIcon(meal.mealType)}
                        size={20}
                        color={theme.colors.WHITE}
                      />
                    </View>
                    <View style={styles.mealItemInfo}>
                      <Text
                        style={[
                          styles.mealName,
                          {color: theme.colors.TEXT_PRIMARY},
                        ]}>
                        {meal.foods.length > 0
                          ? meal.foods[0].nameKo || meal.foods[0].nameEn
                          : MEAL_TYPE_LABELS[meal.mealType]}
                        {meal.foods.length > 1 &&
                          ` 외 ${meal.foods.length - 1}개`}
                      </Text>
                      <Text
                        style={[
                          styles.mealCategory,
                          {color: theme.colors.TEXT_SECONDARY},
                        ]}>
                        {MEAL_TYPE_LABELS[meal.mealType]} • {formatDate(meal.timestamp)} •{' '}
                        {formatTime(meal.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.mealGL,
                      {
                        color:
                          meal.totalGL > 20
                            ? theme.colors.DANGER
                            : meal.totalGL > 10
                            ? theme.colors.WARNING
                            : theme.colors.SAFE,
                      },
                    ]}>
                    -{meal.totalGL.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  glCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  glCardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  glValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  glValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  glTarget: {
    fontSize: 24,
    marginLeft: 4,
  },
  glInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysLeftText: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealsList: {
    gap: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  mealItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealItemInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 13,
  },
  mealGL: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
