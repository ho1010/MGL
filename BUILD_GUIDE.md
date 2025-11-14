# 모바일 앱 빌드 가이드

이 가이드는 Management GL 앱을 Android 및 iOS용 모바일 앱으로 빌드하는 방법을 설명합니다.

## 📋 사전 요구사항

### 공통
- Node.js >= 18
- npm 또는 yarn
- Git

### Android
- Java Development Kit (JDK) 11 이상
- Android Studio
- Android SDK (API Level 21 이상)
- 환경 변수 설정:
  - `ANDROID_HOME` 또는 `ANDROID_SDK_ROOT`
  - `JAVA_HOME`

### iOS (macOS만)
- Xcode 14 이상
- CocoaPods
- macOS 12 이상

## 🚀 프로젝트 초기화

### 1. 의존성 설치

```bash
npm install
```

### 2. Android 프로젝트 초기화

Android 폴더가 없는 경우:

```bash
# React Native CLI로 Android 프로젝트 생성
npx react-native init ManagementGL --template react-native-template-typescript

# 또는 기존 프로젝트에 Android 추가
npx @react-native-community/cli init --skip-install
```

### 3. iOS 프로젝트 초기화 (macOS만)

```bash
cd ios
pod install
cd ..
```

## 📱 Android 앱 빌드

### 개발 빌드 (Debug)

```bash
# 개발용 APK 빌드
npm run build:android:debug

# 또는 Android Studio에서 실행
npm run android
```

빌드된 APK 위치:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 프로덕션 빌드 (Release)

1. **서명 키 생성** (최초 1회)

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **gradle.properties 설정**

`android/gradle.properties` 파일에 추가:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-store-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

3. **앱 서명 설정**

`android/app/build.gradle` 파일 확인:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Release APK 빌드**

```bash
npm run build:android
```

빌드된 APK 위치:
```
android/app/build/outputs/apk/release/app-release.apk
```

### AAB (Android App Bundle) 빌드

Google Play Store에 배포하려면 AAB 형식이 필요합니다:

```bash
cd android
./gradlew bundleRelease
```

빌드된 AAB 위치:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 🍎 iOS 앱 빌드 (macOS만)

### 개발 빌드

```bash
# 시뮬레이터에서 실행
npm run ios

# 특정 시뮬레이터 지정
npm run ios -- --simulator="iPhone 14 Pro"
```

### 프로덕션 빌드

1. **Xcode에서 프로젝트 열기**

```bash
open ios/ManagementGL.xcworkspace
```

2. **서명 설정**
   - Xcode에서 프로젝트 선택
   - Signing & Capabilities 탭
   - Team 선택 (Apple Developer 계정 필요)
   - Bundle Identifier 설정

3. **Archive 생성**

```bash
npm run build:ios
```

또는 Xcode에서:
- Product → Archive
- Archive 완료 후 Distribute App 선택

4. **IPA 파일 생성**
   - Archive Organizer에서 Archive 선택
   - Distribute App 클릭
   - 배포 방법 선택 (App Store, Ad Hoc, Enterprise 등)

## 🔧 환경 변수 설정

`.env` 파일 생성:

```env
API_BASE_URL=https://your-api-url.com
API_KEY=your-api-key
GOOGLE_VISION_API_KEY=your-google-vision-key
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

Android에서 사용하려면 `react-native-config` 패키지가 필요합니다:

```bash
npm install react-native-config
```

## 📦 앱 정보 설정

### Android

`android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
    <application
        android:label="혈당 관리"
        android:name=".MainApplication"
        ...>
        ...
    </application>
</manifest>
```

### iOS

`ios/ManagementGL/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>혈당 관리</string>
<key>CFBundleName</key>
<string>ManagementGL</string>
```

## 🚀 빠른 시작 (자동화 스크립트)

### Android 빌드 스크립트

`scripts/build-android.sh`:

```bash
#!/bin/bash
cd android
./gradlew clean
./gradlew assembleRelease
echo "APK 빌드 완료: android/app/build/outputs/apk/release/app-release.apk"
```

### iOS 빌드 스크립트

`scripts/build-ios.sh`:

```bash
#!/bin/bash
cd ios
pod install
cd ..
xcodebuild -workspace ios/ManagementGL.xcworkspace \
  -scheme ManagementGL \
  -configuration Release \
  -archivePath build/ManagementGL.xcarchive \
  archive
```

## 📱 테스트 빌드 설치

### Android

1. **USB 디버깅 활성화**
   - 설정 → 개발자 옵션 → USB 디버깅

2. **APK 설치**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **또는 직접 전송**
   - APK 파일을 기기로 전송
   - 파일 관리자에서 APK 열기
   - 설치 허용 (알 수 없는 출처)

### iOS

1. **TestFlight 사용** (권장)
   - App Store Connect에서 TestFlight 설정
   - 베타 테스터 초대

2. **Ad Hoc 배포**
   - Xcode에서 디바이스 UDID 등록
   - Ad Hoc 프로비저닝 프로파일 생성
   - IPA 파일 설치

## 🔍 문제 해결

### Android

**문제: Gradle 빌드 실패**
```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

**문제: 메타데이터 오류**
- `android/app/src/main/AndroidManifest.xml` 확인
- 패키지 이름 일치 확인

### iOS

**문제: Pod 설치 실패**
```bash
cd ios
pod deintegrate
pod install
```

**문제: 서명 오류**
- Xcode에서 Signing & Capabilities 확인
- Bundle Identifier 고유성 확인

## 📝 체크리스트

빌드 전 확인사항:

- [ ] 모든 의존성 설치 완료
- [ ] 환경 변수 설정 완료
- [ ] 앱 아이콘 설정
- [ ] 앱 이름 설정
- [ ] 버전 번호 설정
- [ ] 권한 설정 (카메라, 저장소 등)
- [ ] API 키 설정
- [ ] 테스트 완료

## 🎯 다음 단계

빌드 완료 후:

1. **앱 스토어 제출**
   - Google Play Store (Android)
   - App Store (iOS)

2. **배포**
   - 내부 테스트
   - 베타 테스트
   - 프로덕션 배포

3. **모니터링**
   - 크래시 리포팅
   - 사용자 피드백
   - 성능 모니터링

## 📞 도움말

문제가 발생하면:
1. React Native 공식 문서 확인
2. GitHub Issues 확인
3. Stack Overflow 검색

