import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {UserSettings} from '../types';
import {COLORS} from '../constants';

interface NotificationSettingsProps {
  settings: UserSettings;
  onUpdate: (notifications: Partial<UserSettings['notifications']>) => Promise<void>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [localSettings, setLocalSettings] = useState(settings.notifications);

  const handleToggle = async (key: keyof UserSettings['notifications'], value: boolean) => {
    const updated = {...localSettings, [key]: value};
    setLocalSettings(updated);
    await onUpdate(updated);
  };

  const handleMealTimeChange = async (mealType: string, time: string) => {
    const updated = {
      ...localSettings,
      mealTimes: {
        ...localSettings.mealTimes,
        [mealType]: time,
      },
    };
    setLocalSettings(updated);
    await onUpdate(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>알림 활성화</Text>
            <Text style={styles.settingDescription}>
              모든 알림의 활성/비활성 상태를 제어합니다
            </Text>
          </View>
          <Switch
            value={localSettings.enabled}
            onValueChange={(value) => handleToggle('enabled', value)}
            trackColor={{false: COLORS.BACKGROUND, true: COLORS.PRIMARY}}
            thumbColor={COLORS.WHITE}
          />
        </View>
      </View>

      {localSettings.enabled && (
        <>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>식사 시간 알림</Text>
                <Text style={styles.settingDescription}>
                  설정한 시간에 식사 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={localSettings.mealTimeReminder}
                onValueChange={(value) => handleToggle('mealTimeReminder', value)}
                trackColor={{false: COLORS.BACKGROUND, true: COLORS.PRIMARY}}
                thumbColor={COLORS.WHITE}
              />
            </View>
          </View>

          {localSettings.mealTimeReminder && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>식사 시간 설정</Text>
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                const mealLabels: {[key: string]: string} = {
                  breakfast: '아침',
                  lunch: '점심',
                  dinner: '저녁',
                  snack: '간식',
                };
                return (
                  <View key={mealType} style={styles.mealTimeRow}>
                    <Text style={styles.mealTimeLabel}>
                      {mealLabels[mealType]}
                    </Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH:mm"
                      value={localSettings.mealTimes?.[mealType as keyof typeof localSettings.mealTimes] || ''}
                      onChangeText={(text) =>
                        handleMealTimeChange(mealType, text)
                      }
                      keyboardType="default"
                    />
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>목표 GL 초과 알림</Text>
                <Text style={styles.settingDescription}>
                  일일 목표 GL을 초과할 때 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={localSettings.glExceedAlert}
                onValueChange={(value) => handleToggle('glExceedAlert', value)}
                trackColor={{false: COLORS.BACKGROUND, true: COLORS.PRIMARY}}
                thumbColor={COLORS.WHITE}
              />
            </View>
          </View>
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
  section: {
    backgroundColor: COLORS.WHITE,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  mealTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND,
  },
  mealTimeLabel: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    width: 80,
    textAlign: 'center',
  },
});

export default NotificationSettings;

