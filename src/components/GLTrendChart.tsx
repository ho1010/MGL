import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryChart, VictoryLine, VictoryAxis, VictoryArea} from 'victory-native';
import {COLORS} from '../constants';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;

interface GLTrendChartProps {
  data: Array<{date: string; gl: number; label: string}>;
  targetGL?: number;
}

const GLTrendChart: React.FC<GLTrendChartProps> = ({
  data,
  targetGL = 80,
}) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>데이터가 없습니다.</Text>
      </View>
    );
  }

  // Victory Native용 데이터 포맷
  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.gl,
    label: item.label,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GL 추이</Text>
      <View style={styles.chartContainer}>
        <VictoryChart
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          padding={{left: 50, right: 20, top: 20, bottom: 40}}>
          {/* 목표선 */}
          <VictoryLine
            data={[
              {x: 0, y: targetGL},
              {x: data.length + 1, y: targetGL},
            ]}
            style={{
              data: {
                stroke: COLORS.WARNING,
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
            }}
          />
          {/* GL 추이 영역 */}
          <VictoryArea
            data={chartData}
            style={{
              data: {
                fill: COLORS.PRIMARY,
                fillOpacity: 0.3,
                stroke: COLORS.PRIMARY,
                strokeWidth: 2,
              },
            }}
          />
          {/* GL 추이 선 */}
          <VictoryLine
            data={chartData}
            style={{
              data: {
                stroke: COLORS.PRIMARY,
                strokeWidth: 3,
              },
            }}
          />
          {/* X축 */}
          <VictoryAxis
            style={{
              axis: {stroke: COLORS.TEXT_SECONDARY},
              tickLabels: {fill: COLORS.TEXT_SECONDARY, fontSize: 10},
            }}
            tickFormat={(t) => {
              const item = data[t - 1];
              return item ? item.label : '';
            }}
          />
          {/* Y축 */}
          <VictoryAxis
            dependentAxis
            style={{
              axis: {stroke: COLORS.TEXT_SECONDARY},
              tickLabels: {fill: COLORS.TEXT_SECONDARY, fontSize: 10},
            }}
            domain={[0, Math.max(...chartData.map((d) => d.y), targetGL) * 1.2]}
          />
        </VictoryChart>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, {backgroundColor: COLORS.PRIMARY}]} />
            <Text style={styles.legendText}>일일 GL</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor: COLORS.WARNING,
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderColor: COLORS.WARNING,
                },
              ]}
            />
            <Text style={styles.legendText}>목표 ({targetGL})</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default GLTrendChart;

