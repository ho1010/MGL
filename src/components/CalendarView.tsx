import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {COLORS} from '../constants';

interface CalendarViewProps {
  markedDates: {[key: string]: any};
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  markedDates,
  onDateSelect,
  selectedDate,
}) => {
  const handleDayPress = (day: DateData) => {
    onDateSelect(new Date(day.dateString));
  };

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const markedDatesWithSelected = {
    ...markedDates,
    [selectedDateString]: {
      ...markedDates[selectedDateString],
      selected: true,
      selectedColor: COLORS.PRIMARY,
      selectedTextColor: COLORS.WHITE,
    },
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDateString}
        onDayPress={handleDayPress}
        markedDates={markedDatesWithSelected}
        markingType="multi-dot"
        theme={{
          backgroundColor: COLORS.WHITE,
          calendarBackground: COLORS.WHITE,
          textSectionTitleColor: COLORS.TEXT_SECONDARY,
          selectedDayBackgroundColor: COLORS.PRIMARY,
          selectedDayTextColor: COLORS.WHITE,
          todayTextColor: COLORS.PRIMARY,
          dayTextColor: COLORS.TEXT_PRIMARY,
          textDisabledColor: COLORS.TEXT_SECONDARY,
          dotColor: COLORS.PRIMARY,
          selectedDotColor: COLORS.WHITE,
          arrowColor: COLORS.PRIMARY,
          monthTextColor: COLORS.TEXT_PRIMARY,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />
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
  calendar: {
    borderRadius: 12,
  },
});

export default CalendarView;
