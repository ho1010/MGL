#!/bin/bash

# Android 프로젝트 초기화 스크립트

echo "🔧 Android 프로젝트 설정 시작..."

# React Native CLI 확인
if ! command -v npx &> /dev/null; then
    echo "❌ npx가 설치되어 있지 않습니다."
    echo "Node.js를 설치하세요: https://nodejs.org/"
    exit 1
fi

# Android 폴더가 이미 있는지 확인
if [ -d "android" ]; then
    echo "⚠️  android 폴더가 이미 존재합니다."
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# React Native 프로젝트 초기화
echo "📦 React Native 프로젝트 초기화 중..."
npx react-native init ManagementGL --template react-native-template-typescript --skip-install

if [ $? -eq 0 ]; then
    echo "✅ Android 프로젝트 생성 완료!"
    echo "📝 다음 단계:"
    echo "1. npm install"
    echo "2. android 폴더의 내용을 프로젝트 루트로 복사"
    echo "3. android/app/src/main/AndroidManifest.xml 설정 확인"
else
    echo "❌ 프로젝트 초기화 실패"
    exit 1
fi

