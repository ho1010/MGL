import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GLCalculationScreen from '../screens/GLCalculationScreen';
import SearchScreen from '../screens/SearchScreen';
import {FoodItem} from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  Camera: undefined;
  GLCalculation: {food: FoodItem};
  FoodDetail: {foodId: string};
  Search: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 메인 탭 네비게이터
const MainTabNavigator = () => {
  const {theme} = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.PRIMARY,
        tabBarInactiveTintColor: theme.colors.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: theme.colors.SURFACE,
          borderTopColor: theme.colors.DIVIDER,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: '기록',
          tabBarIcon: ({color, size}) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '프로필',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 메인 스택 네비게이터
const AppNavigator = () => {
  const {theme} = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.PRIMARY,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{title: '음식 촬영'}}
      />
      <Stack.Screen
        name="GLCalculation"
        component={GLCalculationScreen}
        options={{title: 'GL 계산'}}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{title: '음식 검색'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

