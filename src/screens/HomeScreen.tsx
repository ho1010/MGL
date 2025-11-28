import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
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
import {GLSafetyLevel} from '../constants';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {theme} = useTheme();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.user);
  const dailyStats = useSelector((state: RootState) => state.meal.dailyStats);
  const mealRecords = useSelector((state: RootState) => state.meal.records);
  const [dailyGLTarget, setDailyGLTarget] = React.useState(80);

  // 오늘 날짜
  const today = new Date();

  // 사용자 정보 및 설정 로드
  useEffect(() => {
    if (user) {
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
  const recordCount = mealRecords.length;
  const usedPercentage = dailyGLTarget > 0 ? (currentGL / dailyGLTarget) * 100 : 0;
  const isGoalAchieved = currentGL <= dailyGLTarget;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>당뇨 관리</Text>
          <Text style={styles.headerSubtitle}>혈당부하지수로 건강 관리</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* 오늘의 총 GL 카드 */}
          <View style={styles.glCard}>
            <View style={styles.glCardHeader}>
              <Text style={styles.glCardLabel}>오늘의 총 GL</Text>
              {isGoalAchieved && (
                <TouchableOpacity style={styles.goalAchievedButton}>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.goalAchievedText}>목표 달성</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.glValue}>{currentGL.toFixed(1)}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarWrapper}>
                <GLProgressBar
                  currentGL={currentGL}
                  targetGL={dailyGLTarget}
                  height={6}
                  showLabel={false}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.recommendedText}>권장: {dailyGLTarget} 이하</Text>
                <Text style={styles.recordCountText}>{recordCount}개 기록</Text>
              </View>
            </View>
          </View>

          {/* 음식 분석 프롬프트 카드 */}
          <TouchableOpacity
            style={styles.analysisCard}
            onPress={() => navigation.navigate('Camera')}>
            <View style={styles.analysisIconContainer}>
              <Icon name="trending-up" size={56} color="#4A90E2" />
            </View>
            <Text style={styles.analysisTitle}>음식을 분석해보세요</Text>
            <Text style={styles.analysisDescription}>
              섭취할 음식의 사진을 촬영하여 혈당부하지수를 확인하세요
            </Text>
          </TouchableOpacity>

          {/* GL 기준 섹션 */}
          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaTitle}>혈당부하지수(GL) 기준</Text>
            <View style={styles.criteriaList}>
              {/* 안전 */}
              <View style={[styles.criteriaItem, styles.safeItem]}>
                <View style={[styles.criteriaIconContainer, styles.safeIconContainer]}>
                  <Icon name="check-circle" size={28} color="#4CAF50" />
                </View>
                <View style={styles.criteriaContent}>
                  <Text style={[styles.criteriaLabel, styles.safeLabel]}>
                    안전 (저혈당부하)
                  </Text>
                  <Text style={styles.criteriaDescription}>
                    GL 10 이하 - 안심하고 섭취 가능
                  </Text>
                </View>
              </View>

              {/* 위험 */}
              <View style={[styles.criteriaItem, styles.warningItem]}>
                <View style={[styles.criteriaIconContainer, styles.warningIconContainer]}>
                  <Icon name="warning" size={28} color="#FFC107" />
                </View>
                <View style={styles.criteriaContent}>
                  <Text style={[styles.criteriaLabel, styles.warningLabel]}>
                    위험 (중혈당부하)
                  </Text>
                  <Text style={styles.criteriaDescription}>
                    GL 11-19 - 섭취량 조절 필요
                  </Text>
                </View>
              </View>

              {/* 매우 위험 */}
              <View style={[styles.criteriaItem, styles.dangerItem]}>
                <View style={[styles.criteriaIconContainer, styles.dangerIconContainer]}>
                  <Icon name="close-circle" size={28} color="#F44336" />
                </View>
                <View style={styles.criteriaContent}>
                  <Text style={[styles.criteriaLabel, styles.dangerLabel]}>
                    매우 위험 (고혈당부하)
                  </Text>
                  <Text style={styles.criteriaDescription}>
                    GL 20 이상 - 주의 깊게 섭취
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 하단 액션 바 */}
        <TouchableOpacity
          style={styles.bottomActionBar}
          onPress={() => navigation.navigate('Camera')}
          activeOpacity={0.8}>
          <Icon name="camera-alt" size={24} color="#FFFFFF" />
          <Text style={styles.bottomActionText}>음식 사진 촬영하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  glCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  glCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  glCardLabel: {
    fontSize: 14,
    color: '#757575',
  },
  goalAchievedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  goalAchievedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  glValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recommendedText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  recordCountText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  analysisIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  criteriaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  criteriaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  criteriaList: {
    gap: 0,
  },
  criteriaItem: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    gap: 14,
    marginBottom: 4,
  },
  safeItem: {
    backgroundColor: '#E8F5E9',
  },
  warningItem: {
    backgroundColor: '#FFF9C4',
  },
  dangerItem: {
    backgroundColor: '#FFEBEE',
  },
  criteriaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeIconContainer: {
    backgroundColor: '#C8E6C9',
  },
  warningIconContainer: {
    backgroundColor: '#FFF59D',
  },
  dangerIconContainer: {
    backgroundColor: '#FFCDD2',
  },
  criteriaContent: {
    flex: 1,
  },
  criteriaLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  safeLabel: {
    color: '#2E7D32',
  },
  warningLabel: {
    color: '#F57C00',
  },
  dangerLabel: {
    color: '#C62828',
  },
  criteriaDescription: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 18,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomActionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
