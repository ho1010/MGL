import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';
import {GL_SAFETY_COLORS} from '../theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {theme} = useTheme();
  const cameraButtonScale = React.useRef(new Animated.Value(1)).current;
  const searchButtonScale = React.useRef(new Animated.Value(1)).current;

  const handleCameraPressIn = () => {
    Animated.spring(cameraButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleCameraPressOut = () => {
    Animated.spring(cameraButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchPressIn = () => {
    Animated.spring(searchButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchPressOut = () => {
    Animated.spring(searchButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.BACKGROUND},
      ]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.TEXT_PRIMARY}]}>
          혈당 관리
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.TEXT_SECONDARY}]}>
          음식 사진으로 GL을 확인하세요
        </Text>
      </View>

      {/* 메인 버튼 영역 */}
      <View style={styles.mainButtonsContainer}>
        {/* 카메라 버튼 (중앙 배치) */}
        <Animated.View
          style={[
            styles.cameraButtonWrapper,
            {transform: [{scale: cameraButtonScale}]},
          ]}>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              {
                backgroundColor: theme.colors.PRIMARY,
                ...theme.shadows.xl,
              },
            ]}
            onPress={() => navigation.navigate('Camera')}
            onPressIn={handleCameraPressIn}
            onPressOut={handleCameraPressOut}
            activeOpacity={0.9}>
            <View style={styles.cameraIconContainer}>
              <Icon name="camera-alt" size={64} color={theme.colors.WHITE} />
            </View>
            <Text style={[styles.cameraButtonText, {color: theme.colors.WHITE}]}>
              음식 촬영
            </Text>
            <Text
              style={[
                styles.cameraButtonSubtext,
                {color: theme.colors.WHITE, opacity: 0.9},
              ]}>
              사진을 찍어 GL을 확인하세요
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 검색 버튼 */}
        <Animated.View
          style={[
            styles.searchButtonWrapper,
            {transform: [{scale: searchButtonScale}]},
          ]}>
          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.PRIMARY,
                ...theme.shadows.lg,
              },
            ]}
            onPress={() => navigation.navigate('Search')}
            onPressIn={handleSearchPressIn}
            onPressOut={handleSearchPressOut}
            activeOpacity={0.9}>
            <Icon
              name="search"
              size={40}
              color={theme.colors.PRIMARY}
              style={styles.searchIcon}
            />
            <Text
              style={[styles.searchButtonText, {color: theme.colors.PRIMARY}]}>
              음식 검색
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 안전도 가이드 */}
      <View
        style={[
          styles.safetyGuide,
          {
            backgroundColor: theme.colors.SURFACE,
            ...theme.shadows.md,
          },
        ]}>
        <Text
          style={[
            styles.safetyGuideTitle,
            {color: theme.colors.TEXT_PRIMARY},
          ]}>
          GL 안전도 가이드
        </Text>
        <View style={styles.safetyGuideItems}>
          <View style={styles.safetyGuideItem}>
            <View
              style={[
                styles.safetyDot,
                {backgroundColor: GL_SAFETY_COLORS.SAFE},
              ]}
            />
            <Text style={[styles.safetyText, {color: theme.colors.TEXT_PRIMARY}]}>
              안전 (10 이하)
            </Text>
          </View>
          <View style={styles.safetyGuideItem}>
            <View
              style={[
                styles.safetyDot,
                {backgroundColor: GL_SAFETY_COLORS.MODERATE},
              ]}
            />
            <Text style={[styles.safetyText, {color: theme.colors.TEXT_PRIMARY}]}>
              위험 (11-19)
            </Text>
          </View>
          <View style={styles.safetyGuideItem}>
            <View
              style={[
                styles.safetyDot,
                {backgroundColor: GL_SAFETY_COLORS.HIGH_RISK},
              ]}
            />
            <Text style={[styles.safetyText, {color: theme.colors.TEXT_PRIMARY}]}>
              매우 위험 (20 이상)
            </Text>
          </View>
        </View>
      </View>

      {/* 정보 섹션 */}
      <View
        style={[
          styles.infoSection,
          {
            backgroundColor: theme.colors.SURFACE,
            ...theme.shadows.md,
          },
        ]}>
        <View style={styles.infoHeader}>
          <Icon
            name="info"
            size={24}
            color={theme.colors.PRIMARY}
            style={styles.infoIcon}
          />
          <Text
            style={[styles.infoTitle, {color: theme.colors.TEXT_PRIMARY}]}>
            GL이란?
          </Text>
        </View>
        <Text style={[styles.infoText, {color: theme.colors.TEXT_SECONDARY}]}>
          혈당부하지수(Glycemic Load)는 음식이 혈당에 미치는 실제 영향을
          나타내는 지표입니다.
        </Text>
        <Text
          style={[
            styles.infoFormula,
            {color: theme.colors.PRIMARY, fontWeight: '600'},
          ]}>
          GL = (GI × 탄수화물) ÷ 100
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  mainButtonsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  cameraButtonWrapper: {
    width: '100%',
  },
  cameraButton: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  cameraIconContainer: {
    marginBottom: 16,
  },
  cameraButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cameraButtonSubtext: {
    fontSize: 16,
  },
  searchButtonWrapper: {
    width: '100%',
  },
  searchButton: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  safetyGuide: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  safetyGuideTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  safetyGuideItems: {
    gap: 12,
  },
  safetyGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  safetyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoIcon: {
    marginRight: 4,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  infoFormula: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
