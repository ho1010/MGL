import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PeriodStats} from '../types';
import {generateGLTrendData, generateSafetyRatioData} from '../utils/statistics';
import GLTrendChart from './GLTrendChart';
import SafetyRatioChart from './SafetyRatioChart';
import {COLORS} from '../constants';

interface StatisticsChartProps {
  periodStats: PeriodStats;
  chartType: 'line' | 'bar' | 'pie';
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  periodStats,
  chartType,
}) => {
  if (chartType === 'line' || chartType === 'bar') {
    const trendData = generateGLTrendData(periodStats);
    return <GLTrendChart data={trendData} targetGL={80} />;
  }

  if (chartType === 'pie') {
    // 일일 통계를 합산하여 안전도 비율 계산
    const totalSafetyBreakdown = {
      safe: 0,
      moderate: 0,
      highRisk: 0,
    };

    periodStats.dailyStats.forEach((daily) => {
      totalSafetyBreakdown.safe += daily.safetyBreakdown.safe;
      totalSafetyBreakdown.moderate += daily.safetyBreakdown.moderate;
      totalSafetyBreakdown.highRisk += daily.safetyBreakdown.highRisk;
    });

    const ratioData = generateSafetyRatioData({
      date: periodStats.startDate,
      totalGL: 0,
      mealCount: 0,
      meals: [],
      safetyBreakdown: totalSafetyBreakdown,
    });

    return <SafetyRatioChart data={ratioData} />;
  }

  return null;
};

export default StatisticsChart;
