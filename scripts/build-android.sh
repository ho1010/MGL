#!/bin/bash

# Android 앱 빌드 스크립트

echo "🚀 Android 앱 빌드 시작..."

# 디렉토리 확인
if [ ! -d "android" ]; then
    echo "❌ android 폴더를 찾을 수 없습니다."
    echo "프로젝트를 초기화하세요: npx react-native init ManagementGL"
    exit 1
fi

# Gradle 권한 확인
chmod +x android/gradlew

# Clean 빌드
echo "🧹 이전 빌드 파일 정리..."
cd android
./gradlew clean

# Release APK 빌드
echo "📦 Release APK 빌드 중..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    echo "📱 APK 위치: android/app/build/outputs/apk/release/app-release.apk"
    
    # APK 파일 크기 확인
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📊 APK 크기: $SIZE"
    fi
else
    echo "❌ 빌드 실패"
    exit 1
fi

cd ..

