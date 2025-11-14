import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryPie} from 'victory-native';
import {COLORS} from '../constants';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 80, 200);

interface SafetyRatioChartProps {
  data: Array<{x: string; y: number; color: string}>;
}

const SafetyRatioChart: React.FC<SafetyRatioChartProps> = ({data}) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>안전도별 섭취 비율</Text>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={data}
          width={CHART_SIZE}
          height={CHART_SIZE}
          colorScale={data.map((item) => item.color)}
          innerRadius={40}
          labelRadius={({innerRadius}) => (innerRadius || 0) + 30}
          style={{
            labels: {
              fill: COLORS.TEXT_PRIMARY,
              fontSize: 12,
              fontWeight: '600',
            },
          }}
          labelPlacement="perpendicular"
        />
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, {backgroundColor: item.color}]}
              />
              <Text style={styles.legendText}>
                {item.x}: {item.y.toFixed(1)}%
              </Text>
            </View>
          ))}
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
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  emptyContainer: {
    height: CHART_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default SafetyRatioChart;

