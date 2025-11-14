import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {User, UserSettings} from '../types';
import {COLORS} from '../constants';
import ProfileEditModal from '../components/ProfileEditModal';
import NotificationSettings from '../components/NotificationSettings';
import {userSettingsService} from '../services/userSettingsService';
import {notificationService} from '../services/notificationService';
import {setUser, updateUser} from '../store/slices/userSlice';
import {Platform, Share} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const {theme} = useTheme();
  const {user} = useSelector((state: RootState) => state.user);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  useEffect(() => {
    loadUserData();
    notificationService.initialize();
  }, []);

  useEffect(() => {
    if (settings) {
      notificationService.scheduleMealTimeNotifications(settings);
    }
  }, [settings]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'default_user';
      const userSettings = await userSettingsService.getUserSettings(userId);
      setSettings(userSettings);
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (
    userData: Partial<User>,
    settingsData: Partial<UserSettings>,
  ) => {
    if (user) {
      await dispatch(updateUser({userId: user.id, userData}) as any);
    }
    if (settings) {
      const updatedSettings = {
        ...settings,
        ...settingsData,
      };
      await userSettingsService.saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
    }
  };

  const handleUpdateNotifications = async (
    notifications: Partial<UserSettings['notifications']>,
  ) => {
    if (!settings) return;
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        ...notifications,
      },
    };
    await userSettingsService.saveUserSettings(updated);
    setSettings(updated);
    notificationService.scheduleMealTimeNotifications(updated);
  };

  const handleBackup = async () => {
    try {
      const userId = user?.id || 'default_user';
      const backupData = await userSettingsService.backupAllData(userId);
      
      // Share API로 백업 데이터 공유
      await Share.share({
        message: backupData,
        title: '데이터 백업',
      });
    } catch (error: any) {
      Alert.alert('오류', error.message || '백업에 실패했습니다.');
    }
  };

  const handleRestore = () => {
    Alert.alert(
      '데이터 복원',
      '백업 파일을 선택하거나 붙여넣어주세요. 기존 데이터는 유지되고 백업 데이터가 추가됩니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '복원',
          onPress: async () => {
            // 실제로는 파일 선택 또는 텍스트 입력 모달 필요
            Alert.alert('알림', '복원 기능은 파일 선택 모달이 필요합니다.');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          dispatch(setUser(null));
          // 추가 로그아웃 로직
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  const currentUser = user || {
    id: 'default_user',
    email: 'user@example.com',
    name: '사용자',
    createdAt: new Date(),
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.BACKGROUND}]}>
      {/* 프로필 헤더 */}
      <View
        style={[
          styles.profileHeader,
          {backgroundColor: theme.colors.SURFACE, borderBottomColor: theme.colors.DIVIDER},
        ]}>
        <View
          style={[
            styles.avatarContainer,
            {backgroundColor: theme.colors.PRIMARY},
          ]}>
          <Icon name="person" size={48} color={theme.colors.WHITE} />
        </View>
        <Text
          style={[
            styles.userName,
            {color: theme.colors.TEXT_PRIMARY},
            theme.typography.h2,
          ]}>
          {currentUser.name}
        </Text>
        <Text
          style={[
            styles.userEmail,
            {color: theme.colors.TEXT_SECONDARY},
            theme.typography.body1,
          ]}>
          {currentUser.email}
        </Text>
        {currentUser.diabetesType && (
          <View
            style={[
              styles.diabetesTypeBadge,
              {backgroundColor: theme.colors.SURFACE_VARIANT},
            ]}>
            <Text
              style={[
                styles.diabetesTypeText,
                {color: theme.colors.PRIMARY},
                theme.typography.body2,
              ]}>
              {currentUser.diabetesType === 'type1' && '1형 당뇨'}
              {currentUser.diabetesType === 'type2' && '2형 당뇨'}
              {currentUser.diabetesType === 'prediabetes' && '전단계 당뇨'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.editButton,
            {
              borderColor: theme.colors.PRIMARY,
              backgroundColor: theme.colors.SURFACE,
            },
          ]}
          onPress={() => setShowEditModal(true)}>
          <Icon name="edit" size={20} color={theme.colors.PRIMARY} />
          <Text
            style={[
              styles.editButtonText,
              {color: theme.colors.PRIMARY},
              theme.typography.button,
            ]}>
            프로필 편집
          </Text>
        </TouchableOpacity>
      </View>

      {/* 목표 GL */}
      {settings && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.SURFACE,
              ...theme.shadows.lg,
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="flag" size={28} color={theme.colors.PRIMARY} />
            <Text
              style={[
                styles.cardTitle,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.h4,
              ]}>
              목표 일일 GL
            </Text>
          </View>
          <Text
            style={[
              styles.glTarget,
              {color: theme.colors.PRIMARY},
              theme.typography.display,
            ]}>
            {settings.dailyGLTarget}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.body2,
            ]}>
            현재 목표: {settings.dailyGLTarget} (기본값: 80)
          </Text>
        </View>
      )}

      {/* 테마 토글 */}
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>

      {/* 설정 메뉴 */}
      <View
        style={[
          styles.menuSection,
          {backgroundColor: theme.colors.SURFACE, borderTopColor: theme.colors.DIVIDER},
        ]}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            {borderBottomColor: theme.colors.DIVIDER},
          ]}
          onPress={() => setShowNotificationSettings(!showNotificationSettings)}>
          <View style={styles.menuItemLeft}>
            <Icon name="notifications" size={24} color={theme.colors.PRIMARY} />
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              알림 설정
            </Text>
          </View>
          <Icon
            name={showNotificationSettings ? 'expand-less' : 'expand-more'}
            size={24}
            color={theme.colors.TEXT_SECONDARY}
          />
        </TouchableOpacity>

        {showNotificationSettings && settings && (
          <View style={styles.notificationContainer}>
            <NotificationSettings
              settings={settings}
              onUpdate={handleUpdateNotifications}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.colors.DIVIDER}]}
          onPress={handleBackup}>
          <View style={styles.menuItemLeft}>
            <Icon name="backup" size={24} color={theme.colors.PRIMARY} />
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              데이터 백업
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.colors.DIVIDER}]}
          onPress={handleRestore}>
          <View style={styles.menuItemLeft}>
            <Icon name="restore" size={24} color={theme.colors.PRIMARY} />
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              데이터 복원
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.colors.DIVIDER}]}
          onPress={() => {
            // 음식 제안 모달 열기
            Alert.alert('알림', '음식 제안 기능은 별도 화면에서 구현됩니다.');
          }}>
          <View style={styles.menuItemLeft}>
            <Icon name="lightbulb-outline" size={24} color={theme.colors.PRIMARY} />
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.TEXT_PRIMARY},
                theme.typography.bodyLarge,
              ]}>
              음식 제안
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: theme.colors.DIVIDER}]}
          onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <Icon name="logout" size={24} color={theme.colors.DANGER} />
            <Text
              style={[
                styles.menuItemText,
                {color: theme.colors.DANGER},
                theme.typography.bodyLarge,
              ]}>
              로그아웃
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* 프로필 편집 모달 */}
      <ProfileEditModal
        visible={showEditModal}
        user={currentUser}
        settings={settings}
        onSave={handleSaveProfile}
        onClose={() => setShowEditModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 12,
  },
  diabetesTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  diabetesTypeText: {
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  editButtonText: {
    fontWeight: '600',
  },
  card: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  glTarget: {
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
  },
  themeToggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuSection: {
    marginTop: 8,
    borderTopWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontWeight: '500',
  },
  dangerText: {
    // 스타일은 인라인으로 적용
  },
  notificationContainer: {
    padding: 16,
  },
});

export default ProfileScreen;
