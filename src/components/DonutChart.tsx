import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {VictoryPie} from 'victory-native';
import {useTheme} from '../contexts/ThemeContext';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 80, 200);

interface DonutChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({data, total}) => {
  const {theme} = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, {color: theme.colors.TEXT_SECONDARY}]}>
          데이터가 없습니다.
        </Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    x: item.label,
    y: item.value,
    label: `${item.percentage}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData}
          width={CHART_SIZE}
          height={CHART_SIZE}
          colorScale={data.map((item) => item.color)}
          innerRadius={60}
          labelRadius={({innerRadius}) => (innerRadius || 0) + 25}
          style={{
            labels: {
              fill: theme.colors.TEXT_PRIMARY,
              fontSize: 11,
              fontWeight: '600',
            },
          }}
          labelPlacement="perpendicular"
        />
        <View style={styles.centerLabel}>
          <Text style={[styles.centerValue, {color: theme.colors.TEXT_PRIMARY}]}>
            총
          </Text>
          <Text style={[styles.centerTotal, {color: theme.colors.PRIMARY}]}>
            {total}
          </Text>
        </View>
      </View>
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, {backgroundColor: item.color}]}
            />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, {color: theme.colors.TEXT_PRIMARY}]}>
                {item.label}
              </Text>
              <Text style={[styles.legendValue, {color: theme.colors.TEXT_SECONDARY}]}>
                {item.value} ({item.percentage}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: CHART_SIZE / 2 - 30,
    left: CHART_SIZE / 2 - 40,
    width: 80,
    height: 60,
  },
  centerValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  centerTotal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  legendContainer: {
    width: '100%',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default DonutChart;

