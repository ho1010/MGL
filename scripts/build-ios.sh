#!/bin/bash

# iOS 앱 빌드 스크립트 (macOS만)

echo "🚀 iOS 앱 빌드 시작..."

# macOS 확인
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ iOS 빌드는 macOS에서만 가능합니다."
    exit 1
fi

# 디렉토리 확인
if [ ! -d "ios" ]; then
    echo "❌ ios 폴더를 찾을 수 없습니다."
    echo "프로젝트를 초기화하세요: npx react-native init ManagementGL"
    exit 1
fi

# CocoaPods 설치 확인
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods가 설치되어 있지 않습니다."
    echo "설치: sudo gem install cocoapods"
    exit 1
fi

# Pod 설치
echo "📦 CocoaPods 의존성 설치 중..."
cd ios
pod install

if [ $? -ne 0 ]; then
    echo "❌ Pod 설치 실패"
    exit 1
fi

# Archive 빌드
echo "📦 Archive 빌드 중..."
xcodebuild -workspace ManagementGL.xcworkspace \
  -scheme ManagementGL \
  -configuration Release \
  -archivePath build/ManagementGL.xcarchive \
  archive

if [ $? -eq 0 ]; then
    echo "✅ Archive 빌드 성공!"
    echo "📱 Archive 위치: ios/build/ManagementGL.xcarchive"
    echo "💡 Xcode에서 Archive Organizer를 열어 IPA를 생성하세요."
else
    echo "❌ Archive 빌드 실패"
    exit 1
fi

cd ..

