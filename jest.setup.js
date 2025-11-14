// Jest 설정 파일
// 테스트 환경 설정

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(() => () => {}),
}));

// Mock Image
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Image.getSize = jest.fn((uri, success, failure) => {
    success(100, 100);
  });
  return RN;
});

// 전역 타임아웃 설정
jest.setTimeout(10000);

