import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {UserSettings} from '../types';

/**
 * 알림 서비스
 * 로컬 푸시 알림 관리
 */
class NotificationService {
  private initialized = false;

  /**
   * 알림 초기화
   */
  initialize() {
    if (this.initialized) return;

    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // 채널 생성 (Android)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'gl-management',
          channelName: 'GL 관리 알림',
          channelDescription: '식사 시간 및 GL 초과 알림',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`채널 생성: ${created}`),
      );
    }

    this.initialized = true;
  }

  /**
   * 모든 알림 취소
   */
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * 식사 시간 알림 설정
   */
  scheduleMealTimeNotifications(settings: UserSettings) {
    this.cancelAllNotifications();

    if (!settings.notifications.enabled || !settings.notifications.mealTimeReminder) {
      return;
    }

    const mealTimes = settings.notifications.mealTimes;
    if (!mealTimes) return;

    const mealLabels: {[key: string]: string} = {
      breakfast: '아침 식사',
      lunch: '점심 식사',
      snack: '간식',
      dinner: '저녁 식사',
    };

    Object.entries(mealTimes).forEach(([mealType, timeStr]) => {
      if (!timeStr) return;

      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);

      // 오늘 시간이 지났으면 내일로 설정
      if (notificationTime < now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      PushNotification.localNotificationSchedule({
        id: `meal_${mealType}`,
        channelId: 'gl-management',
        title: '식사 시간 알림',
        message: `${mealLabels[mealType]} 시간입니다.`,
        date: notificationTime,
        repeatType: 'day',
        userInfo: {
          type: 'meal_reminder',
          mealType,
        },
      });
    });
  }

  /**
   * 목표 GL 초과 알림
   */
  showGLExceedAlert(currentGL: number, targetGL: number) {
    if (currentGL <= targetGL) return;

    PushNotification.localNotification({
      channelId: 'gl-management',
      title: '목표 GL 초과',
      message: `현재 GL: ${currentGL} (목표: ${targetGL})`,
      playSound: true,
      soundName: 'default',
      userInfo: {
        type: 'gl_exceed',
        currentGL,
        targetGL,
      },
    });
  }

  /**
   * 알림 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        resolve(permissions.alert === true);
      });
    });
  }
}

export const notificationService = new NotificationService();

