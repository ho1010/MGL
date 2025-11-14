import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {
  loadAllMealRecords,
  loadDailyStats,
  loadWeeklyStats,
  loadMonthlyStats,
  deleteMealRecord,
} from '../store/slices/mealSlice';
import {COLORS} from '../constants';
import CalendarView from '../components/CalendarView';
import GLProgressBar from '../components/GLProgressBar';
import StatisticsChart from '../components/StatisticsChart';
import {MealRecord, DailyGLStats, MEAL_TYPE_LABELS} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HistoryScreen = () => {
  const dispatch = useDispatch();
  const {
    records,
    dailyStats,
    weeklyStats,
    monthlyStats,
    loading,
  } = useSelector((state: RootState) => state.meal);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedMeals, setSelectedMeals] = useState<MealRecord[]>([]);

  // 초기 로드
  useEffect(() => {
    dispatch(loadAllMealRecords() as any);
  }, [dispatch]);

  // 날짜 선택 시 통계 로드
  useEffect(() => {
    if (viewMode === 'day') {
      dispatch(loadDailyStats(selectedDate) as any);
    } else if (viewMode === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      dispatch(loadWeeklyStats(weekStart) as any);
    } else if (viewMode === 'month') {
      dispatch(
        loadMonthlyStats({
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
        }) as any,
      );
    }
  }, [selectedDate, viewMode, dispatch]);

  // 선택된 날짜의 식사 목록 업데이트
  useEffect(() => {
    if (dailyStats) {
      setSelectedMeals(dailyStats.meals);
    } else {
      setSelectedMeals([]);
    }
  }, [dailyStats]);

  // 캘린더 마킹 데이터 생성
  const getMarkedDates = () => {
    const marked: {[key: string]: any} = {};
    const dailyTotals: {[key: string]: number} = {};

    // 날짜별 총 GL 계산
    records.forEach((record) => {
      const dateStr = new Date(record.timestamp).toISOString().split('T')[0];
      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = 0;
      }
      dailyTotals[dateStr] += record.totalGL;
    });

    // 마킹 데이터 생성
    Object.keys(dailyTotals).forEach((dateStr) => {
      const totalGL = dailyTotals[dateStr];
      let dotColor = COLORS.SAFE;
      if (totalGL > 80) {
        dotColor = COLORS.DANGER;
      } else if (totalGL > 60) {
        dotColor = COLORS.WARNING;
      }

      marked[dateStr] = {
        dots: [
          {
            key: dateStr,
            color: dotColor,
          },
        ],
      };
    });

    return marked;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert('삭제 확인', '이 식사 기록을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteMealRecord(mealId) as any);
          // 통계 다시 로드
          if (viewMode === 'day') {
            dispatch(loadDailyStats(selectedDate) as any);
          }
          dispatch(loadAllMealRecords() as any);
        },
      },
    ]);
  };

  const renderMealItem = ({item}: {item: MealRecord}) => {
    const mealTypeLabel = MEAL_TYPE_LABELS[item.mealType] || item.mealType;
    const timeStr = new Date(item.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.mealItem}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTypeContainer}>
            <Icon name="restaurant" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.mealType}>{mealTypeLabel}</Text>
            <Text style={styles.mealTime}>{timeStr}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteMeal(item.id)}
            style={styles.deleteButton}>
            <Icon name="delete" size={20} color={COLORS.DANGER} />
          </TouchableOpacity>
        </View>
        <View style={styles.mealFoods}>
          {item.foods.map((food) => (
            <Text key={food.id} style={styles.foodName}>
              • {food.nameKo} (GL: {food.calculatedGL})
            </Text>
          ))}
        </View>
        <View style={styles.mealFooter}>
          <Text style={styles.totalGL}>총 GL: {item.totalGL}</Text>
        </View>
        {item.notes && (
          <View style={styles.mealNotes}>
            <Text style={styles.notesText}>메모: {item.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 뷰 모드 선택 */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'day' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('day')}>
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'day' && styles.viewModeTextActive,
            ]}>
            일별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'week' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('week')}>
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'week' && styles.viewModeTextActive,
            ]}>
            주간
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'month' && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode('month')}>
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'month' && styles.viewModeTextActive,
            ]}>
            월간
          </Text>
        </TouchableOpacity>
      </View>

      {/* 캘린더 */}
      <CalendarView
        markedDates={getMarkedDates()}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <>
          {/* 일일 GL 진행바 */}
          {dailyStats && viewMode === 'day' && (
            <View style={styles.progressContainer}>
              <GLProgressBar currentGL={dailyStats.totalGL} targetGL={80} />
              {dailyStats.safetyBreakdown && (
                <View style={styles.safetyBreakdown}>
                  <Text style={styles.safetyBreakdownTitle}>안전도 분포</Text>
                  <View style={styles.safetyBreakdownRow}>
                    <View style={styles.safetyItem}>
                      <View
                        style={[
                          styles.safetyDot,
                          {backgroundColor: COLORS.SAFE},
                        ]}
                      />
                      <Text style={styles.safetyText}>
                        안전: {dailyStats.safetyBreakdown.safe}개
                      </Text>
                    </View>
                    <View style={styles.safetyItem}>
                      <View
                        style={[
                          styles.safetyDot,
                          {backgroundColor: COLORS.WARNING},
                        ]}
                      />
                      <Text style={styles.safetyText}>
                        위험: {dailyStats.safetyBreakdown.moderate}개
                      </Text>
                    </View>
                    <View style={styles.safetyItem}>
                      <View
                        style={[
                          styles.safetyDot,
                          {backgroundColor: COLORS.DANGER},
                        ]}
                      />
                      <Text style={styles.safetyText}>
                        매우 위험: {dailyStats.safetyBreakdown.highRisk}개
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 통계 차트 */}
          {viewMode === 'week' && weeklyStats && (
            <StatisticsChart periodStats={weeklyStats} chartType="line" />
          )}
          {viewMode === 'month' && monthlyStats && (
            <>
              <StatisticsChart periodStats={monthlyStats} chartType="line" />
              <StatisticsChart periodStats={monthlyStats} chartType="pie" />
            </>
          )}

          {/* 일별 식사 목록 */}
          {viewMode === 'day' && (
            <View style={styles.mealsContainer}>
              <Text style={styles.sectionTitle}>
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {selectedMeals.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon
                    name="restaurant"
                    size={48}
                    color={COLORS.TEXT_SECONDARY}
                  />
                  <Text style={styles.emptyText}>식사 기록이 없습니다</Text>
                  <Text style={styles.emptySubtext}>
                    카메라로 음식을 촬영하여 기록을 시작하세요
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={selectedMeals}
                  renderItem={renderMealItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* 주간/월간 요약 */}
          {(viewMode === 'week' || viewMode === 'month') && (
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>
                {viewMode === 'week' ? '주간' : '월간'} 요약
              </Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>평균 일일 GL</Text>
                  <Text style={styles.summaryValue}>
                    {(viewMode === 'week'
                      ? weeklyStats?.averageGL
                      : monthlyStats?.averageGL)?.toFixed(1) || 0}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>총 식사 수</Text>
                  <Text style={styles.summaryValue}>
                    {viewMode === 'week'
                      ? weeklyStats?.totalMeals
                      : monthlyStats?.totalMeals || 0}
                  </Text>
                </View>
                {viewMode === 'week' && weeklyStats && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>목표 달성 일수</Text>
                    <Text style={styles.summaryValue}>
                      {weeklyStats.dailyStats.filter((d) => d.totalGL <= 80)
                        .length}{' '}
                      / {weeklyStats.dailyStats.length}
                    </Text>
                  </View>
                )}
                {viewMode === 'month' && monthlyStats && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>목표 달성 일수</Text>
                    <Text style={styles.summaryValue}>
                      {monthlyStats.dailyStats.filter((d) => d.totalGL <= 80)
                        .length}{' '}
                      / {monthlyStats.dailyStats.length}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  viewModeTextActive: {
    color: COLORS.WHITE,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  progressContainer: {
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
  mealsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  mealItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  mealTime: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  deleteButton: {
    padding: 4,
  },
  mealFoods: {
    marginBottom: 12,
  },
  foodName: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  mealFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BACKGROUND,
    paddingTop: 12,
  },
  totalGL: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  mealNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BACKGROUND,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  safetyBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BACKGROUND,
  },
  safetyBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  safetyBreakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  safetyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  safetyText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default HistoryScreen;
